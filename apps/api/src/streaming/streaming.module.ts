import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [StreamingController],
  providers: [StreamingService],
  exports: [StreamingService]
})
export class StreamingModule {}
