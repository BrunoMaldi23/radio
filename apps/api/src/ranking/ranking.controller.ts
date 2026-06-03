import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateRankingTrackDto } from './dto/create-ranking-track.dto';
import { UpdateRankingTrackDto } from './dto/update-ranking-track.dto';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  findAll() {
    return this.rankingService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  create(@Body() dto: CreateRankingTrackDto) {
    return this.rankingService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRankingTrackDto) {
    return this.rankingService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rankingService.remove(id);
  }

  @Post(':id/vote')
  vote(@Param('id', ParseIntPipe) id: number, @Body() dto: { ipHash?: string }) {
    return this.rankingService.vote(id, dto.ipHash);
  }
}
