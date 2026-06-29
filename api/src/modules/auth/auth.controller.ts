import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClerkGuard } from './guards/clerk.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('verify-token')
  async verifyToken(@Body() body: { token: string }) {
    return this.authService.verifyToken(body.token);
  }

  @Get('me')
  @UseGuards(ClerkGuard)
  async getMe(@Body('userId') userId: string) {
    return this.authService.getUserFromClerk(userId);
  }

  @Get('users')
  @UseGuards(ClerkGuard)
  async getAllUsers() {
    return this.authService.getAllUsersFromClerk();
  }
}
