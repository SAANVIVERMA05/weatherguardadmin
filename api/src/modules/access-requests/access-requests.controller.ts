import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AccessRequestsService } from './access-requests.service';
import { ClerkGuard } from '../auth/guards/clerk.guard';

@Controller('access-requests')
export class AccessRequestsController {
  constructor(private accessRequestsService: AccessRequestsService) {}

  @Post('request')
  async createAccessRequest(
    @Body()
    data: {
      userId: string;
      userEmail: string;
      clerkId: string;
      reasonForAccess: string;
      telegramUsername: string;
    },
  ) {
    return this.accessRequestsService.createAccessRequest(data);
  }

  @Get('pending')
  @UseGuards(ClerkGuard)
  async getPendingRequests() {
    return this.accessRequestsService.getPendingRequests();
  }

  @Get()
  @UseGuards(ClerkGuard)
  async getAllRequests() {
    return this.accessRequestsService.getAllRequests();
  }

  @Get(':id')
  @UseGuards(ClerkGuard)
  async getRequestById(@Param('id') id: string) {
    return this.accessRequestsService.getRequestById(id);
  }

  @Put(':id/approve')
  @UseGuards(ClerkGuard)
  async approveRequest(
    @Param('id') id: string,
    @Body() data: { adminClerkId: string; approvalNotes?: string },
  ) {
    return this.accessRequestsService.approveRequest(id, data.adminClerkId, data.approvalNotes);
  }

  @Put(':id/reject')
  @UseGuards(ClerkGuard)
  async rejectRequest(
    @Param('id') id: string,
    @Body() data: { rejectionReason: string },
  ) {
    return this.accessRequestsService.rejectRequest(id, data.rejectionReason);
  }

  @Get('user/:clerkId')
  async getRequestsByClerkId(@Param('clerkId') clerkId: string) {
    return this.accessRequestsService.getRequestsByClerkId(clerkId);
  }
}
