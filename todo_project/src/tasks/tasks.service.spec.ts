import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { getQueueToken } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;

  const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    orderBy: jest.fn(),
    softDelete: jest.fn(),
  };

  const cache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const queue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: repo,
        },
        {
          provide: getQueueToken('tasks'),
          useValue: queue,
        },

        {
          provide: CACHE_MANAGER,
          useValue: cache,
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('findAll return tasks from repo', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([
      [{ id: '1', completed: true }],
      1,
    ]);

    const result = await service.findAll(1, 10, true);

    expect(mockQueryBuilder.where).toHaveBeenCalledWith({ completed: true });
    expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
  });

  it('throws NotFoundException when task is not found', async () => {
    repo.findOne.mockResolvedValue(null);
    cache.get.mockResolvedValue(null);

    await expect(() => service.findOne('111')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
