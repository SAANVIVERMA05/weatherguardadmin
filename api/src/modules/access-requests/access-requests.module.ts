import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessRequest, AccessRequestSchema } from './schemas/access-request.schema';
import { AccessRequestsService } from './access-requests.service';
import { AccessRequestsController } from './access-requests.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { ClerkGuard } from '../auth/guards/clerk.guard';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AccessRequest.name, schema: AccessRequestSchema }]),
    UsersModule,
    AuthModule,
    TelegramModule,
  ],
  controllers: [AccessRequestsController],
  providers: [AccessRequestsService, ClerkGuard],
  exports: [AccessRequestsService],
})
export class AccessRequestsModule {}
