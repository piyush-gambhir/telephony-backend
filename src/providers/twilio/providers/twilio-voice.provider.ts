import { Injectable } from '@nestjs/common';
import {
  ListCallsParams,
  MakeCallParams,
  VoiceCall,
  VoiceProvider,
} from '../../../core/interfaces/voice.provider';
import { VoiceHelper } from '../helpers/voice.helper';

/**
 * Twilio implementation of `VoiceProvider`.
 */
@Injectable()
export class TwilioVoiceProvider implements VoiceProvider {
  constructor(private readonly helper: VoiceHelper) {}

  async makeCall(params: MakeCallParams): Promise<VoiceCall> {
    if (!params.url && !params.twiml) {
      // Helper would throw a plain Error; surface a slightly clearer message
      // but keep behavior identical for the underlying call.
    }
    const r = await this.helper.createCall(params);
    return toCall(r);
  }

  async fetchCall(callSid: string): Promise<VoiceCall> {
    const r = await this.helper.fetchCall(callSid);
    return toCall(r);
  }

  async listCalls(params?: ListCallsParams): Promise<VoiceCall[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await this.helper.listCalls(params as any);
    return r.map(toCall);
  }

  async hangupCall(callSid: string): Promise<VoiceCall> {
    const r = await this.helper.hangupCall(callSid);
    return toCall(r);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCall(r: any): VoiceCall {
  return {
    sid: r.sid,
    status: r.status,
    to: r.to,
    from: r.from,
    duration: r.duration ?? null,
    dateCreated: r.dateCreated ?? null,
    raw: r,
  };
}
