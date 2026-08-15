import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/create-project.dto';

// 校验 id 为有效整数（路由参数可能传入非数字字符串）
function requireValidId(id: number) {
  if (!Number.isInteger(id)) {
    throw new BadRequestException('Invalid ID');
  }
}

// 展示排序：sort_order 越大越靠前，相同则新创建的在前
const projectOrderBy: Prisma.ProjectOrderByWithRelationInput[] = [
  { sortOrder: 'desc' },
  { createdAt: 'desc' },
];

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // 公开列表：仅可见作品；作品量级小，不分页
  listPublic() {
    return this.prisma.project.findMany({
      where: { isVisible: true },
      orderBy: projectOrderBy,
    });
  }

  // 管理列表：全量（含隐藏）
  listAdmin() {
    return this.prisma.project.findMany({ orderBy: projectOrderBy });
  }

  async getById(id: number) {
    requireValidId(id);
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: this.toData(dto) });
  }

  async update(id: number, dto: UpdateProjectDto) {
    requireValidId(id);
    await this.getById(id);
    return this.prisma.project.update({ where: { id }, data: this.toData(dto) });
  }

  async remove(id: number) {
    requireValidId(id);
    await this.getById(id);
    await this.prisma.project.delete({ where: { id } });
    return { success: true };
  }

  private toData(dto: CreateProjectDto) {
    return {
      name: dto.name,
      description: dto.description ?? null,
      coverImage: dto.coverImage ?? null,
      repoUrl: dto.repoUrl ?? null,
      demoUrl: dto.demoUrl ?? null,
      techStack: dto.techStack ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isVisible: dto.isVisible ?? true,
    };
  }
}
