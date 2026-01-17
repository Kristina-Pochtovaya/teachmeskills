import { Resolver, Subscription } from '@nestjs/graphql';
import { TaskType } from './task.type';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';

@Resolver(() => TaskType)
export class TasksSubscriptionResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: PubSub) {}

  @Subscription(() => TaskType, {
    name: 'taskCreated',
  })
  taskCreated() {
    return this.pubSub.asyncIterableIterator('taskCreated');
  }
}
