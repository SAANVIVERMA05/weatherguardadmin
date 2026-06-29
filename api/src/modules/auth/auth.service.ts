import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { clerkClient } from '@clerk/backend';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {
    // Initialize Clerk client with secret key
    clerkClient.instance.apiKey = this.configService.get('CLERK_SECRET_KEY');
  }

  /**
   * Verify Clerk token
   */
  async verifyToken(token: string) {
    try {
      const decoded = await clerkClient.instances.verifyToken(token);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user from Clerk by userId
   */
  async getUserFromClerk(userId: string) {
    try {
      const user = await clerkClient.users.getUser(userId);
      return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all users from Clerk
   */
  async getAllUsersFromClerk() {
    try {
      const users = await clerkClient.users.getUserList({ limit: 100 });
      return users.data.map(user => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      }));
    } catch (error) {
      return [];
    }
  }
}
