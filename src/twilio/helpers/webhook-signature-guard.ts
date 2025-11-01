import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

/**
 * Validate incoming webhook authenticity using X-Twilio-Signature header.
 * Required for secure webhook handling.
 *
 * @docs https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
@Injectable()
export class WebhookSignatureGuard {
  private readonly logger = new Logger(WebhookSignatureGuard.name);
  /**
   * Validate Twilio webhook signature.
   *
   * @param authToken - Twilio Auth Token
   * @param request - Express request object
   * @param url - Full URL that Twilio called (optional, defaults to request URL)
   * @returns True if signature is valid
   */
  validateSignature(
    authToken: string,
    request: Request,
    url?: string,
  ): boolean {
    const signature = request.headers['x-twilio-signature'] as string;

    if (!signature) {
      throw new UnauthorizedException('Missing X-Twilio-Signature header');
    }

    // Use provided URL or construct from request
    const fullUrl = url || this.getFullUrl(request);

    // Get all POST parameters
    const params: Record<string, string> = {};
    if (request.body) {
      Object.keys(request.body).forEach((key) => {
        params[key] = request.body[key];
      });
    }

    // Build the signature string
    const signatureString = this.buildSignatureString(fullUrl, params);

    // Generate the expected signature
    const expectedSignature = crypto
      .createHmac('sha1', authToken)
      .update(signatureString, 'utf-8')
      .digest('base64');

    // Compare signatures (use constant-time comparison to prevent timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Build the signature string from URL and parameters.
   *
   * @param url - Full URL
   * @param params - POST parameters
   * @returns Signature string
   */
  private buildSignatureString(
    url: string,
    params: Record<string, string>,
  ): string {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}${params[key]}`)
      .join('');

    return url + sortedParams;
  }

  /**
   * Get the full URL from the request.
   *
   * @param request - Express request object
   * @returns Full URL
   */
  private getFullUrl(request: Request): string {
    const protocol = request.protocol || 'https';
    const host = request.get('host') || '';
    const path = request.originalUrl || request.url;

    return `${protocol}://${host}${path}`;
  }

  /**
   * Middleware-friendly validation that throws on failure.
   *
   * @param authToken - Twilio Auth Token
   * @param request - Express request object
   * @param url - Full URL that Twilio called (optional)
   * @throws UnauthorizedException if signature is invalid
   */
  validateOrThrow(
    authToken: string,
    request: Request,
    url?: string,
  ): void {
    if (!this.validateSignature(authToken, request, url)) {
      throw new UnauthorizedException('Invalid Twilio webhook signature');
    }
  }
}

