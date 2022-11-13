import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgotPasswordDto, UpdatePasswordDto } from './dtos';
import * as argon from 'argon2';
import { Response } from 'express';

@Injectable()
export class PasswordService {
  constructor(private prisma: PrismaService) {}

  async updatePassword(dto: UpdatePasswordDto, email: string, response:Response) {
    console.log(`Update Email:::: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new NotFoundException('No user with this email address.');
    }
    const hashMatch = await argon.verify(user.hash, dto.oldPassword);
    if (!hashMatch) {
      throw new ForbiddenException('Old Password do not match.');
    }
    const hashMatchNewPassword = await argon.verify(dto.newPassword, user.hash);
    if (hashMatchNewPassword) {
      throw new ForbiddenException(
        'Old and new passwords can not be the same.',
      );
    }
    const newHash = await argon.hash(dto.newPassword);

    try {
      const iUser = await this.prisma.user.update({
        where: {
          email,
        },
        data: {
          hash: newHash,
        },
      });
      return  {
        message :'Opor'
      }
      
    } catch (error) {
      throw new Error(error);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (!user) {
        throw new NotFoundException('Email does not exist.');
      }
      // * Send OTP
    } catch (error) {
      throw new Error(error);
    }
  }
}
