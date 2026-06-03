import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  findAll() {
    return this.prisma.resource.findMany({ orderBy: [{ type: 'asc' }, { title: 'asc' }] });
  }

  async create(dto: CreateResourceDto, actorId?: number) {
    const resource = await this.prisma.resource.create({ data: dto });
    await this.audit.log({
      actorId,
      action: 'CREATE',
      entityType: 'Resource',
      entityId: resource.id,
      description: `Creo el recurso ${resource.title}`
    });
    return resource;
  }

  async update(id: number, dto: UpdateResourceDto, actorId?: number) {
    const resource = await this.prisma.resource.update({ where: { id }, data: dto });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entityType: 'Resource',
      entityId: resource.id,
      description: `Actualizo el recurso ${resource.title}`
    });
    return resource;
  }
}
