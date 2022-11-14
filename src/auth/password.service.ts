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
