import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

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
  @IsString()
  @IsOptional()
  completed?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  ownerId?: string;
}
