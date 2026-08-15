import { Controller, Get } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Public } from '../../common/decorators/public.decorator';

// 公开作品接口（无需鉴权）
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  // 全量可见作品数组：按 sort_order desc → created_at desc
  @Public()
  @Get()
  list() {
    return this.projectsService.listPublic();
  }
}
