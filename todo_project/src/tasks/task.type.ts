import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TaskType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  // @Field()
  // description: string;

  @Field()
  completed: boolean;
}
