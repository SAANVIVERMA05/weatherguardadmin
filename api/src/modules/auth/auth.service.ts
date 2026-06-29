import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  async verifyToken(token: string) {
    const hasSecret = Boolean(this.configService.get<string>('CLERK_SECRET_KEY'));

    if (!hasSecret || !token) {
      return {
        ok: true,
        message: 'Clerk is not configured locally yet. The API is running in mock mode.',
        token,
      };
    }

    return {
      ok: true,
      sub: token,
      issuer: 'clerk',
    };
  }

  async getUserFromClerk(userId: string) {
    return {
      id: userId,
      email: 'admin@example.com',
      firstName: 'Weather',
      lastName: 'Admin',
      imageUrl: '',
      createdAt: new Date().toISOString(),
    };
  }

  async getAllUsersFromClerk() {
    return [
      await this.getUserFromClerk('local-admin'),
    ];
  }
}
