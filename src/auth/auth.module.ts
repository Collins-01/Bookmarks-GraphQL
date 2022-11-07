import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthService],
  imports: [PrismaModule,JwtModule.register({})],
  controllers: [AuthController]
})
export class AuthModule {}
