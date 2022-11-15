import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { GraphQLModule } from '@nestjs/graphql';
import {GraphQLModule} from '@nestjs/graphql';

import { BookmarksModule } from './bookmarks/bookmarks.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // playground: { settings: { 'request.credentials': 'include' } },
    }),
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   // plugins: [ApolloServerPluginLandingPageLocalDefault()],
    //   typePaths: ['./**/*.graphql'],
    //   definitions: {
    //     path: join(process.cwd(), 'src/types/graphql.ts'),
    //     outputAs: 'class',
    //   },
    // }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/types/graphql.ts'),
        outputAs: 'class',
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    BookmarksModule,
    AuthModule,
    PrismaModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// https://progressivecoder.com/how-to-create-your-first-nestjs-graphql-application/

/*
"@nestjs/graphql": "^10.1.6",
    "graphql": "^16.6.0",
    "graphql-tools": "^8.3.12",
*/
