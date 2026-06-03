import { PartialType } from '@nestjs/mapped-types';
import { CreateStreamMountDto } from './create-stream-mount.dto';

export class UpdateStreamMountDto extends PartialType(CreateStreamMountDto) {}
