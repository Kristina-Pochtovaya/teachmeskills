import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { TasksService } from 'src/tasks/tasks.service';

const changeType = {
  POST: 'created',
  PUT: 'updated',
  PATCH: 'updated',
  DELETE: 'deleted',
} as const;

const changeTypes = Object.keys(changeType);

@Injectable()
export class LoggerChangeTaskDataInterceptor implements NestInterceptor {
  constructor(private readonly tasksService: TasksService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const { method, user, url, body } = request;

    if (!changeTypes.includes(method)) {
      throw new BadRequestException(
        `Just POST, PUT, PATCH or DELETE method is expected, not the current: ${method}`,
      );
    }

    const task = await this.tasksService.findOne(request.params.id);

    const diff = {};

    return next.handle().pipe(
      tap(() => {
        const now = new Date().toLocaleString();

        console.log(
          `User ${user.id} ${changeType[method]} data by the ${url} at ${now}.
            `,
        );

        if (method === 'PATCH') {
          Object.keys(task).forEach((key) => {
            if (Object.keys(body).includes(key)) {
              const oldValue = JSON.stringify({ [key]: task[key] });
              const newValue = JSON.stringify({ [key]: body[key] });

              if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                diff[key] = { old: oldValue, new: newValue };
              }
            }
          });

          if (Object.keys(diff).length > 0) {
            console.log(`Here is the diff:\n${JSON.stringify(diff, null, 2)}`);
          }
        } else {
          console.log(`Here is the data: ${JSON.stringify(body)}`);
        }
      }),
    );
  }
}
