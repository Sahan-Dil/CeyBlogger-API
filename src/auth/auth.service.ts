import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.types';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  private toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || '',
      bio: user.bio || '',
    };
  }

  private sign(user: User) {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
  }

  async register(data: { name: string; email: string; password: string }) {
    const created = (await this.users.createUser(data)) as unknown as User;
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...plain } = user;
    return {
      user: this.toPublicUser(plain as unknown as User),
      token: this.sign(plain as unknown as User),
    };
  }
}
