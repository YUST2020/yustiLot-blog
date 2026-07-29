import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 登录：公开接口
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  // 登出：公开接口（JWT 无状态，前端丢弃 token）
  @Public()
  @Post('logout')
  async logout() {
    return { success: true };
  }

  // 当前用户：受 JwtAuthGuard 保护（默认）
  @Get('me')
  async me(@Request() req: any) {
    return { user: req.user };
  }
}
