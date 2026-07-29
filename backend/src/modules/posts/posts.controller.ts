import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Public } from '../../common/decorators/public.decorator';

// 公开文章接口（无需鉴权）
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  // 列表：返回裸数组（非分页对象），仅已发布
  @Public()
  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.postsService.listPublic(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  // 详情：仅已发布，否则 404
  @Public()
  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.postsService.getBySlugPublic(slug);
  }
}
