import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ForgotPasswordDto, UpdatePasswordDto } from "./dtos";
import * as argon from 'argon2';

@Injectable()
export class PasswordService {
  constructor(private prisma: PrismaService) {}
         
  
  async updatePassword(dto: UpdatePasswordDto, email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new NotFoundException('No user with this email address.');
    }
    const hashMatch = await argon.verify(dto.oldPassword, user.hash);
    if (!hashMatch) {
      throw new ForbiddenException('Old Passwords do not match.');
    }
    const hashMatchNewPassword = await argon.verify(dto.newPassword, user.hash);
    if (hashMatchNewPassword) {
      throw new ForbiddenException(
        'Old and new passwords can not be the same.',
      );
    }
    const newHash = await argon.hash(dto.newPassword);

    const iUser = await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        hash: newHash,
      },
    });
    if (iUser) {
      return {
        message: `Password updated successfully.`,
      };
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
