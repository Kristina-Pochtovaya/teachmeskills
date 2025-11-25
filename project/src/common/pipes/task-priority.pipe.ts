import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { TaskPriority } from '../task-priority';

@Injectable()
export class TaskPriorityPipe implements PipeTransform {
  transform(task: CreateTaskDto) {
    if (!task.priority) {
      return task;
    }

    switch (task.priority) {
      case TaskPriority.LOW:
        return task;

      case TaskPriority.MEDIUM:
        if (!task.deadline) {
          throw new BadRequestException('Deadline is required!');
        }
        return task;
      case TaskPriority.HIGH:
        const now = Date.now();

        if (!task.deadline) {
          throw new BadRequestException('Deadline is required!');
        }

        const deadlineTime = new Date(task.deadline).getTime();
        if (deadlineTime <= now) {
          throw new BadRequestException('Deadline must be in a future!');
        }

        const hours24 = 24 * 60 * 60 * 1000;

        if (deadlineTime - now > hours24) {
          throw new BadRequestException(
            'Deadline cannot be more than 24 hours from now!',
          );
        }

        return task;
    }
  }
}
