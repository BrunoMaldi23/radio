import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway
  ) {}

  findPublished(category?: string) {
    return this.prisma.article.findMany({
      where: { status: ContentStatus.PUBLISHED, ...(category ? { category } : {}) },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
    });
  }

  findAll() {
    return this.prisma.article.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  findBySlug(slug: string) {
    return this.prisma.article.findUnique({ where: { slug } });
  }

  async create(dto: CreateArticleDto) {
    const slug = await this.nextAvailableSlug(dto.slug || dto.title);
    const article = await this.prisma.article.create({
      data: {
        ...dto,
        slug,
        publishedAt: dto.status === ContentStatus.PUBLISHED ? new Date() : undefined
      }
    });

    if (article.status === ContentStatus.PUBLISHED) {
      this.realtime.emitContentPublished(article);
    }

    return article;
  }

  async update(id: number, dto: UpdateArticleDto) {
    const article = await this.prisma.article.update({
      where: { id },
      data: {
        ...dto,
        publishedAt: dto.status === ContentStatus.PUBLISHED ? new Date() : undefined
      }
    });

    if (article.status === ContentStatus.PUBLISHED) {
      this.realtime.emitContentPublished(article);
    }

    return article;
  }

  remove(id: number) {
    return this.prisma.article.delete({ where: { id } });
  }

  private async nextAvailableSlug(value: string) {
    const base = this.slugify(value);
    let slug = base;
    let suffix = 2;

    while (await this.prisma.article.findUnique({ where: { slug } })) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private slugify(value: string) {
    const slug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return slug || `contenido-${Date.now()}`;
  }
}
