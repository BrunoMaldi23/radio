import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStreamMetadataDto {
  @IsInt()
  serverId!: number;

  @IsInt()
  @IsOptional()
  mountId?: number;

  @IsString()
  title!: string;

  @IsString()
  artist!: string;

  @IsString()
  @IsOptional()
  artworkUrl?: string;

  @IsString()
  @IsOptional()
  source?: string;
}
