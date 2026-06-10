import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { static as serveStatic } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const webOrigin = (config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (config.get('NODE_ENV') === 'production' && !config.get<string>('JWT_SECRET')) {
    throw new Error('JWT_SECRET es obligatorio en producción');
  }

  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use(cookieParser());
  app.use((request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.setHeader('Cross-Origin-Resource-Policy', request.path.startsWith('/uploads/') ? 'cross-origin' : 'same-site');
    response.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https: wss:; media-src 'self' https:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';");
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(
    '/uploads',
    serveStatic(join(process.cwd(), 'uploads'), {
      maxAge: '30d',
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', 'inline');
      }
    })
  );

  app.enableCors({
    origin: webOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  await app.listen(config.get<number>('PORT') ?? 3001);
}

void bootstrap();
