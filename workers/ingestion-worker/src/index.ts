/**
 * Ingestion Worker for 2dots1line V4
 * Processes the ingestion queue for content analysis
 */

import { Worker, Job } from 'bullmq';
import { IngestionJob } from '@2dots1line/shared-types';
// import * as ingestionAnalyst from '@2dots1line/ingestion-analyst'; // Commented out

// Worker configuration
const QUEUE_NAME = 'ingestion';
const CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

// Create worker
const worker = new Worker(QUEUE_NAME, async (job: Job<IngestionJob>) => {
  console.log(`Processing ingestion job ${job.id}`, job.data);
  
  // Call ingestion analyst to process the job
  // This is a placeholder for actual implementation // Logic using ingestionAnalyst would be here
  return { status: 'processed' };
}, { connection: CONNECTION });

// Event handlers
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

// For graceful shutdown
process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});

console.log(`Ingestion worker started, connected to ${QUEUE_NAME} queue`);

export default worker; 