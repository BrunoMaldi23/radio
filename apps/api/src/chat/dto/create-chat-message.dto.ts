import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  @Length(1, 28)
  author!: string;

  @IsString()
  @Length(1, 180)
  message!: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9-]{1,32}$/i)
  room?: string;
}
