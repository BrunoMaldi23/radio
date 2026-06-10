import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

const BLOCKING_STATUSES: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.ACTIVE];

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly audit: AuditService
  ) {}

  async create(userId: number, dto: CreateBookingDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    const resourceIds = dto.resourceIds ?? [];

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || startTime >= endTime) {
      throw new BadRequestException('startTime must be earlier than endTime.');
    }

    const booking = await this.createWithSerializableRetry(userId, dto, startTime, endTime, resourceIds);

    this.realtime.emitBookingCreated(booking);
    await this.audit.log({
      actorId: userId,
      action: 'CREATE',
      entityType: 'Booking',
      entityId: booking.id,
      description: `Creo la reserva ${booking.id}`
    });
    return booking;
  }

  findAll() {
    return this.prisma.booking.findMany({
      orderBy: { startTime: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        space: true,
        details: { include: { resource: true } }
      }
    });
  }

  async update(bookingId: number, actorId: number, dto: UpdateBookingDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    const resourceIds = dto.resourceIds ?? [];

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || startTime >= endTime) {
      throw new BadRequestException('startTime must be earlier than endTime.');
    }

    const booking = await this.updateWithSerializableRetry(bookingId, dto, startTime, endTime, resourceIds);

    this.realtime.emitBookingUpdated(booking);
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entityType: 'Booking',
      entityId: booking.id,
      description: `Actualizo la reserva ${booking.id}`
    });
    return booking;
  }

  private async createWithSerializableRetry(
    userId: number,
    dto: CreateBookingDto,
    startTime: Date,
    endTime: Date,
    resourceIds: number[]
  ) {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) {
              throw new NotFoundException('User not found.');
            }

            if (user.isPenalized && (!user.penaltyEndDate || user.penaltyEndDate > new Date())) {
              throw new ForbiddenException('User is penalized and cannot create bookings.');
            }

            if (dto.spaceId) {
              const space = await tx.space.findUnique({ where: { id: dto.spaceId } });
              if (!space || !space.isActive) {
                throw new NotFoundException('Space not found or inactive.');
              }
            }

            if (resourceIds.length > 0) {
              const activeResources = await tx.resource.findMany({
                where: { id: { in: resourceIds }, isActive: true },
                select: { id: true }
              });

              if (activeResources.length !== resourceIds.length) {
                throw new NotFoundException('One or more resources were not found or are inactive.');
              }
            }

            if (dto.spaceId) {
              const spaceCollision = await tx.booking.findFirst({
                where: {
                  spaceId: dto.spaceId,
                  status: { in: BLOCKING_STATUSES },
                  startTime: { lt: endTime },
                  endTime: { gt: startTime }
                },
                select: { id: true }
              });

              if (spaceCollision) {
                throw new ConflictException('Space is already booked for the requested time window.');
              }
            }

            if (resourceIds.length > 0) {
              const resourceCollision = await tx.bookingDetail.findFirst({
                where: {
                  resourceId: { in: resourceIds },
                  booking: {
                    status: { in: BLOCKING_STATUSES },
                    startTime: { lt: endTime },
                    endTime: { gt: startTime }
                  }
                },
                select: { resourceId: true }
              });

              if (resourceCollision) {
                throw new ConflictException(`Resource ${resourceCollision.resourceId} is already booked for the requested time window.`);
              }
            }

            return tx.booking.create({
              data: {
                userId,
                spaceId: dto.spaceId,
                startTime,
                endTime,
                details: {
                  create: resourceIds.map((resourceId) => ({ resourceId }))
                }
              },
              include: {
                user: { select: { id: true, name: true, email: true } },
                space: true,
                details: { include: { resource: true } }
              }
            });
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
          }
        );
      } catch (error) {
        if (this.isSerializableConflict(error) && attempt < maxAttempts) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException('Booking could not be created due to concurrent changes.');
  }

  private async updateWithSerializableRetry(
    bookingId: number,
    dto: UpdateBookingDto,
    startTime: Date,
    endTime: Date,
    resourceIds: number[]
  ) {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const existing = await tx.booking.findUnique({ where: { id: bookingId } });
            if (!existing) {
              throw new NotFoundException('Booking not found.');
            }

            if (existing.status === BookingStatus.COMPLETED || existing.status === BookingStatus.CANCELLED) {
              throw new BadRequestException('Completed or cancelled bookings cannot be modified.');
            }

            if (dto.spaceId) {
              const space = await tx.space.findUnique({ where: { id: dto.spaceId } });
              if (!space || !space.isActive) {
                throw new NotFoundException('Space not found or inactive.');
              }
            }

            if (resourceIds.length > 0) {
              const activeResources = await tx.resource.findMany({
                where: { id: { in: resourceIds }, isActive: true },
                select: { id: true }
              });

              if (activeResources.length !== resourceIds.length) {
                throw new NotFoundException('One or more resources were not found or are inactive.');
              }
            }

            if (dto.spaceId) {
              const spaceCollision = await tx.booking.findFirst({
                where: {
                  id: { not: bookingId },
                  spaceId: dto.spaceId,
                  status: { in: BLOCKING_STATUSES },
                  startTime: { lt: endTime },
                  endTime: { gt: startTime }
                },
                select: { id: true }
              });

              if (spaceCollision) {
                throw new ConflictException('Space is already booked for the requested time window.');
              }
            }

            if (resourceIds.length > 0) {
              const resourceCollision = await tx.bookingDetail.findFirst({
                where: {
                  resourceId: { in: resourceIds },
                  booking: {
                    id: { not: bookingId },
                    status: { in: BLOCKING_STATUSES },
                    startTime: { lt: endTime },
                    endTime: { gt: startTime }
                  }
                },
                select: { resourceId: true }
              });

              if (resourceCollision) {
                throw new ConflictException(`Resource ${resourceCollision.resourceId} is already booked for the requested time window.`);
              }
            }

            await tx.bookingDetail.deleteMany({ where: { bookingId } });

            return tx.booking.update({
              where: { id: bookingId },
              data: {
                spaceId: dto.spaceId,
                startTime,
                endTime,
                details: {
                  create: resourceIds.map((resourceId) => ({ resourceId }))
                }
              },
              include: {
                user: { select: { id: true, name: true, email: true } },
                space: true,
                details: { include: { resource: true } }
              }
            });
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
          }
        );
      } catch (error) {
        if (this.isSerializableConflict(error) && attempt < maxAttempts) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException('Booking could not be updated due to concurrent changes.');
  }

  private isSerializableConflict(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
  }

  async markNoShow(bookingId: number, actorId?: number, penaltyDays = 7) {
    const penaltyEndDate = new Date();
    penaltyEndDate.setDate(penaltyEndDate.getDate() + penaltyDays);

    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        user: {
          update: {
            isPenalized: true,
            penaltyEndDate
          }
        }
      },
      include: { user: true, space: true, details: { include: { resource: true } } }
    });

    this.realtime.emitBookingUpdated(booking);
    await this.audit.log({
      actorId,
      action: 'NO_SHOW',
      entityType: 'Booking',
      entityId: booking.id,
      description: `Marco ausente la reserva ${booking.id}`
    });
    return booking;
  }

  async updateStatus(bookingId: number, status: BookingStatus, actorId?: number) {
    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        space: true,
        details: { include: { resource: true } }
      }
    });

    this.realtime.emitBookingUpdated(booking);
    await this.audit.log({
      actorId,
      action: status,
      entityType: 'Booking',
      entityId: booking.id,
      description: `Cambio la reserva ${booking.id} a ${status}`
    });
    return booking;
  }

  async cancel(bookingId: number, currentUser: { id: number; role: string }) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    const isAdminOrOperator = currentUser.role === 'ADMIN' || currentUser.role === 'OPERATOR';
    if (!isAdminOrOperator && booking.userId !== currentUser.id) {
      throw new ForbiddenException('No puedes cancelar una reserva que no te pertenece.');
    }

    return this.updateStatus(bookingId, BookingStatus.CANCELLED, currentUser.id);
  }

  async complete(bookingId: number, actorId?: number, returnedAt = new Date(), penaltyDays = 7) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    const isLate = returnedAt > booking.endTime;
    const penaltyEndDate = new Date();
    penaltyEndDate.setDate(penaltyEndDate.getDate() + penaltyDays);

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.COMPLETED,
        user: isLate
          ? {
              update: {
                isPenalized: true,
                penaltyEndDate
              }
            }
          : undefined
      },
      include: { user: true, space: true, details: { include: { resource: true } } }
    });

    this.realtime.emitBookingUpdated(updated);
    await this.audit.log({
      actorId,
      action: 'COMPLETE',
      entityType: 'Booking',
      entityId: updated.id,
      description: `Completo la reserva ${updated.id}`
    });
    return updated;
  }
}
