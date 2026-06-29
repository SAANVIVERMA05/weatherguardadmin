import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkMiddleware } from './middleware/clerk.middleware';
import { ClerkGuard } from './guards/clerk.guard';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, ClerkMiddleware, ClerkGuard],
  exports: [AuthService, ClerkGuard],
})
export class AuthModule {}
