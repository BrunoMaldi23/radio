import { ResourceType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  title!: string;

  @IsEnum(ResourceType)
  type!: ResourceType;

  @IsString()
  uniqueCode!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
