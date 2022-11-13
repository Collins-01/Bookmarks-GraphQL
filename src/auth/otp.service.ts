import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ResendOtpDto, VerifyOtpDTO } from './dtos';
import { Response } from 'express';

@Injectable()
export class OTPService {
  constructor(private prisma: PrismaService) {}
  addMinutesToDate(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

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

  async generateOTP(email: string): Promise<{ status: boolean }> {
    try {
      const code = '1234';
      const hashed = await argon.hash(code);
    //   Check If User already has been assigned OTP
      const verification= await this.prisma.verification.findUnique({
        where: {
            email: email
        }
      })
      if(verification){
        throw new ForbiddenException(`An OTP has already been sent to ${email}, please wait until it expires, or try resend OTP.`)
      }
      const data = {
        code: hashed,
        email,
        expiry: this.addMinutesToDate(new Date(), 1),
      }
        await this.prisma.verification.create({
            data: { ...data}
        })

        return {status: true};

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
    const status = await this.generateOTP(dto.email);
    if (status) {
      return {
        message: `A new OTP code has been sent to ${dto.email}`,
      };
    }

    throw new BadRequestException('Failed to generate new OTP code.');
  }

  async getOtpTable() {
    return await this.prisma.verification.findMany();
  }
  async deleteOtpTable() {
    return await this.prisma.verification.deleteMany();
  }
}
