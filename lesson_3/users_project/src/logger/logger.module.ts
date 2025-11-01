import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ConfigModule } from 'src/config/config.module';

export const LOGGER_LEVEL = 'LOGGER_LEVEL';

export const loggerLevel = {
  debug: 'debug',
  error: 'error',
  info: 'info',
} as const;

@Global()
@Module({})
export class LoggerModule {
  static forRoot(level: keyof typeof loggerLevel): DynamicModule {
    return {
      imports: [ConfigModule],
      module: LoggerModule,
      providers: [
        LoggerService,
        {
          provide: LOGGER_LEVEL,
          useValue: level,
        },
      ],
      exports: [LoggerService],
    };
  }
}
