import { Injectable } from '@nestjs/common';
import {
  CheckVerificationParams,
  StartVerificationParams,
  VerificationResult,
  VerifyProvider,
} from '../../../core/interfaces/verify.provider';
import { VerifyHelper } from '../helpers/verify.helper';

/**
 * Twilio implementation of `VerifyProvider`.
 */
@Injectable()
export class TwilioVerifyProvider implements VerifyProvider {
  constructor(private readonly helper: VerifyHelper) {}

  async startVerification(params: StartVerificationParams): Promise<VerificationResult> {
    const r = await this.helper.sendVerification(params.serviceSid, params.to, {
      channel: params.channel as 'sms' | 'call' | 'email' | 'whatsapp',
      customCode: params.customCode,
      locale: params.locale,
    });
    return toResult(r);
  }

  async checkVerification(params: CheckVerificationParams): Promise<VerificationResult> {
    const r = await this.helper.verifyCode(params.serviceSid, params.to, params.code);
    return toResult(r);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toResult(r: any): VerificationResult {
  return { sid: r.sid, status: r.status, to: r.to, channel: r.channel, raw: r };
}
