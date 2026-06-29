import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Alert extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userClerkId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: ['warning', 'alert', 'critical'], default: 'alert' })
  severity: 'warning' | 'alert' | 'critical';

  @Prop()
  location: string;

  @Prop()
  temperature: number;

  @Prop()
  condition: string;

  @Prop()
  windSpeed: number;

  @Prop({ default: false })
  sent: boolean;

  @Prop()
  sentAt: Date;

  @Prop({ default: () => new Date() })
  scheduledFor: Date;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ default: () => new Date() })
  updatedAt: Date;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
