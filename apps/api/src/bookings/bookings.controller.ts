import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BookingsService } from './bookings.service';
import { CompleteBookingDto } from './dto/complete-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.update(id, user.id, dto);
  }

  @Patch(':id/no-show')
  @Roles(Role.ADMIN, Role.OPERATOR)
  markNoShow(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.markNoShow(id, user.id);
  }

  @Patch(':id/complete')
  @Roles(Role.ADMIN, Role.OPERATOR)
  complete(@Param('id', ParseIntPipe) id: number, @Body() dto: CompleteBookingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.complete(
      id,
      user.id,
      dto.returnedAt ? new Date(dto.returnedAt) : new Date(),
      dto.penaltyDays
    );
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN, Role.OPERATOR)
  activate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.updateStatus(id, 'ACTIVE', user.id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.updateStatus(id, 'CANCELLED', user.id);
  }
}
