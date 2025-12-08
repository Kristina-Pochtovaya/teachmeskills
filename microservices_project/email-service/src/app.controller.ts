import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor() {}

  @EventPattern('create-user')
  handleUserCreated(@Payload() email: string) {
    console.log(`[email-service] sending welcome email to ${email}`);
  }
}
