export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  tags?: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostsQueryOptions {
  publishedOnly?: boolean;
  authorId?: string;
  tag?: string;
  search?: string;
}
