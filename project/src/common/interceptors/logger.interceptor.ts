import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const { method, url } = request;
    const now = Date.now();

    console.log(`[REQ] ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const ms = now - Date.now();
        console.log(`[RES] ${method} ${url} ${ms}ms`);
      }),
    );
  }
}
