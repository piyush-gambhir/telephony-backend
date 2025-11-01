import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Phone number verification for 2FA/OTP.
 * Handles sending verification codes and verifying phone numbers.
 *
 * @docs https://www.twilio.com/docs/verify
 */
@Injectable()
export class VerifyHelper {
  private readonly logger = new Logger(VerifyHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Send a verification code to a phone number.
   *
   * @param serviceSid - Verify Service SID
   * @param to - Phone number to verify (E.164 format)
   * @param params - Optional verification parameters
   * @returns Verification instance
   */
  async sendVerification(
    serviceSid: string,
    to: string,
    params?: {
      channel?: 'sms' | 'call' | 'email' | 'whatsapp';
      customMessage?: string;
      customCode?: string;
      sendDigits?: string;
      locale?: string;
      amount?: string;
      payee?: string;
      rateLimits?: Record<string, any>;
      metadata?: Record<string, string>;
    },
  ): Promise<any> {
    this.logger.debug(
      `[VerifyHelper] Sending verification to ${to} via ${params?.channel || 'sms'} on service ${serviceSid}`,
    );

    try {
      const result = await this.client.verify.v2.services(serviceSid).verifications.create({
        to,
        ...(params as any),
      });
      this.logger.debug(
        `[VerifyHelper] Verification sent successfully: ${result.sid}, status: ${result.status}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`[VerifyHelper] Failed to send verification to ${to}: ${error.message}`);
      this.logger.error(`[VerifyHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Verify a code that was sent to a phone number.
   *
   * @param serviceSid - Verify Service SID
   * @param to - Phone number to verify (E.164 format)
   * @param code - Verification code
   * @param params - Optional verification parameters
   * @returns Verification check instance
   */
  async verifyCode(
    serviceSid: string,
    to: string,
    code: string,
    params?: {
      amount?: string;
      payee?: string;
    },
  ): Promise<any> {
    return this.client.verify.v2.services(serviceSid).verificationChecks.create({
      to,
      code,
      ...(params as any),
    });
  }

  /**
   * Fetch a verification by SID.
   *
   * @param serviceSid - Verify Service SID
   * @param verificationSid - Verification SID
   * @returns Verification instance
   */
  async fetchVerification(serviceSid: string, verificationSid: string): Promise<any> {
    return this.client.verify.v2.services(serviceSid).verifications(verificationSid).fetch();
  }

  /**
   * Fetch a verification check by SID.
   *
   * @param serviceSid - Verify Service SID
   * @param verificationCheckSid - Verification Check SID
   * @returns Verification check instance
   */
  async fetchVerificationCheck(serviceSid: string, verificationCheckSid: string): Promise<any> {
    return (this.client.verify.v2.services(serviceSid).verificationChecks as any)(
      verificationCheckSid,
    ).fetch();
  }

  /**
   * Check/verify a code that was sent to a phone number.
   *
   * @param serviceSid - Verify Service SID
   * @param to - Phone number to verify (E.164 format)
   * @param code - Verification code
   * @param params - Optional verification check parameters
   * @returns Verification check instance
   */
  async checkVerificationCode(
    serviceSid: string,
    to: string,
    code: string,
    params?: {
      rateLimits?: Record<string, any>;
    },
  ): Promise<any> {
    return this.client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to,
        code,
        ...(params as any),
      });
  }

  /**
   * Update a verification (e.g., cancel).
   *
   * @param serviceSid - Verify Service SID
   * @param verificationSid - Verification SID
   * @param status - Status to update to ('canceled')
   * @returns Updated verification instance
   */
  async updateVerification(
    serviceSid: string,
    verificationSid: string,
    status: 'canceled',
  ): Promise<any> {
    return this.client.verify.v2
      .services(serviceSid)
      .verifications(verificationSid)
      .update({ status });
  }

  /**
   * List verifications for a service.
   *
   * @param serviceSid - Verify Service SID
   * @param params - Optional filter parameters
   * @returns List of verification instances
   */
  async listVerifications(
    serviceSid: string,
    params?: {
      to?: string;
      status?: 'pending' | 'approved' | 'canceled';
      limit?: number;
    },
  ): Promise<any[]> {
    return (this.client.verify.v2.services(serviceSid).verifications as any).list(params || {});
  }
}
