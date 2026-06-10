import { Body, Controller, Get, Headers, Param, ParseIntPipe, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  private readonly internalApiKey: string;

  constructor(
    private readonly streamingService: StreamingService,
    private readonly config: ConfigService
  ) {
    this.internalApiKey = this.config.get<string>('INTERNAL_API_KEY') ?? '';
  }

  private checkInternalKey(key: string | undefined) {
    if (!this.internalApiKey || key !== this.internalApiKey) {
      throw new UnauthorizedException('API key inválida');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findOverview() {
    return this.streamingService.findOverview();
  }

  @Get('ingest-profiles')
  @UseGuards(JwtAuthGuard)
  getIngestProfiles() {
    return this.streamingService.getIngestProfiles();
  }

  @Get('runtime-status')
  @UseGuards(JwtAuthGuard)
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
    @Headers('x-api-key') apiKey: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { listeners: number; status: 'ONLINE' | 'STANDBY' | 'OFFLINE' | 'DEGRADED' }
  ) {
    this.checkInternalKey(apiKey);
    return this.streamingService.ingestStatus(id, dto.listeners, dto.status);
  }
}
