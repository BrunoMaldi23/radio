import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findPublished(@Query('category') category?: string) {
    return this.articlesService.findPublished(category);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.OPERATOR)
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Post(':id/attend')
  attend(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.attend(id);
  }

  @Post(':id/like')
  like(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.like(id);
  }

  @Post('community-submissions')
  createCommunitySubmission(@Body() dto: CreateArticleDto) {
    return this.articlesService.createCommunitySubmission(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.OPERATOR)
  create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.OPERATOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.OPERATOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }
}
