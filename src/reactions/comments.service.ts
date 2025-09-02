import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Like, LikeDocument } from './schemas/like.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikeDto } from './dto/like.dto';
import { PublicComment } from './comment.types';
import { UsersService } from 'src/users/users.service';
import { Post, PostDocument } from 'src/posts/schemas/post.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly usersService: UsersService,
  ) {}

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const doc = new this.commentModel({
      postId: new Types.ObjectId(postId),
      authorId: new Types.ObjectId(userId),
      content: dto.content,
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : undefined,
    });
    const saved = await doc.save();

    this.notifyPostAuthor(postId, userId, dto.content).catch((err) => {
      console.error('Failed to send notification to post author:', err);
    });

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

  async hasUserLiked(userId: string, postId: string): Promise<boolean> {
    const existing = await this.likeModel
      .findOne({
        postId: postId,
        userId: userId,
      })
      .lean()
      .exec();

    return !!existing;
  }

  private async notifyPostAuthor(postId: string, commenterId: string, commentContent: string) {
    // Get post document
    const post = await this.postModel.findById(postId).lean().exec();
    if (!post) return;

    // Skip if author commented on own post
    if (post.authorId.toString() === commenterId) return;

    // Get author and commenter info
    const author = await this.usersService.getPublicUserById(post.authorId.toString());
    const commenter = await this.usersService.getPublicUserById(commenterId);

    if (!author?.email) return;

    const { sendEmail } = await import('../helpers/mail.helper.js');

    const html = `
      <p>Hi ${author.name},</p>
      <p>${commenter.name} commented on your post:</p>
      <blockquote>${commentContent}</blockquote>
      <p>View the post here: <a href="${process.env.FRONTEND_URL}/posts/${postId}">Link</a></p>
    `;

    await sendEmail(author.email, 'New comment on your post', html);
  }
}
