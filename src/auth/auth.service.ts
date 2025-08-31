import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { UsersService } from '../users/users.service';

interface UserDocument {
  _id: Types.ObjectId;
  id?: string;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  private toPublicUser(user: UserDocument): {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    bio: string;
  } {
    return {
      id: user.id || user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || '',
      bio: user.bio || '',
    };
  }

  private sign(user: UserDocument): string {
    return this.jwt.sign({
      sub: user.id || user._id.toString(),
      email: user.email,
      name: user.name,
    });
  }

  async register(data: { name: string; email: string; password: string }) {
    const created = (await this.users.createUser(data)) as UserDocument;
    return {
      user: this.toPublicUser(created),
      token: this.sign(created),
    };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password ?? '');
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return {
      user: this.toPublicUser(user),
      token: this.sign(user),
    };
  }
}
