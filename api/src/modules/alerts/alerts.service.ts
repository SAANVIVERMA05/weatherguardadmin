import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Alert } from './schemas/alert.schema';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class AlertsService {
  private logger = new Logger(AlertsService.name);

  constructor(
    @InjectModel(Alert.name) private alertModel: Model<Alert>,
    private telegramService: TelegramService,
  ) {}

  async createAlert(data: {
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
  }): Promise<Alert> {
    const newAlert = new this.alertModel({
      userId: new Types.ObjectId(data.userId),
      userClerkId: data.userClerkId,
      title: data.title,
      description: data.description,
      severity: data.severity,
      location: data.location,
      temperature: data.temperature,
      condition: data.condition,
      windSpeed: data.windSpeed,
      scheduledFor: data.scheduledFor || new Date(),
    });
    return newAlert.save();
  }

  async getPendingAlerts(): Promise<Alert[]> {
    return this.alertModel.find({ sent: false }).sort({ scheduledFor: 1 });
  }

  async getAlertsByUser(userClerkId: string): Promise<Alert[]> {
    return this.alertModel.find({ userClerkId }).sort({ createdAt: -1 });
  }

  async getAllAlerts(): Promise<Alert[]> {
    return this.alertModel.find().sort({ createdAt: -1 });
  }

  async markAlertAsSent(alertId: string): Promise<Alert> {
    const updatedAlert = await this.alertModel.findByIdAndUpdate(
      alertId,
      {
        sent: true,
        sentAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedAlert) {
      throw new Error('Alert not found');
    }

    return updatedAlert;
  }

  // Run every minute to send pending alerts
  @Cron(CronExpression.EVERY_MINUTE)
  async sendPendingAlerts() {
    try {
      const pendingAlerts = await this.alertModel.find({
        sent: false,
        scheduledFor: { $lte: new Date() },
      });

      for (const alert of pendingAlerts) {
        try {
          await this.telegramService.sendAlertToUser(alert.userClerkId, alert);
          await this.markAlertAsSent(alert._id.toString());
          this.logger.log(`Alert sent to user ${alert.userClerkId}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to send alert: ${message}`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in sendPendingAlerts: ${message}`);
    }
  }

  // Run every hour to cleanup old sent alerts (optional)
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldAlerts() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.alertModel.deleteMany({
      sent: true,
      sentAt: { $lt: thirtyDaysAgo },
    });
    this.logger.log(`Cleaned up ${result.deletedCount} old alerts`);
  }
}
