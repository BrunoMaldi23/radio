import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';

@Module({
  imports: [AuditModule],
  controllers: [SpacesController],
  providers: [SpacesService]
})
export class SpacesModule {}
