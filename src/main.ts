import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Transforma tipos de datos (ej. string a number)
    whitelist: true, // Remueve propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay propiedades no definidas
    transformOptions: {
      enableImplicitConversion: true, 
    }
  }));

    app.enableCors({
    origin: 'http://localhost:4200', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
