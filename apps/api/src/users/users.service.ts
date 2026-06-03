import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isPenalized: true,
        penaltyEndDate: true
      }
    });
  }

  async create(dto: CreateUserDto, actorId?: number) {
    const password = await bcrypt.hash(dto.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password,
          role: dto.role,
          isActive: dto.isActive,
          isPenalized: dto.isPenalized,
          penaltyEndDate: dto.penaltyEndDate ? new Date(dto.penaltyEndDate) : undefined
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          isPenalized: true,
          penaltyEndDate: true
        }
      });
      await this.audit.log({
        actorId,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        description: `Creo el usuario ${user.email}`
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('El correo ya esta registrado.');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateUserDto, actorId?: number) {
    const password = dto.password ? await bcrypt.hash(dto.password, 12) : undefined;

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        password,
        role: dto.role,
        isActive: dto.isActive,
        isPenalized: dto.isPenalized,
        penaltyEndDate: dto.penaltyEndDate ? new Date(dto.penaltyEndDate) : dto.penaltyEndDate === null ? null : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isPenalized: true,
        penaltyEndDate: true
      }
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user.id,
      description: `Actualizo el usuario ${user.email}`
    });
    return user;
  }

  async clearPenalty(id: number, actorId?: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isPenalized: false,
        penaltyEndDate: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isPenalized: true,
        penaltyEndDate: true
      }
    });
    await this.audit.log({
      actorId,
      action: 'CLEAR_PENALTY',
      entityType: 'User',
      entityId: user.id,
      description: `Quito la penalizacion de ${user.email}`
    });
    return user;
  }
}
