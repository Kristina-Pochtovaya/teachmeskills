import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { Worker } from 'worker_threads';

export type StoredFile = {
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  relativePath: string;
};

@Injectable()
export class FileStorageService {
  private readonly root = path.resolve(process.cwd(), 'uploads');

  async saveToLocal(
    file: Express.Multer.File,
    subdir: string,
    //   ): Promise<StoredFile> {
  ): Promise<any> {
    const ext = path.extname(file.originalname) || '';
    const key = `${randomUUID()}${ext}`;

    const dir = path.join(this.root, subdir);
    await fs.mkdir(dir, { recursive: true });

    const absPath = path.join(dir, key);

    if (!file.buffer) {
      throw new Error('expected buffer. use memoryStorage in Multer');
    }

    await fs.writeFile(absPath, file.buffer);

    try {
      return await fileHandle(file);
    } catch (error) {
      throw new Error(error);
    }

    // return {
    //   key,
    //   originalName: file.originalname,
    //   mimeType: file.mimetype,
    //   size: file.size,
    //   relativePath: path.join('uploads', subdir, key).replace('\\', '/'),
    // };
  }
}

function fileHandle(file: Express.Multer.File) {
  return new Promise((resolve, reject) => {
    //worker
    const worker = new Worker('./file-storage-csv.worker.ts', {
      workerData: file,
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with code ${code}`));
      }
    });
  });
}
