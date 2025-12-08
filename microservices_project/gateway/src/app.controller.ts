import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, retry, throwError, timeout } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Controller()
export class AppController {
  constructor(@Inject('USER_SERVICE') private userService: ClientProxy) {}

  @Get(':id')
  getUser(@Param() id: number) {
    const observable = this.userService.send('get-user', id).pipe(
      timeout(5000),
      retry(2),
      catchError((error) => {
        return throwError(
          () => new Error('[user-service] is not available, try later', error),
        );
      }),
    );
    return lastValueFrom(observable);
  }

  @Post()
  creatUser(@Req() req, @Body() body: { name: string; email?: string }) {
    const requestId = uuid();
    const traceId = req.traceId;

    const result = this.userService
      .send('create-user', {
        requestId,
        traceId,
        name: body.name,
        email: body.email,
      })
      .pipe(
        retry(3),
        catchError((error) => {
          console.error('[gateway] create-user failed after retries', {
            error: error?.message ?? error,
            requestId,
          });

          return throwError(
            () => new Error('user service is unavailable, try later'),
          );
        }),
      );

    return lastValueFrom(result);
  }
}
