import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ForgotPasswordDto,
  LoginDTO,
  RegisterDTO,
  ResendOtpDto,
  VerifyOtpDTO,
} from './dtos';
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
  // ************************** PUBLIC METHODS  **************************************

  // ************* REGISTER **************
  async register(registerDTO: RegisterDTO, response: Response) {
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
      const status = await this.generateAndSendOTP(user.email);
      if (status) {
        return response.status(201).json({
          message: `An OTP has been sent to ${user.email}`,
          expiresIn: 3600,
        });
      }

      return response.status(200).json({
        message: 'User Created',
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
  // ************* LOGIN ************
  async login(loginDTO: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDTO.email,
      },
    });

    if (!user) {
      throw new NotFoundException('No user found.');
    }
    // TODO: For security reasons, change to `User not found`
    if (!user.isActivated) {
      throw new UnauthorizedException('OTP not activated.');
    }
    const pwMatch = await argon.verify(user.hash, loginDTO.password);
    if (!pwMatch) {
      throw new ForbiddenException('Incorrect credentials');
    }
    const token = await this.generateToken(user.email, user.id);
    return {
      ...token,
      ...user,
    };
  }
  // ************* Verify OTP ************
  async verifyOTP(dto: VerifyOtpDTO, response: Response) {
    const verification = await this.prisma.verification.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!verification) {
      throw new NotFoundException('No OTP was assigned to this email address.');
    }
    if (new Date() >= verification.expiry) {
      throw new ForbiddenException('OTP code has expired.');
    }
    const hashMatch = await argon.verify(verification.code, dto.code);
    if (!hashMatch) {
      throw new NotFoundException('OTP code does not match.');
    }
    if (hashMatch && new Date() < verification.expiry) {
      // Update User Status
      const user = await this.prisma.user.update({
        where: {
          email: dto.email,
        },
        data: {
          isActivated: true,
        },
      });
      await this.prisma.verification.delete({
        where: {
          email: dto.email,
        },
      });
      return response.status(200).json({
        message: 'Verification successful, Login to Continue.',
      });
    }

    throw new NotFoundException();
  }

  async resendOtp(dto: ResendOtpDto, response: Response) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new NotFoundException('No user found.');
    }
    if (user.isActivated) {
      throw new ForbiddenException(
        `User's account has already been activated.`,
      );
    }
    const verification = await this.prisma.verification.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!verification) {
      throw new NotFoundException(`No OTP was generated for ${dto.email}`);
    }
    await this.prisma.verification.delete({
      where: {
        email: dto.email,
      },
    });
    const status = await this.generateAndSendOTP(dto.email);
    if (status) {
      return {
        message: `A new OTP code has been sent to ${dto.email}`,
      };
    }

    throw new BadRequestException('Failed to generate new OTP code.');
  }
  // ****************** Forgot Password********************************

  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if(!user){
        throw new NotFoundException('Email does not exist.')
      }
      // * Send OTP
      
    } catch (error) {
      throw new Error(error);
    }
  }

  async getOtpTable() {
    return await this.prisma.verification.findMany();
  }
  async deleteOtpTable() {
    return await this.prisma.verification.deleteMany();
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

  async generateAndSendOTP(email: string): Promise<{ status: boolean }> {
    try {
      // *************** Code should be generated with a valid library ****************
      const code = '1234';
      const hashed = await argon.hash(code);
      const verification = await this.prisma.verification.create({
        data: {
          code: hashed,
          email,
          expiry: this.addMinutesToDate(new Date(), 1),
        },
      });
      console.log(
        verification.code,
        verification.email,
        verification.expiry,
        verification.id,
      );
      //* SEND Mail with NodeMailer.
      return { status: true };
    } catch (error) {
      console.log(`Error Creating User: ${error}`);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`A user with ${email} already exists.`);
      }
      throw new Error(error);
    }
  }
}

// https://www.pdfdrive.com/how-they-started-how-25-good-ideas-became-great-companies-d157631125.html
