import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, index: true })
  title: string;

  @Prop({ required: true })
  content: string; // HTML

  @Prop({ default: '' })
  imageUrl: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User', index: true })
  authorId: Types.ObjectId;

  @Prop({ default: false, index: true })
  published: boolean;

  @Prop({ type: [String], index: true })
  tags: string[];

  @Prop({ default: 0 })
  likes: number;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Full text index for search on title & content
PostSchema.index({ title: 'text', content: 'text' });
