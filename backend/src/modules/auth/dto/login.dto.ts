import { IsNotEmpty, IsString } from 'class-validator';

// 登录入参：username/password 必填，校验失败由全局 ValidationPipe 返回 400
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
