import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, any>;
        message = obj.message || obj.error || message;
        errorCode = obj.code || obj.error || 'HTTP_ERROR';
        details = obj.details;
      }

      // Map domain error codes
      const msgStr = Array.isArray(message) ? message.join(' ') : String(message);
      if (status === HttpStatus.UNAUTHORIZED) {
        errorCode = errorCode === 'HTTP_ERROR' ? 'INVALID_API_KEY' : errorCode;
      } else if (status === HttpStatus.TOO_MANY_REQUESTS) {
        errorCode = 'RATE_LIMITED';
      } else if (status === HttpStatus.CONFLICT || msgStr.toLowerCase().includes('duplicate')) {
        errorCode = 'DUPLICATE_ORDER';
      } else if (status === HttpStatus.PAYMENT_REQUIRED || msgStr.toLowerCase().includes('insufficient balance')) {
        errorCode = 'INSUFFICIENT_BALANCE';
      } else if (msgStr.toLowerCase().includes('game')) {
        errorCode = 'INVALID_GAME';
      } else if (msgStr.toLowerCase().includes('product')) {
        errorCode = 'INVALID_PRODUCT';
      } else if (msgStr.toLowerCase().includes('player') || msgStr.toLowerCase().includes('server id')) {
        errorCode = 'INVALID_PLAYER_ID';
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception on ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
    }

    // Never leak stack traces to callers
    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message: Array.isArray(message) ? message.join(', ') : message,
        details,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
