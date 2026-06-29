import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  clerkId: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  imageUrl: string;

  @Prop({ default: 'pending' }) // pending, approved, rejected
  status: 'pending' | 'approved' | 'rejected';

  @Prop()
  telegramChatId: string;

  @Prop()
  telegramUsername: string;

  @Prop({ default: false })
  notificationsEnabled: boolean;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ default: () => new Date() })
  updatedAt: Date;

  @Prop()
  approvedAt: Date;

  @Prop()
  rejectionReason: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
