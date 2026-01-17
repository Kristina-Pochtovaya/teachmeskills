import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserByIdLoader } from './user-by-id.loader';

@Module({
  providers: [UsersService, UserByIdLoader],
  exports: [UsersService, UserByIdLoader],
})
export class UsersModule {}
