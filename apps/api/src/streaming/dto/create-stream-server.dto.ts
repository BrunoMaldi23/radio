import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { StreamProtocol } from '@prisma/client';

export class CreateStreamServerDto {
  @IsString()
  name!: string;

  @IsEnum(StreamProtocol)
  @IsOptional()
  protocol?: StreamProtocol;

  @IsString()
  publicHost!: string;

  @IsString()
  @IsOptional()
  internalHost?: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  port?: number;

  @IsBoolean()
  @IsOptional()
  tlsEnabled?: boolean;

  @IsString()
  @IsOptional()
  sourceUsername?: string;

  @IsString()
  sourcePasswordRef!: string;

  @IsString()
  @IsOptional()
  adminUsername?: string;

  @IsString()
  adminPasswordRef!: string;

  @IsString()
  @IsOptional()
  encoder?: string;

  @IsString()
  @IsOptional()
  codec?: string;

  @IsInt()
  @Min(24)
  @Max(512)
  @IsOptional()
  bitrateKbps?: number;

  @IsString()
  @IsOptional()
  fallbackPlaylist?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
