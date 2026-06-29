import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AccessRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  clerkId: string;

  @Prop({ default: 'pending' }) // pending, approved, rejected
  status: 'pending' | 'approved' | 'rejected';

  @Prop()
  reasonForAccess: string;

  @Prop()
  telegramUsername: string;

  @Prop()
  adminApprovedBy: string; // Clerk ID of admin who approved

  @Prop()
  approvalNotes: string;

  @Prop()
  rejectionReason: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop()
  approvedAt: Date;

  @Prop()
  rejectedAt: Date;

  @Prop({ default: () => new Date() })
  updatedAt: Date;
}

export const AccessRequestSchema = SchemaFactory.createForClass(AccessRequest);
