import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProgramStatus } from '@prisma/client';

export class CreateProgramDto {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsString()
  host!: string;

  @IsString()
  description!: string;

  @IsString()
  schedule!: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus;
}
