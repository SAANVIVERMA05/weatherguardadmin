import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createOrUpdateUser(data: {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      { clerkId: data.clerkId },
      {
        ...data,
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    return this.userModel.findOne({ clerkId });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().sort({ createdAt: -1 });
  }

  async getPendingUsers(): Promise<User[]> {
    return this.userModel.find({ status: 'pending' }).sort({ createdAt: -1 });
  }

  async getApprovedUsers(): Promise<User[]> {
    return this.userModel.find({ status: 'approved' }).sort({ approvedAt: -1 });
  }

  async approveUser(userId: string, adminId: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  async rejectUser(userId: string, reason: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  async updateTelegramInfo(clerkId: string, telegramChatId: string, telegramUsername: string): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { clerkId },
      {
        telegramChatId,
        telegramUsername,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  async linkTelegramChatId(telegramUsername: string, telegramChatId: string): Promise<User | null> {
    const cleanUsername = telegramUsername.replace(/^@/, '');
    return this.userModel.findOneAndUpdate(
      {
        $or: [
          { telegramUsername: cleanUsername },
          { telegramUsername: '@' + cleanUsername },
          { telegramUsername: cleanUsername.toLowerCase() },
          { telegramUsername: '@' + cleanUsername.toLowerCase() }
        ]
      },
      {
        telegramChatId,
        notificationsEnabled: true,
        updatedAt: new Date(),
      },
      { new: true },
    );
  }

  async enableNotifications(clerkId: string): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { clerkId },
      { notificationsEnabled: true },
      { new: true },
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  async disableNotifications(clerkId: string): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { clerkId },
      { notificationsEnabled: false },
      { new: true },
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }
}
