import { Global, Module } from '@nestjs/common';

export const APP_CONFIG = 'APP_CONFIG';

@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useValue: { debug: true },
    },
  ],
  exports: [APP_CONFIG],
})
export class ConfigModule {}
