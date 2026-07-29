import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';

// 管理文章接口（受全局 JwtAuthGuard 保护，无需额外装饰）
@Controller('admin/posts')
export class PostsAdminController {
  constructor(private postsService: PostsService) {}

  @Get()
  list() {
    return this.postsService.listAdmin();
  }

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.postsService.getById(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(Number(id));
  }
}
