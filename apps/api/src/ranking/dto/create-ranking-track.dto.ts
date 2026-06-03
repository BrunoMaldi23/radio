import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRankingTrackDto {
  @IsString()
  title!: string;

  @IsString()
  artist!: string;

  @IsString()
  @IsOptional()
  artworkUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
