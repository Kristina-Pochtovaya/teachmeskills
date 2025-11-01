import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'crypto';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly logger: LoggerService) {}

  onModuleInit(): void {
    console.log('UsersService initialized');
  }

  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existingUser = this.users.find((user) => user.email === dto.email);

    if (existingUser) {
      throw new BadRequestException(
        `User with email ${dto.email} already exist`,
      );
    }

    const user = {
      id: randomUUID(),
      username: dto.username,
      email: dto.email,
      age: dto.age,
      city: dto.city,
    };

    this.users.push(user);

    this.logger.log('User created');

    return user;
  }
}
