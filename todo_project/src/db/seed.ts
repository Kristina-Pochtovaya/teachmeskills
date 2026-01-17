import { Task } from '../tasks/task.entity';
import dataSource from './data-source';
// import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

async function seed() {
  await dataSource.initialize();

  const repo = dataSource.getRepository(Task);
  //   const options = dataSource.options as PostgresConnectionOptions;
  const count = await repo.count();

  //   console.log('DB Host:', options.host);
  //   console.log('DB Name:', options.database);
  //   console.log('DB User:', options.username);
  if (count === 0) {
    await repo.save([
      repo.create({
        title: 'seed task 1',
        ownerId: '11111111-1111-1111-1111-111111111111',
        completed: false,
      }),
      repo.create({
        title: 'seed task 2',
        ownerId: '11111111-1111-1111-1111-111111111111',
        completed: true,
      }),
      repo.create({
        title: 'seed task 3',
        ownerId: '11111111-1111-1111-1111-111111111111',
        completed: true,
      }),
    ]);
  }

  await dataSource.destroy();
}

seed().catch((error) => {
  console.log(error);
  process.exit(1);
});
