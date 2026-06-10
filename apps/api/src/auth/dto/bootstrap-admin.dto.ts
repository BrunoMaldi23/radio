import { IsString, MinLength } from 'class-validator';

export class BootstrapAdminDto {
  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  bootstrapToken!: string;
}
