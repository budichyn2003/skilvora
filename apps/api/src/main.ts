import { NestFactory } from '@nestjs/core';
import type { Express } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', 1);

  const allowedOrigins = new Set(
    [
      'http://localhost:3000',
      process.env.WEB_APP_URL,
      ...(process.env.ALLOWED_ORIGINS || '').split(','),
    ]
      .map((origin) => origin?.trim())
      .filter((origin): origin is string => Boolean(origin)),
  );

  app.enableCors({
    origin: [...allowedOrigins],
    credentials: true,
  });

  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0');
}
bootstrap().catch((error: unknown) => {
  console.error('Application bootstrap failed', error);
  process.exitCode = 1;
});
