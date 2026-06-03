import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateFrequencyDto {
  @IsString()
  city!: string;

  @IsString()
  dial!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
