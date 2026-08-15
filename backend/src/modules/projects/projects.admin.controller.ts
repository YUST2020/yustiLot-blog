import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/create-project.dto';

// 管理作品接口（受全局 JwtAuthGuard 保护）
@Controller('admin/projects')
export class ProjectsAdminController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  list() {
    return this.projectsService.listAdmin();
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.projectsService.getById(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(Number(id));
  }
}
