import { PartialType } from '@nestjs/mapped-types';
import { CreateRankingTrackDto } from './create-ranking-track.dto';

export class UpdateRankingTrackDto extends PartialType(CreateRankingTrackDto) {}
