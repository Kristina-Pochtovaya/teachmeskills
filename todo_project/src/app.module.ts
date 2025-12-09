import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfig from './config/db.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get('db');

        return {
          ...db,
          autoLoadEntities: true,
        };
      },
    }),

    CacheModule.register({
      isGlobal: true,
      store: redisStore({
        host: 'localhost',
        port: 6379,
        db: 0,
        keyPrefix: '',
      }),
      ttl: 300,
    }),

    TasksModule,
    AuthModule.forRoot({
      secret: 'super-secret',
      tokenPrefix: 'Bearer',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
