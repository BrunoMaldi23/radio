import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateStreamMountDto } from './dto/create-stream-mount.dto';
import { CreateStreamRelayDto } from './dto/create-stream-relay.dto';
import { CreateStreamServerDto } from './dto/create-stream-server.dto';
import { UpdateStreamMetadataDto } from './dto/update-stream-metadata.dto';
import { UpdateStreamMountDto } from './dto/update-stream-mount.dto';
import { UpdateStreamServerDto } from './dto/update-stream-server.dto';
import { StreamingService } from './streaming.service';

@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Get()
  findOverview() {
    return this.streamingService.findOverview();
  }

  @Get('ingest-profiles')
  getIngestProfiles() {
    return this.streamingService.getIngestProfiles();
  }

  @Get('runtime-status')
  getRuntimeStatus() {
    return this.streamingService.getRuntimeStatus();
  }

  @Post('servers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  createServer(@Body() dto: CreateStreamServerDto) {
    return this.streamingService.createServer(dto);
  }

  @Patch('servers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  updateServer(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStreamServerDto) {
    return this.streamingService.updateServer(id, dto);
  }

  @Post('mounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  createMount(@Body() dto: CreateStreamMountDto) {
    return this.streamingService.createMount(dto);
  }

  @Patch('mounts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  updateMount(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStreamMountDto) {
    return this.streamingService.updateMount(id, dto);
  }

  @Post('relays')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  createRelay(@Body() dto: CreateStreamRelayDto) {
    return this.streamingService.createRelay(dto);
  }

  @Post('metadata')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  updateMetadata(@Body() dto: UpdateStreamMetadataDto) {
    return this.streamingService.updateMetadata(dto);
  }

  @Post('mounts/:id/status')
  ingestStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { listeners: number; status: 'ONLINE' | 'STANDBY' | 'OFFLINE' | 'DEGRADED' }
  ) {
    return this.streamingService.ingestStatus(id, dto.listeners, dto.status);
  }
}
