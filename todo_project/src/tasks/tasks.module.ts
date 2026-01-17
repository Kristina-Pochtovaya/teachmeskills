import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { BullModule } from '@nestjs/bull';
import { TasksCacheProcessor } from './tasks-cache.processor';
import { TasksSendWelcomeProcessor } from './tasks-send-welcome.processor';
import { TasksResolver } from './tasks.resolver';
import { TaskByIdLoader } from './tasks-by-id.loader';
import { UsersModule } from 'src/users/users.module';
import { TasksSubscriptionResolver } from './tasks.subscription.resolver';
import { PubSub } from 'graphql-subscriptions';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'tasks' }),
    BullModule.registerQueue({ name: 'email' }),
    TypeOrmModule.forFeature([Task]),
    UsersModule,
  ],
  providers: [
    TasksService,
    TasksResolver,
    TaskByIdLoader,
    TasksSubscriptionResolver,
    TasksCacheProcessor,
    TasksSendWelcomeProcessor,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
