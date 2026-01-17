import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
