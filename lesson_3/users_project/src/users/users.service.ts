import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'crypto';
import { validate } from 'class-validator';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit(): void {
    console.log('UsersService initialized');
  }

  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors
        .map((error) => Object.values(error.constraints ?? ''))
        .flat();

      throw new BadRequestException(messages);
    }

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

    return user;
  }
}
