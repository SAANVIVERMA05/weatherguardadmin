import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { UsersService } from '../users/users.service';

@Injectable()
export class TelegramService {
  private bot: Telegraf;
  private logger = new Logger(TelegramService.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
    const isPlaceholder = !botToken || botToken === '<YOUR_TELEGRAM_BOT_TOKEN>' || botToken.startsWith('<');
    
    if (!isPlaceholder) {
      try {
        this.bot = new Telegraf(botToken);
        this.initializeBot();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to initialize Telegram Bot: ${msg}`);
      }
    } else {
      this.logger.warn('Telegram Bot Token is not configured or is using a placeholder. Bot features will be disabled.');
    }
  }

  private initializeBot() {
    this.bot.start(async (ctx) => {
      const username = ctx.from?.username;
      const chatId = ctx.chat?.id.toString();
      
      this.logger.log(`Telegram Bot started by user: ${username} (Chat ID: ${chatId})`);

      if (username) {
        try {
          const linkedUser = await this.usersService.linkTelegramChatId(username, chatId);
          if (linkedUser) {
            await ctx.reply(
              `Welcome to WeatherGuard! 🌤️\n\nYour Telegram account (@${username}) has been successfully linked.\n` +
              `Status: ${linkedUser.status.toUpperCase()}\n\n` +
              (linkedUser.status === 'approved' 
                ? 'You are active and will receive weather alerts here.' 
                : 'Your request is pending administrator approval. We will notify you once approved.')
            );
            return;
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          this.logger.error(`Error linking Telegram username @${username}: ${msg}`);
        }
      }

      await ctx.reply(
        `Welcome to WeatherGuard! 🌤️\n\nWe couldn't automatically match your Telegram username${username ? ` (@${username})` : ''} to a registered user.\n\n` +
        `Please make sure you have signed up on the Web Dashboard and entered your Telegram username under the 'Request Access' form.`
      );
    });

    this.bot.help((ctx) => {
      ctx.reply(
        `Available commands:\n/start - Start the bot and link account\n/status - Check your subscription status\n/help - Show this help message`,
      );
    });

    this.bot.command('status', (ctx) => {
      ctx.reply('You are subscribed to weather alerts!');
    });

    this.bot.launch().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to launch Telegram Bot: ${msg}`);
    });
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send alert: ${message}`);
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send message: ${message}`);
      throw error;
    }
  }

  getBot() {
    return this.bot;
  }
}
