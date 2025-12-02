import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor() {}

  @MessagePattern('get-user')
  handleGetUser(@Payload() data: { id: number }) {
    return { id: data.id, name: 'John Doe' };
  }

  @EventPattern('user-created')
  handleUserCreated(@Payload() id: number) {
    console.log('[user-service] user created event received:', id);
  }
}
