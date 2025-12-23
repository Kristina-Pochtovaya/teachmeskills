import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class AppGateway {
  private readonly clients = new Map<string, Socket>(); // socketId -> Socket
  private readonly userToSocket = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    this.clients.set(client.id, client);

    const userId = client.handshake.auth?.userId || null;

    if (userId) {
      this.userToSocket.set(userId, client.id);
      client.data.userId = userId;
    }

    console.log(
      `connected ${client.id}, userId=${userId}, online=${this.clients.size}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);

    const userId = client.data.userId;

    if (userId) {
      const mapped = this.userToSocket.get(userId);
      if (mapped === client.id) {
        this.userToSocket.delete(userId);
      }
    }

    console.log(`disconnected ${client.id}, online=${this.clients.size}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: string,
  ) {
    const message = {
      from: client.data.userId ?? client.id,
      text: payload,
      at: new Date().toISOString(),
      online: this.clients.size,
    };

    client.emit('message:ack', message);
    client.broadcast.emit('message', message);
  }

  @SubscribeMessage('online')
  handleOnline(@ConnectedSocket() client: Socket) {
    client.emit('online:list', {
      online: this.clients.size,
      users: Array.from(this.userToSocket.keys()),
    });
  }

  @SubscribeMessage('private:send')
  handlePrivateSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { toUserId: string; text: string },
  ) {
    const from = client.data?.userId ?? client.id;
    const socketId = this.userToSocket.get(body.toUserId);

    if (!socketId) {
      client.emit('private:error', {
        message: `User ${body.toUserId} is offline`,
      });

      return;
    }

    this.clients.get(socketId)?.emit('private', {
      from,
      text: body.text,
      at: new Date().toISOString(),
    });

    client.emit('private:ack', { to: body.toUserId, ok: true });
  }
}
