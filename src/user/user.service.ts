import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePasswordDto } from 'src/auth/dtos';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

 

  async updatePassword(
    dto: UpdatePasswordDto,
    email: string,
    response: Response,
  ) {
    // console.log(`Update Email:::: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new NotFoundException('No user with this email address.');
    }
    console.log(`User Has : ${user.hash}`)
    // const hashMatch = await argon.verify(user.hash, dto.oldPassword);
    // console.log(`Has Password Match :: ${hashMatch}`);
    // if (!hashMatch) {
    //   throw new ForbiddenException('Old Password do not match.');
    // }
    // const sameAsOldPassword = await argon.verify(user.hash, dto.newPassword);
    // if (sameAsOldPassword) {
    //   throw new ForbiddenException(
    //     'Old and new passwords can not be the same.',
    //   );
    // }
    // const newHash = await argon.hash(dto.newPassword);
    //  await this.prisma.user.update({
    //   where: {
    //     email,
    //   },
    //   data: {
    //     hash: newHash,
    //   },
    // });

    // return response.status(200).json({
    //   status: true,
    //   message: 'Password updated successfully',

    // })
  }
}

// https://javascript.plainenglish.io/oauth2-in-nestjs-for-social-login-google-facebook-twitter-etc-8b405d570fd2
