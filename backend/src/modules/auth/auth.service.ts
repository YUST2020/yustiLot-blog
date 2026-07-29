import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword, comparePassword } from '../../utils/password.util';
import type { JwtPayload } from './strategies/jwt.strategy';

// 供控制器返回的脱敏用户信息
function sanitize(user: { id: number; username: string; name: string | null }) {
  return { id: user.id, username: user.username, name: user.name };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      // 首次建号：表空且 username=admin 时自动创建首位管理员
      const userCount = await this.prisma.user.count();
      if (userCount === 0 && username === 'admin') {
        const created = await this.prisma.user.create({
          data: { username, password: await hashPassword(password), name: 'Admin' },
        });
        return this.buildResponse(created);
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildResponse(user);
  }

  // 组装 { user, token }
  private buildResponse(user: { id: number; username: string; name: string | null }) {
    const payload: JwtPayload = { sub: user.id, username: user.username, name: user.name };
    const token = this.jwtService.sign(payload);
    return { user: sanitize(user), token };
  }
}
