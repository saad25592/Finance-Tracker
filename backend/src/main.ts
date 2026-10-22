import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // এই লাইনটি ফ্রন্টএন্ডকে ডাটা নেওয়ার পারমিশন দেবে
  await app.listen(3000);
}
bootstrap();