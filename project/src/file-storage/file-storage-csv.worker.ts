import { parentPort, workerData } from 'worker_threads';

function handleCsvImport(file: Express.Multer.File) {
  // TO-DO - HOMEWORK 17
  // 1. Read file
  // 2. Handle line-by-line
  // 3. Store in Database

  setTimeout(() => console.log(file.originalname), 10000);

  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
}

const result = handleCsvImport(workerData);
parentPort.postMessage(result);
