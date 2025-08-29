import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ConfigService to load from .env
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: (configService.get<string>('CORS_ORIGIN') || '*').split(','),
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // throw if unknown properties
      transform: true, // auto-transform payloads
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('CeyBlogger-API')
    .setDescription('API documentation for CeyBlogger platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 CeyBlogger-API running on http://localhost:${port}`);
  console.log(`📖 Swagger docs: http://localhost:${port}/docs`);
}
bootstrap();
