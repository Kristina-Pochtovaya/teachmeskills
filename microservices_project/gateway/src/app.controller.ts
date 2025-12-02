import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, lastValueFrom, retry, timeout } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private userService: ClientProxy,
    @Inject('EMAIL_SERVICE') private emailService: ClientProxy,
  ) {}

  @Get(':id')
  getUser(@Param() id: number) {
    const observable = this.userService.send('get-user', id).pipe(
      timeout(5000),
      retry(2),
      catchError((error) => {
        console.error('[user-service] request failed:', error);

        throw new RpcException('[user-service] is not available');
      }),
    );
    return lastValueFrom(observable);
  }

  @Post()
  creatUser(@Body() body: { email?: string }) {
    const user = { id: Date.now(), email: body.email };

    this.userService.emit('user-created', user.id);
    this.emailService.emit('user-created', user.email);
    return { status: 'ok' };
  }
}
