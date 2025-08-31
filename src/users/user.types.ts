export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
