import {
  Controller,
  Get,
  Post as HttpPost,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email?: string; name?: string };
}

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  //   @UseGuards(JwtAuthGuard) -- Removed auth guard to allow public access - all users can view posts
  //   @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'List posts (cursor pagination, newest first)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items to return' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor (base64 JSON of {createdAt,id})',
  })
  @ApiQuery({ name: 'authorId', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async list(
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('authorId') authorId?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('published') published?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedPublished = published !== undefined ? published === 'true' : undefined;

    let parsedCursor: { createdAt: string; id: string } | null = null;
    if (cursor) {
      try {
        parsedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8')) as {
          createdAt: string;
          id: string;
        };
      } catch {
        parsedCursor = null;
      }
    }

    return this.postsService.listPosts({
      limit: parsedLimit,
      cursor: parsedCursor,
      authorId,
      tag,
      search,
      published: parsedPublished,
    });
  }

  @Get('filters')
  @ApiOperation({ summary: 'Get unique authors and tags for filtering (no auth required)' })
  async getFilters() {
    return this.postsService.getTemplates();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({ summary: 'Get single post by ID' })
  async get(@Param('id') id: string) {
    const post = await this.postsService.getPostById(id);
    if (!post) return { message: 'Post not found' };
    return post;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @HttpPost()
  @ApiOperation({ summary: 'Create a new post (auth required)' })
  @ApiBody({ type: CreatePostDto })
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePostDto) {
    const userId = req.user.userId;
    return this.postsService.createPost(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Put(':id')
  @ApiOperation({ summary: 'Update a post by ID (auth required)' })
  @ApiBody({ type: CreatePostDto })
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePostDto,
  ) {
    const userId = req.user.userId;
    return this.postsService.updatePost(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post by ID (auth required)' })
  async delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    await this.postsService.deletePost(id, userId);
    return { message: 'Post deleted successfully' };
  }
}
