import { PartialType } from '@nestjs/mapped-types';
import { CreateStreamServerDto } from './create-stream-server.dto';

export class UpdateStreamServerDto extends PartialType(CreateStreamServerDto) {}
