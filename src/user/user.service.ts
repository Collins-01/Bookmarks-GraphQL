import { Injectable } from '@nestjs/common';

import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  

  findAll() {
    return `This action returns all user`;
  }

  findOne() {
    return `This action returns a } user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

// https://javascript.plainenglish.io/oauth2-in-nestjs-for-social-login-google-facebook-twitter-etc-8b405d570fd2