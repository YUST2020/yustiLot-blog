import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

// 创建/更新作品入参（管理端）
// techStack 为 JSON 字符串（前端序列化），与 posts.tags 保持同一契约
export class CreateProjectDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional() @IsString() @MaxLength(1000)
  description?: string | null;

  @IsOptional() @IsString() @MaxLength(512)
  coverImage?: string | null;

  @IsOptional() @IsString() @MaxLength(512)
  repoUrl?: string | null;

  @IsOptional() @IsString() @MaxLength(512)
  demoUrl?: string | null;

  @IsOptional() @IsString()
  techStack?: string | null;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;

  @IsOptional() @IsBoolean()
  isVisible?: boolean;
}

// 复用同一 DTO（更新为全量替换语义，与 animes 一致）
export class UpdateProjectDto extends CreateProjectDto {}
