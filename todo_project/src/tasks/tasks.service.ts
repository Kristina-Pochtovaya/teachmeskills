import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue('tasks') private readonly tasksQueue: Queue,
  ) {}

  private async enqueuInvalidateTaskCache(taskId: string) {
    await this.tasksQueue.add(
      'invalidate-task-cache',
      { taskId },
      {
        attempts: 5,
        backoff: { delay: 1000, type: 'exponential' },
        removeOnComplete: false,
      },
    );
  }

  async findAll(
    page: number,
    limit: number,
    completed?: boolean,
  ): Promise<{
    data: Task[];
    metadata: { page: number; limit: number; total: number };
  }> {
    const query = this.taskRepo
      .createQueryBuilder('task')
      .orderBy('task.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (completed !== undefined) {
      query.where({ completed });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      metadata: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string): Promise<Task> {
    const key = `tasks:${id}`;
    const cached = await this.cacheManager.get<Task>(key);

    if (cached) {
      console.log('CACHE HIT', key);
      return cached;
    }

    console.log('DB call: find one', id);

    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} - not found`);
    }

    await this.cacheManager.set(key, task);

    return task;
  }

  async create(dto: CreateTaskDto, token: string): Promise<Task> {
    const task = this.taskRepo.create({
      title: dto.title,
      completed: dto.completed ?? false,
    });

    return this.taskRepo.save(task);
  }

  async getOwnedTask(id: string, token?: string): Promise<Task> {
    return this.findOne(id);
  }

  async update(id: string, dto: UpdateTaskDto, token: string): Promise<Task> {
    // await this.getOwnedTask(id, token);

    const task = await this.findOne(id);

    this.taskRepo.merge(task, {
      title: dto.title ?? task.title,
      completed: dto.completed ?? task.completed,
    });

    const savedTask = await this.taskRepo.save(task);
    await this.enqueuInvalidateTaskCache(id);
    return savedTask;
  }

  async complete(id: string, token: string): Promise<Task> {
    const task = await this.getOwnedTask(id, token);

    if (!task.completed) {
      task.completed = true;
      await this.taskRepo.save(task);
    }

    this.enqueuInvalidateTaskCache(id);
    return task;
  }

  async completeMany(ids: string[]) {
    const runner = this.dataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();

    try {
      const tasks = await runner.manager.find(Task, {
        where: { id: In(ids) },
        withDeleted: false,
      });

      if (tasks.length !== ids.length) {
        throw new ForbiddenException('some tasks are not found');
      }

      await runner.manager
        .createQueryBuilder()
        .update(Task)
        .set({ completed: true })
        .where({ id: In(ids) })
        .execute();

      await runner.commitTransaction();
      await Promise.all(ids.map((id) => this.enqueuInvalidateTaskCache(id)));
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async restore(ids: string[]) {
    const runner = this.dataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();

    try {
      const tasks = await runner.manager.find(Task, {
        where: { id: In(ids) },
        withDeleted: true,
      });

      if (tasks.length !== ids.length) {
        throw new ForbiddenException('some tasks are not found');
      }

      await runner.manager
        .createQueryBuilder()
        .restore()
        .from(Task)
        .where({ id: In(ids) })
        .execute();

      await runner.commitTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async remove(id: string, token: string): Promise<void> {
    const task = await this.getOwnedTask(id, token);
    this.taskRepo.softDelete(task.id);
    this.enqueuInvalidateTaskCache(id);
  }

  toHateoas(task: Task) {
    return {
      ...task,
      _links: {
        self: { href: `/task/${task.id}` },
        update: { href: `/task/${task.id}`, method: 'PATCH' },
        delete: { href: `/task/${task.id}`, method: 'DELETE' },
        complete: { href: `/task/${task.id}/complete`, method: 'POST' },
      },
    };
  }
}
