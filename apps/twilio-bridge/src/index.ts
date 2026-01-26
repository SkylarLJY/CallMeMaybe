/**
 * Twilio Bridge Server
 *
 * Express server that receives Twilio webhooks for incoming calls
 * and stores call transcripts to AWS S3.
 */

import express from 'express';
import { config, logConfig } from './config.js';
import { getServiceInfo, getHealth } from './routes/health.js';
import { handleWebhook, handleStatusCallback } from './routes/twilio.js';

const app = express();

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

// Twilio routes
app.post('/twilio/webhook', handleWebhook);
app.post('/twilio/status', handleStatusCallback);

// Start server
app.listen(config.port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('Twilio Bridge Server Starting');
  console.log('='.repeat(50));
  logConfig();
  console.log('='.repeat(50));
  console.log('[server] Listening on http://0.0.0.0:%d', config.port);
});
