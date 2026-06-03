import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CompleteBookingDto {
  @IsDateString()
  @IsOptional()
  returnedAt?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  penaltyDays?: number;
}
