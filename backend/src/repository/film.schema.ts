import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Схема для расписания
export class ScheduleItem {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true })
  daytime: string;

  @Prop({ required: true })
  hall: number;

  @Prop({ required: true })
  rows: number;

  @Prop({ required: true })
  seats: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [String], default: [] })
  taken: string[];
}

// Схема для фильма
@Schema({ timestamps: true, collection: 'films' })
export class FilmDocument extends Document {
  @Prop({ required: true, unique: true, type: String })
  id: string;

  @Prop({ required: true, min: 0, max: 10 })
  rating: number;

  @Prop({ required: true })
  director: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  cover: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  about: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  schedule: ScheduleItem[];
}

export const FilmSchema = SchemaFactory.createForClass(FilmDocument);
