import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { ArticlesModule } from './articles/articles.module';
import { BookingsModule } from './bookings/bookings.module';
import { HealthModule } from './health/health.module';
import { FrequenciesModule } from './frequencies/frequencies.module';
import { ProgramsModule } from './programs/programs.module';
import { PrismaModule } from './prisma/prisma.module';
import { RankingModule } from './ranking/ranking.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ResourcesModule } from './resources/resources.module';
import { SpacesModule } from './spaces/spaces.module';
import { StreamingModule } from './streaming/streaming.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RealtimeModule,
    HealthModule,
    FrequenciesModule,
    AuthModule,
    AuditModule,
    StreamingModule,
    UploadsModule,
    ArticlesModule,
    ProgramsModule,
    RankingModule,
    BookingsModule,
    SpacesModule,
    ResourcesModule,
    UsersModule
  ]
})
export class AppModule {}
