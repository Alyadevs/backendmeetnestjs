// import { Module } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { UsersModule } from '../users/user.module';
// import { JwtModule } from '@nestjs/jwt';
// import * as dotenv from 'dotenv';

// dotenv.config();

// @Module({
//   imports: [
//     UsersModule,
//     JwtModule.register({
//       secret: 'yawedi',
//       signOptions: {
//         algorithm: 'HS256',
//       },
//     }),
//   ],
//   providers: [AuthService],
//   controllers: [AuthController],
// })
// export class AuthModule {}
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UsersModule } from '../users/user.module';
import { MailModule } from '../mailjs/mail.module';

import { ResetToken, ResetTokenSchema } from './reset-token.schema';
import { User, UserSchema } from '../users/user';

@Module({
  imports: [
    ConfigModule,

    UsersModule,

    MailModule,

    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: ResetToken.name,
        schema: ResetTokenSchema,
      },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'yawedi'),

        signOptions: {
          algorithm: 'HS256',
          expiresIn: '7d',
        },
      }),
    }),
  ],

  providers: [AuthService],

  controllers: [AuthController],

  exports: [AuthService],
})
export class AuthModule {}
