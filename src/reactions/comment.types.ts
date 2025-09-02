export interface PublicComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  replies: PublicComment[];
}
