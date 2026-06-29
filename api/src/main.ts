import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as net from 'net';

async function checkPortOpen(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function bootstrap() {
  const isMongoRunning = await checkPortOpen(27017, '127.0.0.1');
  
  if (!isMongoRunning) {
    console.log('⚠️ Local MongoDB not detected on port 27017.');
    console.log('🚀 Starting an in-memory MongoDB instance for development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'weatherguard',
        }
      });
      const uri = mongod.getUri();
      process.env.MONGODB_URI = uri;
      console.log(`✅ In-memory MongoDB started successfully at: ${uri}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('❌ Failed to start in-memory MongoDB:', msg);
    }
  } else {
    console.log('🟢 Local MongoDB detected on port 27017. Using it.');
  }

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
