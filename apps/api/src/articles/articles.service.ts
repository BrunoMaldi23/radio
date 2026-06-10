import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

function sanitizeHtml(html: string): string {
  const { JSDOM } = require('jsdom');
  const { default: DOMPurify } = require('dompurify');
  const window = new JSDOM('').window;
  const purify = DOMPurify(window as unknown as Window);
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'hr', 'div', 'span', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sub', 'sup'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'width', 'height', 'align'],
    ALLOW_DATA_ATTR: false,
  });
}

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

  attend(id: number) {
    return this.prisma.article.update({
      where: { id },
      data: { attendees: { increment: 1 } }
    });
  }

  like(id: number) {
    return this.prisma.article.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });
  }

  async create(dto: CreateArticleDto) {
    const slug = await this.nextAvailableSlug(dto.slug || dto.title);
    const article = await this.prisma.article.create({
      data: {
        ...dto,
        body: sanitizeHtml(dto.body),
        slug,
        publishedAt: dto.status === ContentStatus.PUBLISHED ? new Date() : undefined
      }
    });

    if (article.status === ContentStatus.PUBLISHED) {
      this.realtime.emitContentPublished(article);
    }

    return article;
  }

  async createCommunitySubmission(dto: CreateArticleDto) {
    const category = ['Eventos', 'Galeria'].includes(dto.category) ? dto.category : 'Galeria';
    const slug = await this.nextAvailableSlug(dto.slug || dto.title);

    return this.prisma.article.create({
      data: {
        ...dto,
        body: sanitizeHtml(dto.body),
        category,
        slug,
        status: ContentStatus.DRAFT,
        publishedAt: undefined
      }
    });
  }

  async update(id: number, dto: UpdateArticleDto) {
    const current = await this.prisma.article.findUnique({ where: { id }, select: { status: true } });
    const shouldSetPublishedAt = dto.status === ContentStatus.PUBLISHED && current?.status !== ContentStatus.PUBLISHED;

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        ...dto,
        body: dto.body ? sanitizeHtml(dto.body) : undefined,
        publishedAt: shouldSetPublishedAt ? new Date() : undefined
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
