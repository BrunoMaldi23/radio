import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContentStatus } from '@prisma/client';

export class CreateArticleDto {
  @IsString()
  slug!: string;

  @IsString()
  title!: string;

  @IsString()
  excerpt!: string;

  @IsString()
  body!: string;

  @IsString()
  category!: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;
}
