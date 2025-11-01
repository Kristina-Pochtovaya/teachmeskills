import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_LEVEL, loggerLevel } from './logger.module';
import { APP_CONFIG } from 'src/config/config.module';
import type { ConfigType } from 'src/types/config';

@Injectable()
export class LoggerService {
  constructor(
    @Inject(LOGGER_LEVEL) private readonly level: keyof typeof loggerLevel,
    @Inject(APP_CONFIG) private readonly config: ConfigType,
  ) {}

  log(message: string) {
    if (this.config.debug) {
      console.log(`[${this.level.toUpperCase()}] ${message}`);
    } else {
      console.warn(`App config must have enabled debug`);
    }
  }
}
