/**
 * Twilio webhook routes
 */

import type { Request, Response } from 'express';
import { saveTranscript } from '../services/s3.js';
import { config } from '../config.js';

/** Twilio sends form-urlencoded data */
type TwilioBody = Record<string, string | undefined>;

/** Call transcript data saved to S3 */
export interface TranscriptData {
  callSid: string;
  callerPhone: string;
  calledPhone: string;
  duration: string;
  status: string;
  timestamp: string;
  transcript?: string;
  summary?: string;
}

/**
 * Generate TwiML to connect call to Media Stream
 */
function twimlMediaStream(websocketUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${websocketUrl}" />
  </Connect>
</Response>`;
}

/** POST /twilio/webhook - Handle incoming Twilio calls */
export async function handleWebhook(
  req: Request<object, string, TwilioBody>,
  res: Response
): Promise<void> {
  const { CallSid, From, To, CallStatus } = req.body;

  console.log('[twilio/webhook] Received call:', {
    callSid: CallSid,
    from: From,
    to: To,
    status: CallStatus,
  });

  // Construct WebSocket URL for media stream
  // Use wss:// for production, ws:// for local development
  const protocol = config.nodeEnv === 'production' ? 'wss' : 'ws';
  const host = req.headers.host || 'localhost:8080';
  const websocketUrl = `${protocol}://${host}/media-stream`;

  console.log('[twilio/webhook] Connecting to media stream:', websocketUrl);

  res.type('text/xml');
  res.send(twimlMediaStream(websocketUrl));
}

/** POST /twilio/status - Handle Twilio status callbacks */
export async function handleStatusCallback(
  req: Request<object, void, TwilioBody>,
  res: Response
): Promise<void> {
  const { CallSid, CallStatus, From, To, CallDuration } = req.body;

  console.log('[twilio/status] Status callback:', {
    callSid: CallSid,
    status: CallStatus,
    from: From,
    to: To,
    duration: CallDuration,
  });

  if (CallStatus === 'completed') {
    const transcriptData: TranscriptData = {
      callSid: CallSid ?? 'unknown',
      callerPhone: From ?? 'unknown',
      calledPhone: To ?? 'unknown',
      duration: CallDuration ?? '0',
      status: CallStatus,
      timestamp: new Date().toISOString(),
    };

    try {
      await saveTranscript(transcriptData);
      console.log('[twilio/status] Transcript saved for call:', CallSid);
    } catch (error) {
      console.error('[twilio/status] Failed to save transcript:', error);
    }
  }

  res.sendStatus(200);
}
