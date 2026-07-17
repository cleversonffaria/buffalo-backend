import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { HttpExceptionLoggingFilter } from "src/common/filters/http-exception.filter";
import { AppModule } from "src/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
  });

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalFilters(new HttpExceptionLoggingFilter());

  await app.listen(process.env.PORT || 3001, "0.0.0.0");
}

bootstrap();
