import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

// 创建/更新文章入参（管理端）
// tags 为 JSON 字符串（前端序列化），保持「JSON 字符串」契约
export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  content: string;

  @IsOptional() @IsString()
  excerpt?: string | null;

  @IsOptional() @IsString()
  coverImage?: string | null;

  @IsOptional() @IsString()
  tags?: string | null;

  @IsOptional() @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  publishedAt?: string | null;
}

// 复用同一 DTO（更新允许部分字段语义在 service 内处理）
export class UpdatePostDto extends CreatePostDto {}
