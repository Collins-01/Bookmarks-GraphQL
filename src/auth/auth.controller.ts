import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { AuthService } from './auth.service';

import {
  ForgotPasswordDto,
  LoginDTO,
  RegisterDTO,
  ResendOtpDto,
  UpdatePasswordDto,
  VerifyOtpDTO,
} from './dtos';
import { GoogleGuard } from './guards';
import { OTPService } from './otp.service';
import { PasswordService } from './password.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private passwordService: PasswordService,
    private otpService: OTPService,
  ) {}

  @Post('register')
  register(@Body() registerDTO: RegisterDTO, @Res() response: Response) {
    return this.authService.register(registerDTO, response);
  }
  @Post('login')
  login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO);
  }
  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDTO, @Res() response: Response) {
    return this.otpService.verifyOTP(dto, response);
  }

  @Post('otp/resend')
  resendOtp(@Body() dto: ResendOtpDto, @Req() response: Response) {
    return this.otpService.resendOtp(dto, response);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordService.forgotPassword(dto);
  }

  @Get('otp/all')
  getOtpTable() {
    return this.otpService.getOtpTable();
  }
  @Delete('otp/all')
  deleteOtpTable() {
    return this.otpService.deleteOtpTable();
  }

 
  @Post('resfresh-token')
  refreshToken(@Body() token: string) {
    return this.authService.refreshToken(token);
  }

  @Get('user')
  async getUser() {
    return this.authService.getUserFromToken('');
  }

  // **************** social authentications ****************

  @Get('google')
  googleAuth(@Req() request:Request) {
    console.log(request.path);
  }

  @UseGuards(GoogleGuard)
  @Get('google/redirect')
  googleAuthRedirect(@Req() request:Request){
    return this.authService.googleAuthRedirect(request);

  }





  @Post('facebook')
  facebookAuth() {}

  @Post('apple')
  appleAuth() {}
}
