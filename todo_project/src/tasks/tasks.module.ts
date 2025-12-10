import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
// import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [
    // CacheModule.register({
    //   ttl: 200_000,
    //   isGlobal: true,
    // }),
    CacheModule,
    TypeOrmModule.forFeature([Task]),
  ],
  providers: [
    TasksService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
