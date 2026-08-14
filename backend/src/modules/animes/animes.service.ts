import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimeDto, UpdateAnimeDto } from './dto/create-anime.dto';

// 校验 id 为有效整数（路由参数可能传入非数字字符串）
function requireValidId(id: number) {
  if (!Number.isInteger(id)) {
    throw new BadRequestException('Invalid ID');
  }
}

// 构建排序条件：复刻现有 Nuxt 逻辑
// - releaseDate → [release_year, release_quarter]
// - rating → [rating]
// - 其他 → [created_at]
// 排序参数完全相同时，以 created_at 从晚到早兜底
function buildOrderBy(sortBy: string, order: 'asc' | 'desc'): Prisma.AnimeOrderByWithRelationInput[] {
  const dir = order;
  if (sortBy === 'rating') {
    return [{ rating: dir }, { createdAt: 'desc' }];
  }
  if (sortBy === 'releaseDate') {
    return [{ releaseYear: dir }, { releaseQuarter: dir }, { createdAt: 'desc' }];
  }
  return [{ createdAt: dir }];
}

@Injectable()
export class AnimesService {
  constructor(private prisma: PrismaService) {}

  // 公开分页列表
  async listPublic(params: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 12));
    const sortBy = params.sortBy ?? 'releaseDate';
    const order = params.order ?? 'desc';
    const offset = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.anime.findMany({
        orderBy: buildOrderBy(sortBy, order),
        skip: offset,
        take: pageSize,
      }),
      this.prisma.anime.count(),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 管理分页列表（带搜索）
  async listAdmin(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 10));
    const sortBy = params.sortBy ?? 'releaseDate';
    const order = params.order ?? 'desc';
    const offset = (page - 1) * pageSize;

    const where: Prisma.AnimeWhereInput = params.search
      ? { title: { contains: params.search } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.anime.findMany({
        where,
        orderBy: buildOrderBy(sortBy, order),
        skip: offset,
        take: pageSize,
      }),
      this.prisma.anime.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getById(id: number) {
    requireValidId(id);
    const anime = await this.prisma.anime.findUnique({ where: { id } });
    if (!anime) throw new NotFoundException('Anime not found');
    return anime;
  }

  async create(dto: CreateAnimeDto) {
    return this.prisma.anime.create({
      data: {
        title: dto.title,
        coverImage: dto.coverImage,
        rating: dto.rating,
        review: dto.review ?? null,
        releaseYear: dto.releaseYear,
        releaseQuarter: dto.releaseQuarter,
      },
    });
  }

  async update(id: number, dto: UpdateAnimeDto) {
    requireValidId(id);
    await this.getById(id);
    return this.prisma.anime.update({
      where: { id },
      data: {
        title: dto.title,
        coverImage: dto.coverImage,
        rating: dto.rating,
        review: dto.review ?? null,
        releaseYear: dto.releaseYear,
        releaseQuarter: dto.releaseQuarter,
      },
    });
  }

  async remove(id: number) {
    requireValidId(id);
    await this.getById(id);
    await this.prisma.anime.delete({ where: { id } });
    return { success: true };
  }
}
