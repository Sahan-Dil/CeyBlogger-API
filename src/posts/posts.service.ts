import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';

export interface Cursor {
  createdAt: string; // ISO
  id: string;
}

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  // Create a post (authorId must be ObjectId)
  async createPost(authorId: string, dto: CreatePostDto) {
    const doc = new this.postModel({
      title: dto.title,
      content: dto.content,
      imageUrl: dto.imageUrl ?? '',
      authorId: new Types.ObjectId(authorId),
      published: !!dto.published,
      tags: dto.tags ?? [],
      likes: 0,
    });
    const saved = await doc.save();
    return this.toPublic(saved);
  }

  // Get single post
  async getPostById(id: string) {
    const doc = await this.postModel.findById(id).exec();
    if (!doc) return null;
    return this.toPublic(doc);
  }

  // Cursor pagination + filters + search
  async listPosts(opts: {
    limit?: number;
    cursor?: { createdAt: string; id: string } | null;
    authorId?: string | null;
    tag?: string | null;
    search?: string | null;
    published?: boolean;
  }) {
    const limit = Math.min(opts.limit ?? 10, 50);
    const query: FilterQuery<Post> = {};

    if (typeof opts.published === 'boolean') {
      query.published = opts.published;
    } else {
      query.published = true;
    }

    if (opts.authorId) query.authorId = new Types.ObjectId(opts.authorId);
    if (opts.tag) query.tags = opts.tag;
    if (opts.search) query.$text = { $search: opts.search };

    if (opts.cursor) {
      const cursorDate = new Date(opts.cursor.createdAt);
      query.$or = [
        { createdAt: { $lt: cursorDate } },
        { $and: [{ createdAt: cursorDate }, { _id: { $lt: new Types.ObjectId(opts.cursor.id) } }] },
      ];
    }

    const docs = await this.postModel
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .exec();

    const hasMore = docs.length > limit;
    const pageDocs = hasMore ? docs.slice(0, limit) : docs;

    const posts = pageDocs.map((d) => this.toPublic(d));

    const lastDoc = pageDocs[pageDocs.length - 1];

    const nextCursor = hasMore
      ? {
          createdAt: lastDoc.createdAt.toISOString(),
          id: lastDoc._id.toString(),
        }
      : null;

    return { posts, nextCursor };
  }

  async updatePost(postId: string, authorId: string, dto: CreatePostDto) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId.toString() !== authorId) throw new ForbiddenException('Not allowed');

    post.title = dto.title ?? post.title;
    post.content = dto.content ?? post.content;
    post.imageUrl = dto.imageUrl ?? post.imageUrl;
    post.published = dto.published ?? post.published;
    post.tags = dto.tags ?? post.tags;

    const updated = await post.save();
    return this.toPublic(updated);
  }

  async deletePost(postId: string, authorId: string) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId.toString() !== authorId) throw new ForbiddenException('Not allowed');

    await this.postModel.deleteOne({ _id: postId }).exec();
  }

  private toPublic(doc: PostDocument) {
    return {
      id: doc._id.toString(),
      title: doc.title,
      content: doc.content,
      imageUrl: doc.imageUrl,
      authorId: doc.authorId.toString(),
      published: doc.published,
      createdAt: doc.createdAt,
      tags: doc.tags,
      likes: doc.likes,
    };
  }
}
