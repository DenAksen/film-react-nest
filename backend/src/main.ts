import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { LoggerFactory } from './logger/logger.factory';

async function bootstrap() {
  const logger = LoggerFactory.createLogger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(logger);
  app.setGlobalPrefix('api/afisha');
  app.enableCors();

  logger.log(
    `Application starting with LOG_FORMAT=${process.env.LOG_FORMAT || 'dev'}`,
  );

  await app.listen(3000);

  logger.log('Application successfully started on port 3000');
}
bootstrap();
