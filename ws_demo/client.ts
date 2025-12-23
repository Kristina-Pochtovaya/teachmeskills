import { io } from 'socket.io-client';

const userId = process.argv[2] ?? 'user1';

const socket = io('http://localhost:3000', {
  auth: { userId },
});

socket.on('connect', () => {
  console.log('connected', socket.id, 'as userId=', userId);

  socket.emit('online');
  socket.emit('message', 'Hello from client');

  setTimeout(() => {
    if (userId === 'user1') {
      socket.emit('private:send', {
        toUserId: 'user2',
        text: 'Hi, user2',
      });
    }
  }, 3500);
});

socket.on('message:ack', (data) => {
  console.log('ack from server', data);
});

socket.on('message', (data) => {
  console.log('broadcast message:', data);
});

socket.on('disconnect', (reason) => {
  console.log('disconnected', reason);
});

socket.on('connect_error', (error) => {
  console.log('connect_error', error);
});

socket.on('online:list', (data) => {
  console.log('online:list:', data);
});

socket.on('private', (data) => {
  console.log('private message:', data);
});

socket.on('private:ack', (data) => {
  console.log('private:ack:', data);
});

socket.on('private:error', (data) => {
  console.log('private:error:', data);
});
