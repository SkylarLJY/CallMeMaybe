/**
 * Twilio Bridge Server
 *
 * Express server that receives Twilio webhooks for incoming calls
 * and stores call transcripts to AWS S3.
 */

import express from 'express';
import { createServer } from 'http';
import { config, logConfig } from './config.js';
import { getServiceInfo, getHealth } from './routes/health.js';
import { handleWebhook, handleStatusCallback } from './routes/twilio.js';
import { validateTwilioSignature } from './middleware/twilioAuth.js';
import { initMediaStreamServer } from './services/mediaStream.js';

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log('[request] %s %s', req.method, req.path);
  next();
});

// Health routes
app.get('/', getServiceInfo);
app.get('/health', getHealth);

// Twilio routes (with signature validation)
app.post('/twilio/webhook', validateTwilioSignature, handleWebhook);
app.post('/twilio/status', validateTwilioSignature, handleStatusCallback);

// Initialize WebSocket server for Twilio Media Streams
initMediaStreamServer(server);

// Start server
server.listen(config.port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('Twilio Bridge Server Starting');
  console.log('='.repeat(50));
  logConfig();
  console.log('='.repeat(50));
  console.log('[server] Listening on http://0.0.0.0:%d', config.port);
});
