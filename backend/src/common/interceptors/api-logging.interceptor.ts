import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API-Traffic');

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();
    const requestId = (request.headers['x-request-id'] as string) || `REQ-${crypto.randomBytes(8).toString('hex')}`;
    response.setHeader('X-Request-Id', requestId);

    const method = request.method;
    const url = request.originalUrl || request.url;
    const ip = request.ip || request.connection?.remoteAddress || '127.0.0.1';
    const userAgent = (request.headers['user-agent'] as string)?.substring(0, 255) || 'Unknown';

    return next.handle().pipe(
      tap(() => {
        const responseTimeMs = Date.now() - startTime;
        const statusCode = response.statusCode || 200;

        this.logTraffic({
          requestId,
          resellerId: request.user?.resellerId,
          apiKeyId: request.user?.apiKeyId,
          endpoint: url,
          httpMethod: method,
          statusCode,
          responseTimeMs,
          ipAddress: ip,
          userAgent,
        });
      }),
      catchError((err) => {
        const responseTimeMs = Date.now() - startTime;
        const statusCode = err.status || err.statusCode || 500;
        const errorMessage = typeof err.message === 'string' ? err.message.substring(0, 255) : 'Error';

        this.logTraffic({
          requestId,
          resellerId: request.user?.resellerId,
          apiKeyId: request.user?.apiKeyId,
          endpoint: url,
          httpMethod: method,
          statusCode,
          responseTimeMs,
          ipAddress: ip,
          userAgent,
          errorMessage,
        });

        throw err;
      }),
    );
  }

  private logTraffic(data: {
    requestId: string;
    resellerId?: string;
    apiKeyId?: string;
    endpoint: string;
    httpMethod: string;
    statusCode: number;
    responseTimeMs: number;
    ipAddress?: string;
    userAgent?: string;
    errorMessage?: string;
  }) {
    // Only log external API endpoints, ignore internal frontend polling
    if (!data.endpoint.includes('/api/')) return;
    if (
      data.endpoint.includes('/reseller/dashboard') ||
      data.endpoint.includes('/auth/me') ||
      data.endpoint.includes('/auth/profile') ||
      data.endpoint.includes('/orders/sync')
    ) {
      return;
    }

    this.prisma.apiRequestLog
      .create({
        data: {
          requestId: data.requestId,
          resellerId: data.resellerId || null,
          apiKeyId: data.apiKeyId || null,
          endpoint: data.endpoint,
          httpMethod: data.httpMethod,
          statusCode: data.statusCode,
          responseTimeMs: data.responseTimeMs,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          errorMessage: data.errorMessage || null,
        },
      })
      .catch(() => {
        // Safe catch: DB logging shouldn't crash active response stream
      });
  }
}
