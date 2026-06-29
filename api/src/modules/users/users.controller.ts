import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ClerkGuard } from '../auth/guards/clerk.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async registerUser(
    @Body()
    data: {
      clerkId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      imageUrl?: string;
    },
  ) {
    return this.usersService.createOrUpdateUser(data);
  }

  @Get('profile/:clerkId')
  async getUserProfile(@Param('clerkId') clerkId: string) {
    return this.usersService.getUserByClerkId(clerkId);
  }

  @Get()
  @UseGuards(ClerkGuard)
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('pending')
  @UseGuards(ClerkGuard)
  async getPendingUsers() {
    return this.usersService.getPendingUsers();
  }

  @Get('approved')
  @UseGuards(ClerkGuard)
  async getApprovedUsers() {
    return this.usersService.getApprovedUsers();
  }

  @Put('telegram/:clerkId')
  async updateTelegramInfo(
    @Param('clerkId') clerkId: string,
    @Body() data: { telegramChatId: string; telegramUsername: string },
  ) {
    return this.usersService.updateTelegramInfo(clerkId, data.telegramChatId, data.telegramUsername);
  }

  @Put('notifications/enable/:clerkId')
  async enableNotifications(@Param('clerkId') clerkId: string) {
    return this.usersService.enableNotifications(clerkId);
  }

  @Put('notifications/disable/:clerkId')
  async disableNotifications(@Param('clerkId') clerkId: string) {
    return this.usersService.disableNotifications(clerkId);
  }
}
