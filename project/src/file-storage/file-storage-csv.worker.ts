import { parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import * as readline from 'readline';

async function saveToDatabase(row: { title: string; description: string }) {
  console.log('💾 Saving to DB:', row);
}

async function handleCsvImport(file: Express.Multer.File) {
  // 1. Read file
  const stream = fs.createReadStream(file.path);

  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let isHeader = true;
  let processed = 0;

  // 2. Handle line-by-line
  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    if (!line.trim()) {
      continue;
    }

    const [title, description] = line.split(',');

    // 3. Store in Database
    await saveToDatabase({
      title: title?.trim(),
      description: description?.trim(),
    });

    processed++;
  }

  return {
    status: 'OK',
    processed,
  };
}

const result = handleCsvImport(workerData);
parentPort.postMessage(result);
