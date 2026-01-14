import { Field, InputType } from '@nestjs/graphql';
import { MinLength } from 'class-validator';

@InputType()
export class CreateTaskInput {
  @Field()
  @MinLength(3)
  title: string;

  @MinLength(3)
  @Field()
  ownerId: string;

  //   @Field({ nullable: true })
  //   description?: string;
}
