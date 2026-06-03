import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateStreamRelayDto {
  @IsInt()
  serverId!: number;

  @IsString()
  region!: string;

  @IsString()
  url!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  latencyMs?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
