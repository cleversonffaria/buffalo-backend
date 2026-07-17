import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionLoggingFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionLoggingFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : Array.isArray((exceptionResponse as { message?: unknown } | null)?.message)
          ? (exceptionResponse as { message: string[] }).message.join(", ")
          : typeof (exceptionResponse as { message?: unknown } | null)?.message === "string"
            ? (exceptionResponse as { message: string }).message
            : exception instanceof Error
              ? exception.message
              : "Erro interno do servidor";

    this.logger.error(
      `${request.method} ${request.originalUrl} -> ${status} ${message}`,
      exception instanceof Error ? exception.stack : undefined
    );

    if (response.headersSent) {
      return;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }
}
