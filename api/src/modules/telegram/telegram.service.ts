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

    this.bot.on('text', async (ctx) => {
      const text = ctx.message.text.trim().toLowerCase();

      // Greetings: "hi", "hello", "hey", or variations
      if (
        text === 'hi' ||
        text === 'hello' ||
        text === 'hey' ||
        text.startsWith('hi ') ||
        text.startsWith('hello ') ||
        text.startsWith('hey ')
      ) {
        await ctx.reply('Hello! How can I help you today?');
        return;
      }

      // Weather inquiries
      if (
        text.includes('weather') ||
        text.includes('forecast') ||
        text.includes('temperature') ||
        text.includes('rain') ||
        text.includes('storm') ||
        text.includes('climate')
      ) {
        await ctx.reply(
          'I can help answer weather-related questions and provide assistance through WeatherGuard Bot. ' +
          'Administrators will broadcast extreme weather alerts directly to this chat!'
        );
        return;
      }

      // What can you do / bot capabilities
      if (text.includes('what can you do') || text.includes('what do you do') || text.includes('capabilities') || text.includes('features')) {
        await ctx.reply('I can help answer weather-related questions and provide assistance through WeatherGuard Bot.');
        return;
      }

      // Creator details
      if (text.includes('who created you') || text.includes('who are you') || text.includes('who is the creator') || text.includes('your creator') || text.includes('who made you')) {
        await ctx.reply('I am WeatherGuard Bot, designed to assist users with weather-related information and support.');
        return;
      }

      // Fallback response for unhandled text
      await ctx.reply("I'm sorry, I don't have that information right now.");
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

      const user = await this.usersService.getUserByClerkId(userClerkId);
      if (!user) {
        this.logger.warn(`User with Clerk ID ${userClerkId} not found in database.`);
        return;
      }

      if (!user.telegramChatId) {
        this.logger.warn(`User ${userClerkId} does not have a linked Telegram Chat ID.`);
        return;
      }

      if (!user.notificationsEnabled) {
        this.logger.log(`Notifications are disabled for user ${userClerkId}.`);
        return;
      }

      const message = `🚨 <b>Weather Alert: ${alert.title}</b>\n\n` +
        `<b>Severity:</b> ${alert.severity.toUpperCase()}\n` +
        `<b>Description:</b> ${alert.description}\n` +
        (alert.location ? `<b>Location:</b> ${alert.location}\n` : '') +
        (alert.condition ? `<b>Condition:</b> ${alert.condition}\n` : '') +
        (alert.temperature !== undefined ? `<b>Temperature:</b> ${alert.temperature}°C\n` : '') +
        (alert.windSpeed !== undefined ? `<b>Wind Speed:</b> ${alert.windSpeed} km/h\n` : '') +
        `\nStay safe! ⚠️`;

      await this.sendMessage(user.telegramChatId, message);
      this.logger.log(`Alert sent to Telegram user @${user.telegramUsername} (Chat ID: ${user.telegramChatId})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send alert to user ${userClerkId}: ${message}`);
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
