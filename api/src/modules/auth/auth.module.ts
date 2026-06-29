import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkMiddleware } from './middleware/clerk.middleware';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, ClerkMiddleware],
  exports: [AuthService],
})
export class AuthModule {}
