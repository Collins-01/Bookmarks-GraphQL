import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO, RegisterDTO } from './dtos';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Response } from 'express';
import { User } from '@prisma/client';
import { OTPService } from './otp.service';
import { Token } from './models';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private otpService: OTPService,
  ) {}

  // ***** Validate User*****

  validateUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

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
      await this.otpService.generateOTP(user.email);

      return response.status(201).json({
        message: `An OTP has been sent to ${user.email}`,
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
   getUserFromToken(token: string): Promise<User | null> {
    // const id = this.jwt.decode(token)['userId'];
    const json = this.jwt.decode(token);
    const id = '';
    

    // const id = this.jwt.decode(token)['userId'];
    // const payload: string decoded['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }
  // async logOut() {}
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
    const payload = {
      userId: user.id,
      email: user.email,
    };
    const token = this.generateTokens(payload);

    const {hash,...rest} = user;
    return {
      ...token,
      ...rest,
    };
  }

  generateTokens(payload: { userId: string; email: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }
  refreshToken(token: string) {
    try {
      const { userId, email } = this.jwt.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        userId,
        email,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private generateAccessToken(payload: {
    userId: string;
    email: string;
  }): string {
    return this.jwt.sign(payload);
  }

  private generateRefreshToken(payload: {
    userId: string;
    email: string;
  }): string {
    return this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN'),
    });
  }
}

// https://www.pdfdrive.com/how-they-started-how-25-good-ideas-became-great-companies-d157631125.html
