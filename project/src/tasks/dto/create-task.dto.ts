import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TaskPriority } from 'src/common/task-priority';
import { TaskStatus } from 'src/common/task-status.enum';
import { IsTitleExisting } from 'src/common/validators/is-title-existing.validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @IsTitleExisting()
  // @Transform(({ value }) => {
  //   const normalized = value.trim().replace(/\s+/g, ' ');
  //   const title = normalized[0].toUpperCase() + normalized.slice(1);
  //   return title;
  // })
  title: string;

  @IsString()
  @MinLength(3)
  userId: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean = false;

  @IsOptional()
  @IsString()
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  priority?: TaskPriority;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;
}
