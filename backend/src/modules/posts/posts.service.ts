import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';

// 计算 publishedAt：复刻现有 Nuxt 逻辑
// - isPublished 且无 publishedAt → 当前时间
// - publishedAt 有值 → 解析为 Date
// - 否则 null
function resolvePublishedAt(
  isPublished: boolean | undefined,
  publishedAt: string | null | undefined,
): Date | null {
  if (isPublished && !publishedAt) return new Date();
  if (publishedAt) return new Date(publishedAt);
  return null;
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // 公开列表：仅已发布，按 publishedAt 降序，返回裸数组
  async listPublic(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return this.prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      skip: offset,
      take: limit,
    });
  }

  // 公开详情：仅已发布
  async getBySlugPublic(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, isPublished: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // 管理列表：全部（含草稿），按 createdAt 降序
  async listAdmin() {
    return this.prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getById(id: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        content: dto.content,
        excerpt: dto.excerpt ?? null,
        coverImage: dto.coverImage ?? null,
        tags: dto.tags ?? null,
        isPublished: dto.isPublished ?? false,
        publishedAt: resolvePublishedAt(dto.isPublished, dto.publishedAt),
      },
    });
  }

  async update(id: number, dto: UpdatePostDto) {
    // 先确认存在（抛 404）
    await this.getById(id);
    return this.prisma.post.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
        content: dto.content,
        excerpt: dto.excerpt ?? null,
        coverImage: dto.coverImage ?? null,
        tags: dto.tags ?? null,
        isPublished: dto.isPublished ?? false,
        publishedAt: resolvePublishedAt(dto.isPublished, dto.publishedAt),
      },
    });
  }

  async remove(id: number) {
    await this.getById(id);
    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }
}
