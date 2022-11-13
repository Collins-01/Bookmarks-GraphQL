import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JWTGuard } from 'src/auth/guards';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

import { UpdatePasswordDto } from 'src/auth/dtos';
import { Response } from 'express';

@UseGuards(JWTGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getUser(@GetUser() user: User, @Res() response: Response) {
    const { hash,isActivated, ...rest } = user;
    return response.status(200).json({
      status: true,
      data: {
        ...rest
      }
    })
  }

  
  @Patch('update-password')
  updatePassword(@Body() dto:UpdatePasswordDto, @Res() response: Response, @GetUser() user: User) {
    return this.userService.updatePassword(dto,user.email,response)
  }
}
