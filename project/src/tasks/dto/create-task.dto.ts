import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
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
  status?: string;
}
