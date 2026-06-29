import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { ClerkGuard } from '../auth/guards/clerk.guard';

@Controller('alerts')
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Post('create')
  @UseGuards(ClerkGuard)
  async createAlert(
    @Body()
    data: {
      userId: string;
      userClerkId: string;
      title: string;
      description: string;
      severity: 'warning' | 'alert' | 'critical';
      location?: string;
      temperature?: number;
      condition?: string;
      windSpeed?: number;
      scheduledFor?: Date;
    },
  ) {
    return this.alertsService.createAlert(data);
  }

  @Get('pending')
  @UseGuards(ClerkGuard)
  async getPendingAlerts() {
    return this.alertsService.getPendingAlerts();
  }

  @Get('user/:clerkId')
  async getAlertsByUser(@Param('clerkId') clerkId: string) {
    return this.alertsService.getAlertsByUser(clerkId);
  }

  @Get()
  @UseGuards(ClerkGuard)
  async getAllAlerts() {
    return this.alertsService.getAllAlerts();
  }
}
