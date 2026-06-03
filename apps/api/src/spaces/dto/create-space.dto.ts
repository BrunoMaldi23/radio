import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsString()
  features!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
