import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';
import { Response } from 'express';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimitService: RateLimitService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    // Determine identifier: API Key ID > User ID > Client IP
    const apiKeyId = request.user?.apiKeyId;
    const userId = request.user?.id;
    const ip = request.ip || request.connection?.remoteAddress || '127.0.0.1';

    const identifier = apiKeyId ? `key:${apiKeyId}` : userId ? `usr:${userId}` : `ip:${ip}`;

    const customLimit = request.user?.reseller?.rateLimitPerMinute;
    const result = this.rateLimitService.checkRateLimit(identifier, customLimit);

    // Set standard rate limit headers
    response.setHeader('X-RateLimit-Limit', result.limit);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', result.resetInSeconds);

    if (!result.allowed) {
      response.setHeader('Retry-After', result.resetInSeconds);
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          message: `Too many requests. Limit is ${result.limit} requests per minute. Try again in ${result.resetInSeconds} seconds.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
