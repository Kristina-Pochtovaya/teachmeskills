import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TasksService } from 'src/tasks/tasks.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsTitleExistingConstraint implements ValidatorConstraintInterface {
  constructor(private readonly tasksService: TasksService) {}

  async validate(title: string) {
    const tasks = await this.tasksService.findAll();
    const existingTitles = tasks.map((task) => task.title.toLocaleLowerCase());

    if (existingTitles.includes(title.toLocaleLowerCase())) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'Title $value should be unique';
  }
}

export function IsTitleExisting(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsTitleExisting',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsTitleExistingConstraint,
      async: true,
    });
  };
}
