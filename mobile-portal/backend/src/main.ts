import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // CORS para o app mobile
  app.enableCors({
    origin: '*', // Em produção, especificar origens permitidas
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Portal do Cliente API rodando na porta ${port}`);
  console.log(`📱 Endpoints disponíveis:`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - GET  /api/clients/profile`);
  console.log(`   - GET  /api/boletos`);
  console.log(`   - GET  /api/boletos/resumo`);
  console.log(`   - GET  /api/documents`);
  console.log(`   - GET  /api/notifications`);
}
bootstrap();
