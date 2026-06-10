import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { ArticlesModule } from './articles/articles.module';
import { BookingsModule } from './bookings/bookings.module';
import { ChatModule } from './chat/chat.module';
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
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: config.get<string>('NODE_ENV') === 'production' ? 60 : 120
          }
        ]
      })
    }),
    PrismaModule,
    RealtimeModule,
    HealthModule,
    FrequenciesModule,
    AuthModule,
    AuditModule,
    StreamingModule,
    UploadsModule,
    ChatModule,
    ArticlesModule,
    ProgramsModule,
    RankingModule,
    BookingsModule,
    SpacesModule,
    ResourcesModule,
    UsersModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
