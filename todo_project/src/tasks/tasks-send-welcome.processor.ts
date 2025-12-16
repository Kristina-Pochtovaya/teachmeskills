import { Process, Processor } from '@nestjs/bull';

import type { Job } from 'bull';

type TasksSendWelcomeJob = {
  ownerId: string;
};

@Processor('email')
export class TasksSendWelcomeProcessor {
  @Process('send-welcome')
  async sendWelcome(job: Job<TasksSendWelcomeJob>) {
    const { ownerId } = job.data;

    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`Task is created by:`, ownerId);

    await job.log(`Task is created by: ${ownerId}`);
  }
}
