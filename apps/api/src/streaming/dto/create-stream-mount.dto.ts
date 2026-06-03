import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MountStatus } from '@prisma/client';

export class CreateStreamMountDto {
  @IsInt()
  serverId!: number;

  @IsString()
  path!: string;

  @IsString()
  displayName!: string;

  @IsString()
  format!: string;

  @IsInt()
  @Min(24)
  @Max(512)
  bitrateKbps!: number;

  @IsEnum(MountStatus)
  @IsOptional()
  status?: MountStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  listeners?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxListeners?: number;

  @IsString()
  publicUrl!: string;

  @IsString()
  @IsOptional()
  hlsUrl?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
