/**
 * S3 service for storing call transcripts
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config.js';

const s3Client = new S3Client({ region: config.awsRegion });

/**
 * Generates a unique S3 key based on timestamp
 */
function generateS3Key(prefix: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}${timestamp}.json`;
}

/**
 * Saves transcript data to S3
 * @param data - The data to save as JSON
 * @returns The S3 key if successful, null if S3 is not configured
 * @throws Error if the upload fails
 */
export async function saveTranscript(data: unknown): Promise<string | null> {
  if (!config.s3Bucket) {
    console.warn('[s3] S3_BUCKET not configured, skipping upload');
    return null;
  }

  const key = generateS3Key(config.s3Prefix);
  const body = JSON.stringify(data, null, 2);

  console.log('[s3] Uploading transcript to:', key);

  const command = new PutObjectCommand({
    Bucket: config.s3Bucket,
    Key: key,
    Body: body,
    ContentType: 'application/json',
  });

  try {
    await s3Client.send(command);
    console.log('[s3] Transcript saved to s3://%s/%s', config.s3Bucket, key);
    return key;
  } catch (error) {
    console.error('[s3] Failed to upload transcript:', error);
    throw error;
  }
}
