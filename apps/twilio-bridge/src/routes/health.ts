/**
 * Health and service info routes
 */

import type { Request, Response } from 'express';

const SERVICE_VERSION = '1.0.0';

/** GET / - Service info endpoint */
export function getServiceInfo(_req: Request, res: Response): void {
  res.json({
    service: 'twilio-bridge',
    version: SERVICE_VERSION,
    endpoints: {
      health: '/health',
      webhook: '/twilio/webhook',
      status: '/twilio/status',
    },
  });
}

/** GET /health - Health check endpoint */
export function getHealth(_req: Request, res: Response): void {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
