import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';

interface CreateUserPayload {
  requestId: string;
  name: string;
  email?: string;
}

const processedRequests = new Map<string, any>();

@Controller()
export class AppController {
  constructor(@Inject('EMAIL_SERVICE') private client: ClientProxy) {}

  @MessagePattern('get-user')
  handleGetUser(@Payload() data: { id: number }) {
    return { id: data.id, name: 'John Doe' };
  }

  @MessagePattern('create-user')
  handleUserCreated(@Payload() data: CreateUserPayload) {
    const { requestId, name, email } = data;

    console.log('[user-service] user created event received:', data);

    if (processedRequests.has(requestId)) {
      console.log(
        '[user-service] duplicate request, returning cached result',
        requestId,
      );

      return processedRequests.get(requestId);
    }

    if (Math.random() < 0.5) {
      console.log('[user-service] failure, throwing RPC exeption ');

      throw new RpcException('User Creation error');
    }

    const createdUser = {
      id: Date.now(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    processedRequests.set(requestId, createdUser);
    console.log('[user-service] user created sucessfully', requestId);

    this.client.emit('create-user', createdUser.email);

    return createdUser;
  }
}
