import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateStreamMountDto } from './dto/create-stream-mount.dto';
import { CreateStreamRelayDto } from './dto/create-stream-relay.dto';
import { CreateStreamServerDto } from './dto/create-stream-server.dto';
import { UpdateStreamMetadataDto } from './dto/update-stream-metadata.dto';
import { UpdateStreamMountDto } from './dto/update-stream-mount.dto';
import { UpdateStreamServerDto } from './dto/update-stream-server.dto';

@Injectable()
export class StreamingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway
  ) {}

  findOverview() {
    return this.prisma.streamServer.findMany({
      include: {
        mounts: { orderBy: { path: 'asc' } },
        relays: { orderBy: { region: 'asc' } },
        metadata: {
          where: { isCurrent: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }]
    });
  }

  getIngestProfiles() {
    return {
      audio: {
        name: 'Icecast Audio',
        server: process.env.ICECAST_PUBLIC_URL ?? 'http://localhost:8000/radio',
        host: 'localhost',
        port: 8000,
        mount: '/radio',
        username: 'source',
        passwordRef: 'secret://radio/icecast/source',
        recommendedEncoder: 'BUTT, Mixxx, Liquidsoap or FFmpeg',
        ffmpegExample:
          'ffmpeg -re -i input.mp3 -content_type audio/mpeg -f mp3 icecast://source:hackme-source@localhost:8000/radio'
      },
      video: {
        name: 'MediaMTX TV',
        obsService: 'Custom',
        obsServer: process.env.MEDIAMTX_RTMP_URL ?? 'rtmp://localhost:1935',
        obsStreamKey: 'tv',
        hlsPlaybackUrl: process.env.MEDIAMTX_HLS_URL ?? 'http://localhost:8888/tv/index.m3u8',
        srtPublishUrl: 'srt://localhost:8890?streamid=publish:tv',
        recommendedVideoBitrateKbps: 4500,
        recommendedAudioBitrateKbps: 160,
        keyframeIntervalSeconds: 2
      }
    };
  }

  async getRuntimeStatus() {
    const mediaMtxApiUrl = process.env.MEDIAMTX_API_URL ?? 'http://localhost:9997';
    const hlsUrl = process.env.MEDIAMTX_HLS_URL ?? 'http://localhost:8888/tv/index.m3u8';
    const icecastUrl = process.env.ICECAST_PUBLIC_URL ?? 'http://localhost:8000/radio';
    const icecastStatusUrl = process.env.ICECAST_STATUS_URL ?? new URL('/status-json.xsl', icecastUrl).toString();

    const [paths, hls, icecast] = await Promise.allSettled([
      fetch(`${mediaMtxApiUrl}/v3/paths/list`).then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.error ?? `MediaMTX API responded ${response.status}`);
        }

        return body;
      }),
      fetch(hlsUrl).then((response) => ({ ok: response.ok, status: response.status })),
      fetch(icecastStatusUrl).then((response) => ({
        ok: response.ok || response.status === 404,
        status: response.status
      }))
    ]);

    return {
      mediamtx: {
        ok: paths.status === 'fulfilled',
        paths: paths.status === 'fulfilled' ? paths.value : null,
        error: paths.status === 'rejected' ? paths.reason?.message ?? 'MediaMTX unavailable' : null
      },
      hls: hls.status === 'fulfilled' ? hls.value : { ok: false, status: 0 },
      icecast: icecast.status === 'fulfilled' ? icecast.value : { ok: false, status: 0 }
    };
  }

  createServer(dto: CreateStreamServerDto) {
    return this.prisma.streamServer.create({ data: dto });
  }

  async updateServer(id: number, dto: UpdateStreamServerDto) {
    const server = await this.prisma.streamServer.update({ where: { id }, data: dto });
    this.realtime.emitStreamStatus({ serverId: id, type: 'server.updated', server });
    return server;
  }

  createMount(dto: CreateStreamMountDto) {
    return this.prisma.streamMount.create({ data: dto });
  }

  async updateMount(id: number, dto: UpdateStreamMountDto) {
    const mount = await this.prisma.streamMount.update({ where: { id }, data: dto });
    this.realtime.emitStreamStatus({ mountId: id, type: 'mount.updated', mount });
    return mount;
  }

  createRelay(dto: CreateStreamRelayDto) {
    return this.prisma.streamRelay.create({ data: dto });
  }

  async updateMetadata(dto: UpdateStreamMetadataDto) {
    const server = await this.prisma.streamServer.findUnique({ where: { id: dto.serverId } });

    if (!server) {
      throw new NotFoundException('Stream server not found');
    }

    await this.prisma.streamMetadata.updateMany({
      where: {
        serverId: dto.serverId,
        mountId: dto.mountId ?? null,
        isCurrent: true
      },
      data: { isCurrent: false }
    });

    const metadata = await this.prisma.streamMetadata.create({
      data: {
        serverId: dto.serverId,
        mountId: dto.mountId,
        title: dto.title,
        artist: dto.artist,
        artworkUrl: dto.artworkUrl,
        source: dto.source ?? 'manual',
        isCurrent: true
      }
    });

    this.realtime.emitStreamMetadata(metadata);
    return metadata;
  }

  async ingestStatus(mountId: number, listeners: number, status: 'ONLINE' | 'STANDBY' | 'OFFLINE' | 'DEGRADED') {
    const mount = await this.prisma.streamMount.update({
      where: { id: mountId },
      data: { listeners, status }
    });
    this.realtime.emitStreamStatus({ type: 'mount.health', mount });
    return mount;
  }
}
