import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import corsOptionsDelegate from './utils/cors'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // cors: true, // 跨域处理
  });

  app.enableCors(corsOptionsDelegate)
  
  await app.listen(3000);
}
bootstrap();
