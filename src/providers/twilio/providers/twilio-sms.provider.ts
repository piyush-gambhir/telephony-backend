import { Injectable } from '@nestjs/common';
import {
  ListSmsParams,
  SendSmsParams,
  SmsMessage,
  SmsProvider,
} from '../../../core/interfaces/sms.provider';
import { SmsHelper } from '../helpers/sms.helper';

/**
 * Twilio implementation of `SmsProvider`. Thin adapter over `SmsHelper`.
 */
@Injectable()
export class TwilioSmsProvider implements SmsProvider {
  constructor(private readonly helper: SmsHelper) {}

  async sendMessage(params: SendSmsParams): Promise<SmsMessage> {
    const r = await this.helper.sendMessage(params);
    return toSmsMessage(r);
  }

  async fetchMessage(messageSid: string): Promise<SmsMessage> {
    const r = await this.helper.fetchMessage(messageSid);
    return toSmsMessage(r);
  }

  async listMessages(params?: ListSmsParams): Promise<SmsMessage[]> {
    const r = await this.helper.listMessages(params);
    return r.map(toSmsMessage);
  }

  deleteMessage(messageSid: string): Promise<boolean> {
    return this.helper.deleteMessage(messageSid);
  }

  estimateSegments(body: string): number {
    return this.helper.estimateSegments(body);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSmsMessage(r: any): SmsMessage {
  return {
    sid: r.sid,
    status: r.status,
    to: r.to,
    from: r.from,
    body: r.body,
    dateCreated: r.dateCreated ?? null,
    dateSent: r.dateSent ?? null,
    raw: r,
  };
}
