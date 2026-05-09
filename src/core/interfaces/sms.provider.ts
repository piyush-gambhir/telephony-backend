/**
 * Provider-agnostic SMS capability surface.
 *
 * Concrete providers (Twilio, Vonage, Plivo, MessageBird, ...) implement this
 * interface; the `ProviderRegistryService` resolves the active provider per
 * capability based on env (`PROVIDER_SMS`).
 */
export interface SendSmsParams {
  to: string;
  from: string;
  body?: string;
  mediaUrl?: string | string[];
  statusCallback?: string;
  maxPrice?: number;
  provideFeedback?: boolean;
}

export interface SmsMessage {
  sid: string;
  status: string;
  to?: string;
  from?: string;
  body?: string;
  dateCreated?: Date | string | null;
  dateSent?: Date | string | null;
  /** Raw provider response, surfaced so callers don't lose detail. */
  raw?: unknown;
}

export interface ListSmsParams {
  to?: string;
  from?: string;
  dateSent?: Date;
  dateSentBefore?: Date;
  dateSentAfter?: Date;
  limit?: number;
}

export interface SmsProvider {
  sendMessage(params: SendSmsParams): Promise<SmsMessage>;
  fetchMessage(messageSid: string): Promise<SmsMessage>;
  listMessages(params?: ListSmsParams): Promise<SmsMessage[]>;
  deleteMessage(messageSid: string): Promise<boolean>;
  /** Returns estimated SMS segment count for the supplied body. */
  estimateSegments(body: string): number;
}
