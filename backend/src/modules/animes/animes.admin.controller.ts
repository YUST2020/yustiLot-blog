import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AnimesService } from './animes.service';
import { CreateAnimeDto, UpdateAnimeDto } from './dto/create-anime.dto';

// 管理番剧接口（受全局 JwtAuthGuard 保护）
@Controller('admin/animes')
export class AnimesAdminController {
  constructor(private animesService: AnimesService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
  ) {
    return this.animesService.listAdmin({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      search,
      sortBy,
      order: order === 'asc' || order === 'desc' ? order : undefined,
    });
  }

  @Post()
  create(@Body() dto: CreateAnimeDto) {
    return this.animesService.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.animesService.getById(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnimeDto) {
    return this.animesService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.animesService.remove(Number(id));
  }
}
