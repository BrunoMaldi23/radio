import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateRankingTrackDto } from './dto/create-ranking-track.dto';
import { UpdateRankingTrackDto } from './dto/update-ranking-track.dto';

@Injectable()
export class RankingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway
  ) {}

  findAll() {
    return this.prisma.rankingTrack.findMany({
      where: { isActive: true },
      orderBy: [{ votes: 'desc' }, { title: 'asc' }]
    });
  }

  async create(dto: CreateRankingTrackDto) {
    const existing = await this.prisma.rankingTrack.findUnique({
      where: { title_artist: { title: dto.title, artist: dto.artist } }
    });

    if (existing) {
      return this.prisma.rankingTrack.update({
        where: { id: existing.id },
        data: { ...dto, isActive: true }
      });
    }

    return this.prisma.rankingTrack.create({ data: dto });
  }

  update(id: number, dto: UpdateRankingTrackDto) {
    return this.prisma.rankingTrack.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.rankingTrack.delete({ where: { id } });
  }

  async vote(trackId: number, ipHash?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.vote.create({ data: { trackId, ipHash } });
      return tx.rankingTrack.update({
        where: { id: trackId },
        data: { votes: { increment: 1 } }
      });
    });

    const ranking = await this.findAll();
    this.realtime.emitRankingUpdated({ track: result, ranking });
    return result;
  }
}
