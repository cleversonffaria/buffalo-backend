import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NextFunction, Request, Response } from "express";
import { HttpExceptionLoggingFilter } from "src/common/filters/http-exception.filter";
import { AppModule } from "src/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Http");

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
  app.use((request: Request, response: Response, next: NextFunction) => {
    const startedAt = Date.now();

    response.on("finish", () => {
      logger.log(
        `${request.method} ${request.originalUrl} -> ${response.statusCode} ${Date.now() - startedAt}ms`
      );
    });

    next();
  });

  await app.listen(process.env.PORT || 3001, "0.0.0.0");
}

bootstrap();
