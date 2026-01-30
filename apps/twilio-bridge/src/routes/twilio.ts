/**
 * Twilio webhook routes
 */

import type { Request, Response } from 'express';
import { saveTranscript } from '../services/s3.js';

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

function twimlResponse(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${message}</Say>
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

  // TODO: Integrate with OpenAI Realtime API for actual call handling
  res.type('text/xml');
  res.send(twimlResponse('Hello! This is a test response from the Twilio bridge.'));
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
