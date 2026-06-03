import { Injectable } from '@nestjs/common';
import { ProgramStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.program.findMany({
      where: { status: ProgramStatus.ACTIVE },
      orderBy: { name: 'asc' }
    });
  }

  findAll() {
    return this.prisma.program.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async create(dto: CreateProgramDto) {
    return this.prisma.program.create({
      data: {
        ...dto,
        slug: await this.nextAvailableSlug(dto.slug || dto.name)
      }
    });
  }

  update(id: number, dto: UpdateProgramDto) {
    return this.prisma.program.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.program.delete({ where: { id } });
  }

  private async nextAvailableSlug(value: string) {
    const base = this.slugify(value);
    let slug = base;
    let suffix = 2;

    while (await this.prisma.program.findUnique({ where: { slug } })) {
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

    return slug || `programa-${Date.now()}`;
  }
}
