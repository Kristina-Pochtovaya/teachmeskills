import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { isArray } from 'class-validator';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();
    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    this.logger.error(
      `Error on ${request.method} ${request.url}`,
      (exception as any)?.stack ?? String(exception),
    );

    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.url,
      statusCode: status,
      message: this.normalizeMessage(exceptionResponse),
      error: this.extractErrorCode(exceptionResponse),
    };

    response.status(status).json(errorResponse);
  }

  private normalizeMessage(exceptionResponse: unknown) {
    if (typeof exceptionResponse === 'string') {
      return [exceptionResponse];
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const message = exceptionResponse.message;

      if (isArray(message)) {
        return message;
      }
      if (typeof message === 'string') {
        return [message];
      }
      return ['Internal server error'];
    }
  }

  private extractErrorCode(exceptionResponse: unknown) {
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'error' in exceptionResponse
    ) {
      return String(exceptionResponse.error);
    }
    return null;
  }
}
