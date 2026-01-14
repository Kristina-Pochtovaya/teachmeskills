import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(3)
  ownerId: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
