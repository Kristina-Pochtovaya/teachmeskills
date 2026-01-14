import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { BullModule } from '@nestjs/bull';
import { TasksCacheProcessor } from './tasks-cache.processor';
import { TasksSendWelcomeProcessor } from './tasks-send-welcome.processor';
import { TasksResolver } from './tasks.resolver';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'tasks' }),
    BullModule.registerQueue({ name: 'email' }),
    TypeOrmModule.forFeature([Task]),
  ],
  providers: [
    TasksService,
    TasksResolver,
    TasksCacheProcessor,
    TasksSendWelcomeProcessor,
  ],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
