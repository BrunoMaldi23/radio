import { ArrayUnique, IsArray, IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  spaceId?: number;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  resourceIds!: number[];
}
