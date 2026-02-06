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
  // OpenAI configuration
  openaiApiKey: string | undefined;
  // Agent persona
  agentOwnerName: string;
  agentRole: string | undefined;
  agentEmail: string | undefined;
  agentSpecialInstructions: string | undefined;
  // Public hostname for WebSocket URL (optional, auto-detected if not set)
  publicHost: string | undefined;
}

function loadConfig(): Config {
  return {
    port: parseInt(process.env['PORT'] ?? '8080', 10),
    s3Bucket: process.env['S3_BUCKET'],
    s3Prefix: process.env['S3_TRANSCRIPT_PREFIX'] ?? 'transcripts/',
    awsRegion: process.env['AWS_REGION'] ?? 'us-west-2',
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    twilioAuthToken: process.env['TWILIO_AUTH_TOKEN'],
    // OpenAI configuration
    openaiApiKey: process.env['OPENAI_API_KEY'],
    // Agent persona
    agentOwnerName: process.env['AGENT_OWNER_NAME'] ?? 'the owner',
    agentRole: process.env['AGENT_ROLE'],
    agentEmail: process.env['AGENT_EMAIL'],
    agentSpecialInstructions: process.env['AGENT_SPECIAL_INSTRUCTIONS'],
    // Public hostname
    publicHost: process.env['PUBLIC_HOST'],
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
  console.log('[config] OpenAI API Key:', config.openaiApiKey ? 'CONFIGURED' : 'NOT CONFIGURED');
  console.log('[config] Agent Owner:', config.agentOwnerName);
  console.log('[config] Public Host:', config.publicHost ?? 'AUTO-DETECT');
}
