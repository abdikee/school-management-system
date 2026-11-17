import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { user?: { id?: string } }>();
    const userId = request.user?.id;
    const path = request.originalUrl || request.url;

    if (!userId || path.includes('/auth/login') || path.includes('/auth/refresh')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (response: unknown) => {
          void this.writeAuditLog(request, userId, 200, response);
        },
        error: (error: { status?: number; getStatus?: () => number; message?: string }) => {
          void this.writeAuditLog(
            request,
            userId,
            error.getStatus?.() || error.status || 500,
            { message: error.message },
          );
        },
      }),
    );
  }

  private async writeAuditLog(
    request: Request,
    userId: string,
    statusCode: number,
    response?: unknown,
  ): Promise<void> {
    try {
      const mutation = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: `${request.method} ${request.path}`,
          entity: 'API',
          ipAddress: request.ip,
          userAgent: request.get('user-agent'),
          oldData: mutation ? this.sanitize(request.body) : undefined,
          newData: this.sanitize({ statusCode, response }),
        },
      });
    } catch (error) {
      this.logger.error('Unable to write audit log', error instanceof Error ? error.stack : String(error));
    }
  }

  private sanitize(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === undefined) return undefined;
    if (value === null) return undefined;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    if (Array.isArray(value)) return value.map((item) => this.sanitize(item) ?? null);

    const sensitive = /password|token|secret|authorization|cookie/i;
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !sensitive.test(key))
        .map(([key, item]) => [key, this.sanitize(item) ?? null]),
    );
  }
}
