import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { TaskType } from './task.type';
import { TasksService } from './tasks.service';
import { CreateTaskInput } from './create-task.input';
import { UpdateTaskInput } from './update-task.input';
import { TaskByIdLoader } from './tasks-by-id.loader';
import { UserByIdLoader } from 'src/users/user-by-id.loader';
import { UserType } from 'src/users/user.type';
import { Task } from './task.entity';
import { UsersService } from 'src/users/users.service';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => TaskType)
export class TasksResolver {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
    private readonly taskByIdLoader: TaskByIdLoader,
    private readonly userByIdLoader: UserByIdLoader,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => [TaskType], { name: 'tasks' })
  findAll() {
    return this.tasksService.findAll(1, 10);
  }

  @Query(() => TaskType, { name: 'task' })
  // findOne(@Args('id', { type: () => ID }) id: string) {
  //   return this.tasksService.findOne(id);
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.taskByIdLoader.loader.load(id);
  }

  @ResolveField(() => UserType, { name: 'owner' })
  owner(@Parent() task: Task) {
    // return this.usersService.findOne(task.ownerId);
    return this.userByIdLoader.loader.load(task.ownerId);
  }

  @Mutation(() => TaskType)
  async createTask(@Args('input') input: CreateTaskInput) {
    const task = this.tasksService.create(input);

    await this.pubSub.publish('taskCreated', { taskCreated: task });

    return task;
  }

  @Mutation(() => TaskType)
  updateTask(@Args('input') input: UpdateTaskInput) {
    return this.tasksService.update(input.id, input);
  }

  @Mutation(() => Boolean)
  removeTask(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.remove(id).then(() => true);
  }
}
