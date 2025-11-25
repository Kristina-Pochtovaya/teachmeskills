import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatus } from 'src/common/task-status.enum';

export class UpdateTaskDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsString()
  status?: TaskStatus;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
