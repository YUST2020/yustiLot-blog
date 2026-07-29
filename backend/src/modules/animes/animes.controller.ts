import { Controller, Get, Query } from '@nestjs/common';
import { AnimesService } from './animes.service';
import { Public } from '../../common/decorators/public.decorator';

// 公开番剧接口（无需鉴权）
@Controller('animes')
export class AnimesController {
  constructor(private animesService: AnimesService) {}

  // 分页列表：返回 { items, total, page, pageSize, totalPages }
  @Public()
  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
  ) {
    return this.animesService.listPublic({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sortBy,
      order: order === 'asc' || order === 'desc' ? order : undefined,
    });
  }
}
