import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { TasksService } from '../src/tasks/tasks.service';
import { DataSource } from 'typeorm';
import { Task } from '../src/tasks/task.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // .overrideProvider(TasksService)
      // .useValue({
      //   findAll: async () => ({
      //     data: [
      //       { id: 't1', title: 'Task 1', completed: false, ownerId: 'u1' },
      //       { id: 't2', title: 'Task 2', completed: true, ownerId: 'u2' },
      //     ],
      //     metadata: {
      //       page: 1,
      //       limit: 10,
      //       total: 2,
      //     },
      //   }),
      // })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.getRepository(Task).clear();
  });

  afterAll(async () => {
    app.close();
  });

  it('/tasks:id  (GET) return real task', async () => {
    const repo = dataSource.getRepository(Task);

    const task = repo.create({
      title: 'Real Task',
      completed: false,
      ownerId: 'u1',
    });

    const saved = await repo.save(task);

    return request(app.getHttpServer())
      .get(`/tasks/${saved.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(saved.id);
        expect(res.body.title).toBe(saved.title);
        expect(res.body.completed).toBe(saved.completed);
      });
  });

  // it('/tasks (GET) return data with meta', () => {
  //   return request(app.getHttpServer())
  //     .get('/tasks')
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body.data).toHaveLength(2);
  //       expect(res.body.metadata).toEqual({
  //         page: 1,
  //         limit: 10,
  //         total: 2,
  //       });
  //     });
  // });
});
