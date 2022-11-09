import { Body, Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO, ResendOtpDto, VerifyOtpDTO } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
   register(@Body() registerDTO: RegisterDTO, @Res() response:Response) {
    return  this.authService.register(registerDTO, response);
  }
  @Post('login')
   login(@Body() loginDTO:LoginDTO) {
    return  this.authService.login(loginDTO);
  }
  @Post('otp/verify')
  verifyOtp(@Body() dto:VerifyOtpDTO, @Res() response:Response){
    return this.authService.verifyOTP(dto, response);
  }

  @Post('otp/resend')
  resendOtp(@Body() dto:ResendOtpDto, @Req() response:Response){
    return this.authService.resendOtp(dto, response );
  }

  @Get('otp/all')
  getOtpTable(){
    return this.authService.getOtpTable();
  }
  @Delete('otp/all')
  deleteOtpTable(){
    return this.authService.deleteOtpTable();
  }
}
