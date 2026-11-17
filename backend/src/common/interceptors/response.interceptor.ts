import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<{ headers?: Record<string, string> }>();
    const requestId = request.headers?.['x-request-id'];

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: requestId ? { requestId } : undefined,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}