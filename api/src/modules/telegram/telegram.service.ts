import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private bot: Telegraf;
  private logger = new Logger(TelegramService.name);

  constructor(private configService: ConfigService) {
    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
    if (botToken) {
      this.bot = new Telegraf(botToken);
      this.initializeBot();
    }
  }

  private initializeBot() {
    this.bot.start((ctx) => {
      ctx.reply(
        'Welcome to Weather Alert Bot! 🌤️\n\nUse /help to see available commands.',
      );
    });

    this.bot.help((ctx) => {
      ctx.reply(
        `Available commands:\n/start - Start the bot\n/status - Check your subscription status\n/help - Show this help message`,
      );
    });

    this.bot.command('status', (ctx) => {
      ctx.reply('You are subscribed to weather alerts!');
    });

    this.bot.launch();
    this.logger.log('Telegram bot initialized');
  }

  async sendAlertToUser(userClerkId: string, alert: any) {
    try {
      if (!this.bot) {
        this.logger.warn('Telegram bot not initialized');
        return;
      }

      const message = `
🚨 <b>Weather Alert</b>

<b>Title:</b> ${alert.title}
<b>Severity:</b> ${alert.severity.toUpperCase()}
<b>Description:</b> ${alert.description}
${alert.location ? `<b>Location:</b> ${alert.location}` : ''}
${alert.condition ? `<b>Condition:</b> ${alert.condition}` : ''}
${alert.temperature ? `<b>Temperature:</b> ${alert.temperature}°C` : ''}
${alert.windSpeed ? `<b>Wind Speed:</b> ${alert.windSpeed} km/h` : ''}

Stay safe! ⚠️`;

      // This would require storing Telegram chat IDs in the database
      // For now, we'll log it
      this.logger.log(`Alert message prepared for user ${userClerkId}:\n${message}`);
    } catch (error) {
      this.logger.error(`Failed to send alert: ${error.message}`);
      throw error;
    }
  }

  async sendMessage(chatId: string, message: string) {
    try {
      if (!this.bot) {
        this.logger.warn('Telegram bot not initialized');
        return;
      }
      await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
      this.logger.log(`Message sent to chat ${chatId}`);
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      throw error;
    }
  }

  getBot() {
    return this.bot;
  }
}
