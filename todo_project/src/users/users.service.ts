import { Injectable } from '@nestjs/common';
import { UserType } from './user.type';

const USERS: UserType[] = [
  { id: 'u1', name: 'Andrey' },
  { id: 'u2', name: 'Fedor' },
  { id: 'u3', name: 'Anna' },
];

@Injectable()
export class UsersService {
  findOne(id: string): UserType | null {
    return USERS.find((user) => user.id === id) ?? null;
  }

  findByIds(ids: readonly string[]): (UserType | undefined)[] {
    const map = new Map(USERS.map((user) => [user.id, user]));
    return ids.map((id) => map.get(id)).filter(Boolean);
  }
}
