import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AccessRequest } from './schemas/access-request.schema';
import { UsersService } from '../users/users.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class AccessRequestsService {
  private logger = new Logger(AccessRequestsService.name);

  constructor(
    @InjectModel(AccessRequest.name) private accessRequestModel: Model<AccessRequest>,
    private usersService: UsersService,
    private telegramService: TelegramService,
  ) {}

  async createAccessRequest(data: {
    userId: string;
    userEmail: string;
    clerkId: string;
    reasonForAccess: string;
    telegramUsername: string;
  }): Promise<AccessRequest> {
    const newRequest = new this.accessRequestModel({
      userId: new Types.ObjectId(data.userId),
      userEmail: data.userEmail,
      clerkId: data.clerkId,
      reasonForAccess: data.reasonForAccess,
      telegramUsername: data.telegramUsername,
      status: 'pending',
    });
    return newRequest.save();
  }

  async getPendingRequests(): Promise<AccessRequest[]> {
    return this.accessRequestModel
      .find({ status: 'pending' })
      .sort({ createdAt: -1 });
  }

  async getAllRequests(): Promise<AccessRequest[]> {
    return this.accessRequestModel
      .find()
      .sort({ createdAt: -1 });
  }

  async getRequestById(id: string): Promise<AccessRequest | null> {
    return this.accessRequestModel.findById(id);
  }

  async approveRequest(
    requestId: string,
    adminClerkId: string,
    approvalNotes?: string,
  ): Promise<AccessRequest> {
    const request = await this.accessRequestModel.findByIdAndUpdate(
      requestId,
      {
        status: 'approved',
        adminApprovedBy: adminClerkId,
        approvalNotes,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!request) {
      throw new Error('Access request not found');
    }

    await this.usersService.approveUser(request.userId.toString(), adminClerkId);
    const updatedUser = await this.usersService.updateTelegramInfo(
      request.clerkId,
      '',
      request.telegramUsername,
    );

    // If the user has already linked their Telegram bot chat ID, notify them immediately!
    const userProfile = await this.usersService.getUserByClerkId(request.clerkId);
    if (userProfile && userProfile.telegramChatId) {
      try {
        await this.telegramService.sendMessage(
          userProfile.telegramChatId,
          `🎉 <b>Access Request Approved!</b>\n\nYour access request to WeatherGuard has been approved by an administrator!\n\n` +
          (approvalNotes ? `<b>Admin Notes:</b> ${approvalNotes}\n\n` : '') +
          `You will now receive weather alerts automatically. Stay safe! 🌤️`
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to send approval message to Telegram Chat ID ${userProfile.telegramChatId}: ${msg}`);
      }
    }

    return request;
  }

  async rejectRequest(
    requestId: string,
    rejectionReason: string,
  ): Promise<AccessRequest> {
    const request = await this.accessRequestModel.findByIdAndUpdate(
      requestId,
      {
        status: 'rejected',
        rejectionReason,
        rejectedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!request) {
      throw new Error('Access request not found');
    }

    await this.usersService.rejectUser(request.userId.toString(), rejectionReason);

    return request;
  }

  async getRequestsByClerkId(clerkId: string): Promise<AccessRequest[]> {
    return this.accessRequestModel.find({ clerkId }).sort({ createdAt: -1 });
  }
}
