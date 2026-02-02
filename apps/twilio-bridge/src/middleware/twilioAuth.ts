/**
 * Twilio request signature validation middleware
 */

import type { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';
import { config } from '../config.js';

/**
 * Validates that incoming requests are from Twilio using signature verification.
 * Rejects requests with invalid or missing signatures.
 */
export function validateTwilioSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip validation if auth token not configured (development mode)
  if (!config.twilioAuthToken) {
    console.warn('[twilio-auth] No TWILIO_AUTH_TOKEN configured - skipping validation');
    next();
    return;
  }

  const signature = req.headers['x-twilio-signature'] as string | undefined;

  if (!signature) {
    console.error('[twilio-auth] Missing X-Twilio-Signature header');
    res.status(403).send('Forbidden: Missing signature');
    return;
  }

  // Construct the full URL that Twilio used to sign the request
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['host'];
  const url = `${protocol}://${host}${req.originalUrl}`;

  const isValid = twilio.validateRequest(
    config.twilioAuthToken,
    signature,
    url,
    req.body
  );

  if (!isValid) {
    console.error('[twilio-auth] Invalid signature for URL:', url);
    res.status(403).send('Forbidden: Invalid signature');
    return;
  }

  next();
}
