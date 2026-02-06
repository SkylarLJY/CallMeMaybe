/**
 * OpenAI Realtime API WebSocket session
 * Connects to OpenAI's Realtime API, forwards Twilio audio bidirectionally,
 * and handles tool calls (take_message, end_call).
 */

import WebSocket from 'ws';
import {
  buildSystemInstructions,
  buildGreeting,
  TOOLS,
  DEFAULT_SESSION_CONFIG,
  type AgentPersona,
} from '@callmemaybe/agent-config';
import { sendAudioToTwilio } from './mediaStream.js';

const OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview';

export class OpenAIRealtimeSession {
  private ws: WebSocket | null = null;
  private persona: AgentPersona;
  private apiKey: string;
  private streamSid: string;
  private isClosing = false;

  constructor(apiKey: string, streamSid: string, persona: AgentPersona) {
    this.apiKey = apiKey;
    this.streamSid = streamSid;
    this.persona = persona;
  }

  /** Open WebSocket connection to OpenAI Realtime API */
  connect(): void {
    this.ws = new WebSocket(OPENAI_REALTIME_URL, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    this.ws.on('open', () => {
      console.log('[openai-realtime] Connected to OpenAI Realtime API');
      this.configureSession();
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const event = JSON.parse(data.toString());
        this.handleEvent(event);
      } catch (error) {
        console.error('[openai-realtime] Error parsing message:', error);
      }
    });

    this.ws.on('close', (code, reason) => {
      console.log('[openai-realtime] WebSocket closed:', code, reason.toString());
      this.ws = null;
    });

    this.ws.on('error', (error) => {
      console.error('[openai-realtime] WebSocket error:', error);
    });
  }

  /** Configure the session with instructions, tools, and audio format */
  private configureSession(): void {
    this.send({
      type: 'session.update',
      session: {
        instructions: buildSystemInstructions(this.persona),
        tools: TOOLS,
        voice: DEFAULT_SESSION_CONFIG.voice,
        modalities: DEFAULT_SESSION_CONFIG.modalities,
        turn_detection: DEFAULT_SESSION_CONFIG.turn_detection,
        input_audio_transcription: DEFAULT_SESSION_CONFIG.input_audio_transcription,
        input_audio_format: 'g711_ulaw',
        output_audio_format: 'g711_ulaw',
      },
    });
  }

  /** Send the initial greeting to kick off the conversation */
  private sendGreeting(): void {
    const greeting = buildGreeting(this.persona);
    console.log('[openai-realtime] Sending greeting:', greeting);

    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'The caller just picked up. Greet them.',
          },
        ],
      },
    });

    this.send({
      type: 'response.create',
    });
  }

  /** Forward base64-encoded audio from Twilio to OpenAI */
  sendAudio(base64Audio: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.send({
      type: 'input_audio_buffer.append',
      audio: base64Audio,
    });
  }

  /** Handle incoming events from OpenAI */
  private handleEvent(event: { type: string; [key: string]: unknown }): void {
    switch (event.type) {
      case 'session.created':
        console.log('[openai-realtime] Session created');
        break;

      case 'session.updated':
        console.log('[openai-realtime] Session configured');
        this.sendGreeting();
        break;

      case 'response.audio.delta':
        this.handleAudioDelta(event);
        break;

      case 'response.audio_transcript.done':
        console.log('[openai-realtime] Assistant:', event['transcript']);
        break;

      case 'conversation.item.input_audio_transcription.completed':
        console.log('[openai-realtime] User:', event['transcript']);
        break;

      case 'response.function_call_arguments.done':
        this.handleToolCall(event);
        break;

      case 'response.done':
        if (this.isClosing) {
          console.log('[openai-realtime] Closing after end_call');
          this.close();
        }
        break;

      case 'error':
        console.error('[openai-realtime] API error:', event['error']);
        break;

      // Silently ignore frequent/noisy events
      case 'response.created':
      case 'response.output_item.added':
      case 'response.output_item.done':
      case 'response.content_part.added':
      case 'response.content_part.done':
      case 'response.audio.done':
      case 'response.audio_transcript.delta':
      case 'response.text.delta':
      case 'response.text.done':
      case 'conversation.item.created':
      case 'input_audio_buffer.speech_started':
      case 'input_audio_buffer.speech_stopped':
      case 'input_audio_buffer.committed':
      case 'rate_limits.updated':
      case 'conversation.item.input_audio_transcription.delta':
        break;

      default:
        console.log('[openai-realtime] Unhandled event:', event.type);
    }
  }

  /** Pipe audio delta back to Twilio */
  private handleAudioDelta(event: { [key: string]: unknown }): void {
    const delta = event['delta'] as string | undefined;
    if (delta) {
      sendAudioToTwilio(this.streamSid, delta);
    }
  }

  /** Handle tool calls from the model */
  private handleToolCall(event: { [key: string]: unknown }): void {
    const name = event['name'] as string;
    const callId = event['call_id'] as string;
    const argsStr = event['arguments'] as string;

    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(argsStr);
    } catch {
      console.error('[openai-realtime] Failed to parse tool arguments:', argsStr);
    }

    console.log(`[openai-realtime] Tool call: ${name}`, args);

    let output: string;

    switch (name) {
      case 'take_message':
        console.log('[openai-realtime] Message taken:', {
          caller: args['caller_name'],
          company: args['caller_company'],
          callback: args['callback_number'],
          message: args['message'],
          urgency: args['urgency'],
        });
        output = JSON.stringify({ status: 'success', message: 'Message recorded successfully' });
        break;

      case 'end_call':
        console.log('[openai-realtime] End call requested:', args['reason']);
        this.isClosing = true;
        output = JSON.stringify({ status: 'success', message: 'Call will end after your response' });
        break;

      default:
        console.warn('[openai-realtime] Unknown tool:', name);
        output = JSON.stringify({ status: 'error', message: `Unknown tool: ${name}` });
    }

    // Send function output and trigger next response
    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output,
      },
    });

    this.send({
      type: 'response.create',
    });
  }

  /** Send a message to the OpenAI WebSocket */
  private send(event: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[openai-realtime] Cannot send - WebSocket not open');
      return;
    }
    this.ws.send(JSON.stringify(event));
  }

  /** Close the WebSocket connection */
  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
