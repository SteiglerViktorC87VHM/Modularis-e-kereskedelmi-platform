import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

// Ez a rész aktiválja a validációt
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // Csak azokat a mezőket engedi át, amik a DTO-ban szerepelnek
    forbidNonWhitelisted: true, // Hibát dob, ha olyan adat jön, ami nincs a DTO-ban
    transform: true,       // Automatikusan átalakítja a típusokat (pl. string "5" -> number 5)
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
