import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { BullModule } from '@nestjs/bull';
import { TasksCacheProcessor } from './tasks-cache.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'tasks' }),
    TypeOrmModule.forFeature([Task]),
  ],
  providers: [TasksService, TasksCacheProcessor],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
