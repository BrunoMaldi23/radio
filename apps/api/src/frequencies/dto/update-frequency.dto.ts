import { PartialType } from '@nestjs/mapped-types';
import { CreateFrequencyDto } from './create-frequency.dto';

export class UpdateFrequencyDto extends PartialType(CreateFrequencyDto) {}
