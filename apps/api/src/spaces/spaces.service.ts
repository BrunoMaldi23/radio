import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  findAll() {
    return this.prisma.space.findMany({ orderBy: { name: 'asc' } });
  }

  async create(dto: CreateSpaceDto, actorId?: number) {
    const space = await this.prisma.space.create({ data: dto });
    await this.audit.log({
      actorId,
      action: 'CREATE',
      entityType: 'Space',
      entityId: space.id,
      description: `Creo la sala ${space.name}`
    });
    return space;
  }

  async update(id: number, dto: UpdateSpaceDto, actorId?: number) {
    const space = await this.prisma.space.update({ where: { id }, data: dto });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entityType: 'Space',
      entityId: space.id,
      description: `Actualizo la sala ${space.name}`
    });
    return space;
  }
}
