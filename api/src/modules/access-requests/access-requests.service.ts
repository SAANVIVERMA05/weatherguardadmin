import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AccessRequest } from './schemas/access-request.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AccessRequestsService {
  constructor(
    @InjectModel(AccessRequest.name) private accessRequestModel: Model<AccessRequest>,
    private usersService: UsersService,
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

    // Update user status
    if (request) {
      await this.usersService.approveUser(request.userId.toString(), adminClerkId);
      await this.usersService.updateTelegramInfo(
        request.clerkId,
        '',
        request.telegramUsername,
      );
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

    // Update user status
    if (request) {
      await this.usersService.rejectUser(request.userId.toString(), rejectionReason);
    }

    return request;
  }

  async getRequestsByClerkId(clerkId: string): Promise<AccessRequest[]> {
    return this.accessRequestModel.find({ clerkId }).sort({ createdAt: -1 });
  }
}
