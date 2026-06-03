import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FrequenciesController } from './frequencies.controller';
import { FrequenciesService } from './frequencies.service';

@Module({
  imports: [PrismaModule],
  controllers: [FrequenciesController],
  providers: [FrequenciesService]
})
export class FrequenciesModule {}
