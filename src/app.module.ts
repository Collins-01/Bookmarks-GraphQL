import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from './users/users.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    // GraphQLModule.forRoot({
    //   autoSchemaFile: true,
    // }),
    UsersModule,
    BookmarksModule,
    AuthModule,
    PrismaModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
