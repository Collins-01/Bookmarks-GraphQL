import { Controller, Get, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JWTGuard } from 'src/auth/guards';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getUser(@GetUser() user: User, request: Request) {
    type userWithoutHash = Omit<User, 'hash'>;
      const{hash,...rest} = user;
    return {
      rest
    };
  }

  @Patch('update')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete('delete')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
