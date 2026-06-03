import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

import cors from 'cors';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

dotenv.config();

if (!global.crypto) {
  (global as any).crypto = {
    randomUUID,
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:
      'https://frontmeet-4rcr-aqoxt7tmv-alyadevs-projects-55340601.vercel.app', // Ajoute 5173 par sécurité
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`Server running on port ${process.env.PORT || 3000}`);
  console.log(`📡 WebSocket Gateway disponible sur: ws://localhost:3000/chat`);
}
bootstrap();
