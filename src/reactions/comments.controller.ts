import { Controller, Post as HttpPost, Body, Param, UseGuards, Req, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikeDto } from './dto/like.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@ApiTags('comments')
@Controller('posts/:postId')
@UseGuards(JwtAuthGuard) // Apply auth to all endpoints
@ApiBearerAuth('access-token')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @HttpPost('comments')
  @ApiOperation({ summary: 'Add comment to a post (auth required)' })
  @ApiBody({ type: CreateCommentDto })
  async addComment(
    @Param('postId') postId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.addComment(req.user.userId, postId, dto);
  }

  @Get('comments')
  @ApiOperation({ summary: 'List comments (with nested replies) for a post (auth required)' })
  async listComments(@Param('postId') postId: string) {
    return this.commentsService.listComments(postId);
  }

  @HttpPost('like')
  @ApiOperation({ summary: 'Like or unlike a post (auth required)' })
  @ApiBody({ type: LikeDto })
  async likePost(
    @Param('postId') postId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: LikeDto,
  ) {
    return this.commentsService.likePost(req.user.userId, postId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('liked')
  @ApiOperation({ summary: 'Check if current user has liked the post' })
  async isLiked(@Param('postId') postId: string, @Req() req: AuthenticatedRequest) {
    const liked = await this.commentsService.hasUserLiked(req.user.userId, postId);
    return { liked };
  }
}
