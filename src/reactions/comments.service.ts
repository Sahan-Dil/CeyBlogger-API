import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Like, LikeDocument } from './schemas/like.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikeDto } from './dto/like.dto';
import { PublicComment } from './comment.types';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
  ) {}

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const doc = new this.commentModel({
      postId: new Types.ObjectId(postId),
      authorId: new Types.ObjectId(userId),
      content: dto.content,
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : undefined,
    });
    const saved = await doc.save();
    return this.toPublic(saved);
  }

  async listComments(postId: string): Promise<PublicComment[]> {
    type LeanComment = {
      _id: Types.ObjectId;
      postId: Types.ObjectId;
      authorId: Types.ObjectId;
      content: string;
      parentId?: Types.ObjectId;
      createdAt: Date;
      updatedAt: Date;
    };

    const comments = await this.commentModel
      .find({ postId: new Types.ObjectId(postId) })
      .sort({ createdAt: 1 })
      .lean<LeanComment[]>()
      .exec();

    const commentMap: Record<string, PublicComment> = {};

    // Populate map
    comments.forEach((c: LeanComment) => {
      commentMap[c._id.toString()] = {
        id: c._id.toString(),
        postId: c.postId.toString(),
        authorId: c.authorId.toString(),
        content: c.content,
        parentId: c.parentId?.toString(),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        replies: [],
      };
    });

    const roots: PublicComment[] = [];

    // Assign replies
    comments.forEach((c: LeanComment) => {
      const publicComment = commentMap[c._id.toString()];
      if (c.parentId) {
        const parent = commentMap[c.parentId.toString()];
        if (parent) parent.replies.push(publicComment);
      } else {
        roots.push(publicComment);
      }
    });

    return roots;
  }

  async likePost(userId: string, postId: string, dto: LikeDto) {
    const existing = await this.likeModel.findOne({ postId, userId });
    if (dto.like) {
      if (!existing) {
        await this.likeModel.create({ postId, userId });
      }
    } else {
      if (existing) await existing.deleteOne();
    }
    return this.getLikesCount(postId);
  }

  async getLikesCount(postId: string) {
    return this.likeModel.countDocuments({ postId });
  }

  async getCommentsCount(postId: string) {
    return this.commentModel.countDocuments({ postId });
  }

  private toPublic(doc: CommentDocument) {
    return {
      id: doc._id.toString(),
      postId: doc.postId.toString(),
      authorId: doc.authorId.toString(),
      content: doc.content,
      parentId: doc.parentId?.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
