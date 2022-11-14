import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { google, Auth } from 'googleapis';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly config: ConfigService,
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}
  //   oauthClient: Auth.OAuth2Client;
  clientID = this.config.get('GOOGLE_AUTH_CLIENT_ID');
  clientSecret = this.config.get('GOOGLE_AUTH_CLIENT_SECRET');

  oauthClient = new google.auth.OAuth2({
    clientId: this.clientID,
    clientSecret: this.clientSecret,
    redirectUri: 'http://localhost:3000/auth/google/redirect',
  });

  async authenticate(token: string) {
    const tokenInfo = await this.oauthClient.getTokenInfo(token);

    const email = tokenInfo.email;

    try {
      if (!email) {
        throw new NotFoundException();
      }
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        return this.registerUser(token, email);
      }
      return this.handleRegisteredUser(user);
    } catch (error) {
      console.log(`Error From Google Authenticate: ${error}`);

      throw new Error(error);
    }
  }

  async registerUser(token: string, email: string) {
    const userData = await this.getUserData(token);
    const name = userData.name;

    // const user = await this.usersService.createWithGoogle(email, name);

    // return this.handleRegisteredUser(user);

    try {
      const user = await this.prisma.user.create({
        data: {
          age: 5,
          email: email,
          isActivated: true,
          hash: ''
          
        },
      });
    } catch (error) {}
  }
  async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;

    this.oauthClient.setCredentials({
      access_token: token,
    });

    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });

    return userInfoResponse.data;
  }

  async handleRegisteredUser(user: User) {
    //* Sign JWt
    const payload = { userId: user.id, email: user.email };

    return this.authService.generateTokens(payload);
  }
}
