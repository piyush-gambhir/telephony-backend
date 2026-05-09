/**
 * Provider-agnostic Verify (2FA / OTP) capability surface.
 */
export interface StartVerificationParams {
  serviceSid: string;
  to: string;
  channel: 'sms' | 'call' | 'email' | 'whatsapp' | string;
  locale?: string;
  customCode?: string;
}

export interface VerificationResult {
  sid: string;
  status: string;
  to?: string;
  channel?: string;
  raw?: unknown;
}

export interface CheckVerificationParams {
  serviceSid: string;
  to: string;
  code: string;
}

export interface VerifyProvider {
  startVerification(params: StartVerificationParams): Promise<VerificationResult>;
  checkVerification(params: CheckVerificationParams): Promise<VerificationResult>;
}
