import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS for admin dashboard
  app.enableCors({
    origin: configService.get('ADMIN_URL') || 'http://localhost:5173',
    credentials: true,
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Weather Alert API running on http://localhost:${port}`);
}

bootstrap();
