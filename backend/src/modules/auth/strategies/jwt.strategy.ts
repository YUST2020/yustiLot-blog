import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// JWT 载荷类型
export interface JwtPayload {
  sub: number;
  username: string;
  name: string | null;
}

// 从 Authorization: Bearer <token> 提取并校验 JWT
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // 校验通过后挂载到 request.user
  async validate(payload: JwtPayload) {
    return { id: payload.sub, username: payload.username, name: payload.name };
  }
}
