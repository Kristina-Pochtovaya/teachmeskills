import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

@Injectable()
export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatused = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.BLOCKED,
    TaskStatus.DONE,
  ];

  transform(value: any) {
    if (!value) {
      return;
    }

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`Invalid status: ${value}`);
    }

    return value as TaskStatus;
  }

  private isStatusValid(status: any): boolean {
    return this.allowedStatused.includes(status);
  }
}
