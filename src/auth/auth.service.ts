import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO, RegisterDTO, VerifyOtpDTO } from './dtos';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async register(registerDTO: RegisterDTO, response: Response){
    try {
      const hashedPassword = await argon.hash(registerDTO.password);
      console.log(`Hashed Password ${hashedPassword}`);
      const user = await this.prisma.user.create({
        data: {
          age: registerDTO.age,
          email: registerDTO.email,
          hash: hashedPassword,
          isSubscribed: false,
        },
        select: {
          age: true,
          email: true,
          id: true,
          isSubscribed: true,
        },
      });
      // *SEND OTP TO EMAIL/PHONE NUMBER.
      const  status = await this.generateAndSendOTP(user.email);
      if(status){
        return response.status(201).json({
          message: `An OTP has been sent to ${user.email}`,
          expiresIn: 3600,
        });
      }
      return response.status(201).json({
        message: `User Created`,
        expiresIn: 3600,
      });

      
    } catch (error) {
      // * Handle Errors
      console.log(`Error Creating User: ${error}`);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `A user with ${registerDTO.email} already exists.`,
        );
      }
      throw new Error(error);
    }
  }
  async login(loginDTO: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDTO.email,
      },
    });

    if (!user) {
      throw new NotFoundException('No user found.');
    }
    if (!user.isActivated) {
      throw new NotFoundException('OTP not activated.');
    }
    const pwMatch = await argon.verify(user.hash, loginDTO.password);
    if (!pwMatch) {
      throw new ForbiddenException('Incorrect credentials');
    }

    return {
      ...user,
    };
  }

  async verifyOTP(dto: VerifyOtpDTO, response: Response) {
    const verification = await this.prisma.verification.findUnique({
      where: {
        code: dto.email,
      },
    });

    if (!verification) {
      throw new NotFoundException('No OTP was assigned to this email address.');
    }
    if (verification.expiry) {
      return response.status(400).json({ message: 'OTP code has expired.' });
    }
    const hashMatch = await argon.verify(verification.code, dto.code);
    if (!hashMatch) {
      return response.status(404).json({
        message: 'OTP code does not match.',
      });
    }

    if (hashMatch && verification.issued < verification.expiry) {
      // Update User Status
      const user = await this.prisma.user.update({
        where: {
          email: dto.email,
        },
        data: {
          isActivated: true,
        },
      });

      return response.status(200).json({
        message: 'Account verrified successfully, login to continue.',
      });
    }

    throw new NotFoundException();
  }

  async resendOtp(email:string, response: Response){
    const user= await this.prisma.user.findUnique({
      where: {
        email,
      }
    })
    if(!user){
      throw new NotFoundException('No user found.')
    }
    if(user.isActivated){
      return response.status(400).json({
        message: `User's account has already been activated.`
      })
    }
    const verification= await this.prisma.verification.findUnique({
      where:{
        email
      }
    })
    if(!verification){
      throw new NotFoundException(`No OTP was generate for ${email}`)
    }
    const deletedVerification = await this.prisma.verification.delete({
      where:{
        email,
      }
    })
    const status= await this.generateAndSendOTP(email);
    if(status){
      response.status(200).json({
        message: `A new OTP code has been sent to ${email}`
      })
    }
  }

  // *************************  Private Methods   ***************************************
  async generateToken(
    email: string,
    id: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      email,
      sub: id,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: 'secret',
    });
    return { access_token: token };
  }
  addMinutesToDate(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  async generateAndSendOTP(email: string): Promise<{status:boolean}> {
    try {
      const code = '12345';
      const hashed = await argon.hash(code);
      const verification = await this.prisma.verification.create({
        data: {
          code: hashed,
          email,
          expiry: this.addMinutesToDate(new Date(), 2),
          issued:this.addMinutesToDate(new Date(), 2),
        },
      });
      console.log(verification.code, verification.email, verification.issued,verification.expiry,verification.id);
      //* SEND Mail with NodeMailer.
      return { status: true }
    } catch (error) {
      throw new Error(error);
    }
  }
}
