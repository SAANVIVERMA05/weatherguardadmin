import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Alert, AlertSchema } from './schemas/alert.schema';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { TelegramModule } from '../telegram/telegram.module';
import { AuthModule } from '../auth/auth.module';
import { ClerkGuard } from '../auth/guards/clerk.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Alert.name, schema: AlertSchema }]),
    TelegramModule,
    AuthModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService, ClerkGuard],
  exports: [AlertsService],
})
export class AlertsModule {}
