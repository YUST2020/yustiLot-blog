import { IsInt, IsString, Max, Min } from 'class-validator';

// 创建/更新番剧入参（管理端）
export class CreateAnimeDto {
  @IsString()
  title: string;

  @IsString()
  coverImage: string;

  @IsInt()
  @Min(0)
  @Max(10)
  rating: number;

  @IsString()
  review?: string | null;

  @IsInt()
  releaseYear: number;

  @IsInt()
  @Min(1)
  @Max(12)
  releaseQuarter: number;
}

export class UpdateAnimeDto extends CreateAnimeDto {}
