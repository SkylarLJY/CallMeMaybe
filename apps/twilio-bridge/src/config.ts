/**
 * Application configuration loaded from environment variables
 */

export interface Config {
  port: number;
  s3Bucket: string | undefined;
  s3Prefix: string;
  awsRegion: string;
  nodeEnv: string;
  twilioAuthToken: string | undefined;
}

function loadConfig(): Config {
  return {
    port: parseInt(process.env['PORT'] ?? '8080', 10),
    s3Bucket: process.env['S3_BUCKET'],
    s3Prefix: process.env['S3_TRANSCRIPT_PREFIX'] ?? 'transcripts/',
    awsRegion: process.env['AWS_REGION'] ?? 'us-west-2',
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    twilioAuthToken: process.env['TWILIO_AUTH_TOKEN'],
  };
}

export const config = loadConfig();

export function logConfig(): void {
  console.log('[config] Port:', config.port);
  console.log('[config] S3 Bucket:', config.s3Bucket ?? 'NOT CONFIGURED');
  console.log('[config] S3 Prefix:', config.s3Prefix);
  console.log('[config] AWS Region:', config.awsRegion);
  console.log('[config] Environment:', config.nodeEnv);
  console.log('[config] Twilio Auth:', config.twilioAuthToken ? 'CONFIGURED' : 'NOT CONFIGURED');
}
