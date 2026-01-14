import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpdateTaskInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  title?: string;

  //   @Field({ nullable: true })
  //   description?: string;

  @Field({ nullable: true })
  @IsOptional()
  completed?: boolean;
}
