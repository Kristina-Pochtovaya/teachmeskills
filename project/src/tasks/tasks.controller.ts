import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  HttpCode,
  UseInterceptors,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  UsePipes,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CompleteManyDto } from './dto/complete-many.dto';
import { CurrentUser } from 'src/common/current-user.decorator';
import { TaskOwnerJWT } from 'src/common/guards/task-owner-jwt.guard';
import { NormalizeTaskPipe } from 'src/common/pipes/normilize-task.pipe';
import { TaskStatusValidationPipe } from 'src/common/pipes/task-status-validation.pipe';
import { TaskStatus } from 'src/common/task-status.enum';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';
import { TaskPriorityPipe } from 'src/common/pipes/task-priority.pipe';
import { LoggerChangeTaskDataInterceptor } from 'src/common/interceptors/logger-change-task-data.interceptor';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ok } from 'assert';

@UseGuards(TaskOwnerJWT)
@Controller('tasks')
@UseInterceptors(LoggerInterceptor, ResponseTransformInterceptor)
export class TasksController {
  constructor(
    private readonly tasks: TasksService,
    private readonly fileStorage: FileStorageService,
  ) {}

  @Get('whoami')
  async getUser(@CurrentUser() user) {
    return user ?? { message: 'no user' };
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status', TaskStatusValidationPipe) status?: TaskStatus,
  ) {
    const all = await this.tasks.findAll();
    let filteredData = null;

    if (status) {
      filteredData = all.filter((task) => task.status === status);
    }
    const start = (page - 1) * limit;
    const data = filteredData
      ? filteredData.slice(start, start + limit)
      : all.slice(start, start + limit);

    return {
      data,
      meta: {
        page,
        limit,
        total: all.length,
      },
    };
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const task = await this.tasks.findOne(id);

    return task;
  }

  @Post()
  @HttpCode(201)
  @UsePipes(NormalizeTaskPipe, TaskPriorityPipe)
  @UseInterceptors(LoggerChangeTaskDataInterceptor)
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseInterceptors(LoggerChangeTaskDataInterceptor)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.tasks.remove(id);
  }

  @Patch(':id/complete')
  @UseInterceptors(LoggerChangeTaskDataInterceptor)
  complete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasks.complete(id);
  }

  @Patch('complete')
  @UseInterceptors(LoggerChangeTaskDataInterceptor)
  completeMany(@Body() dto: CompleteManyDto) {
    return this.tasks.completeMany(dto.ids);
  }

  @Patch(':id')
  @UseInterceptors(LoggerChangeTaskDataInterceptor)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(id, dto);
  }

  @Post('import-csv')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok =
          file.mimetype === 'text/csv' ||
          file.mimetype === 'application/vnd.ms-excel';

        if (!ok) {
          cb(new BadRequestException('Only CSV filesare allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.fileStorage.saveToLocal(file, 'csv');
  }
}
