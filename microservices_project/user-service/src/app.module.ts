import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'EMAIL_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: { host: '127.0.0.1', port: 3002 },
          // transport: Transport.REDIS,
          // options: { host: '127.0.0.1', port: 6379 },
        }),
    },
  ],
})
export class AppModule {}
