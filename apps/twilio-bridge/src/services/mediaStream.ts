/**
 * Twilio Media Streams WebSocket handler
 * Receives audio from Twilio calls via WebSocket
 */

import { WebSocket, WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import type { Server } from 'http';
import { OpenAIRealtimeSession } from './openaiRealtimeService.js';
import { config } from '../config.js';
import type { AgentPersona } from '@callmemaybe/agent-config';

/** Twilio Media Stream message types */
interface TwilioConnectedMessage {
  event: 'connected';
  protocol: string;
  version: string;
}

interface TwilioStartMessage {
  event: 'start';
  sequenceNumber: string;
  start: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    customParameters: Record<string, string>;
    mediaFormat: {
      encoding: string;
      sampleRate: number;
      channels: number;
    };
  };
  streamSid: string;
}

interface TwilioMediaMessage {
  event: 'media';
  sequenceNumber: string;
  media: {
    track: string;
    chunk: string;
    timestamp: string;
    payload: string; // base64 encoded audio
  };
  streamSid: string;
}

interface TwilioStopMessage {
  event: 'stop';
  sequenceNumber: string;
  stop: {
    accountSid: string;
    callSid: string;
  };
  streamSid: string;
}

type TwilioMessage =
  | TwilioConnectedMessage
  | TwilioStartMessage
  | TwilioMediaMessage
  | TwilioStopMessage;

/** Active call session */
export interface CallSession {
  streamSid: string;
  callSid: string;
  ws: WebSocket;
  startTime: Date;
  openaiSession: OpenAIRealtimeSession | null;
}

/** Map of active call sessions by streamSid */
const activeSessions = new Map<string, CallSession>();

/**
 * Handle incoming Twilio Media Stream WebSocket connection
 */
function handleConnection(ws: WebSocket, req: IncomingMessage): void {
  console.log('[media-stream] New WebSocket connection from:', req.socket.remoteAddress);

  let session: CallSession | null = null;

  ws.on('message', (data: Buffer) => {
    try {
      const message: TwilioMessage = JSON.parse(data.toString());

      switch (message.event) {
        case 'connected':
          console.log('[media-stream] Connected:', message.protocol, message.version);
          break;

        case 'start':
          console.log('[media-stream] Stream started:', {
            streamSid: message.start.streamSid,
            callSid: message.start.callSid,
            mediaFormat: message.start.mediaFormat,
          });

          const persona: AgentPersona = {
            ownerName: config.agentOwnerName,
            ...(config.agentRole !== undefined && { role: config.agentRole }),
            ...(config.agentEmail !== undefined && { shareEmail: config.agentEmail }),
            ...(config.agentSpecialInstructions !== undefined && { specialInstructions: config.agentSpecialInstructions }),
          };

          let openaiSession: OpenAIRealtimeSession | null = null;
          if (config.openaiApiKey) {
            openaiSession = new OpenAIRealtimeSession(
              config.openaiApiKey,
              message.start.streamSid,
              persona,
            );
            openaiSession.connect();
          } else {
            console.warn('[media-stream] OPENAI_API_KEY not configured - audio will not be processed');
          }

          session = {
            streamSid: message.start.streamSid,
            callSid: message.start.callSid,
            ws,
            startTime: new Date(),
            openaiSession,
          };
          activeSessions.set(message.start.streamSid, session);
          break;

        case 'media':
          if (session?.openaiSession) {
            session.openaiSession.sendAudio(message.media.payload);
          }
          break;

        case 'stop':
          console.log('[media-stream] Stream stopped:', {
            streamSid: message.streamSid,
            callSid: message.stop.callSid,
          });

          if (session) {
            const duration = (Date.now() - session.startTime.getTime()) / 1000;
            console.log('[media-stream] Call duration:', duration.toFixed(1), 'seconds');
            session.openaiSession?.close();
            activeSessions.delete(message.streamSid);
          }
          break;

        default:
          console.log('[media-stream] Unknown event:', (message as { event: string }).event);
      }
    } catch (error) {
      console.error('[media-stream] Error parsing message:', error);
    }
  });

  ws.on('close', (code, reason) => {
    console.log('[media-stream] WebSocket closed:', code, reason.toString());
    if (session) {
      session.openaiSession?.close();
      activeSessions.delete(session.streamSid);
    }
  });

  ws.on('error', (error) => {
    console.error('[media-stream] WebSocket error:', error);
  });
}

/**
 * Send audio back to Twilio
 * @param streamSid - The stream to send audio to
 * @param audioPayload - Base64 encoded mulaw audio
 */
export function sendAudioToTwilio(streamSid: string, audioPayload: string): void {
  const session = activeSessions.get(streamSid);
  if (!session || session.ws.readyState !== WebSocket.OPEN) {
    console.warn('[media-stream] Cannot send audio - session not found or closed');
    return;
  }

  const message = {
    event: 'media',
    streamSid,
    media: {
      payload: audioPayload,
    },
  };

  session.ws.send(JSON.stringify(message));
}

/**
 * Initialize WebSocket server for Twilio Media Streams
 */
export function initMediaStreamServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({
    server,
    path: '/media-stream',
  });

  wss.on('connection', handleConnection);

  console.log('[media-stream] WebSocket server initialized on /media-stream');

  return wss;
}

/**
 * Get active session by streamSid
 */
export function getSession(streamSid: string): CallSession | undefined {
  return activeSessions.get(streamSid);
}

/**
 * Get all active sessions
 */
export function getActiveSessions(): Map<string, CallSession> {
  return activeSessions;
}
