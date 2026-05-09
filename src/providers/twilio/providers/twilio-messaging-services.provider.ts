import { Injectable } from '@nestjs/common';
import {
  CreateMessagingServiceParams,
  MessagingService,
  MessagingServicesProvider,
} from '../../../core/interfaces/messaging-services.provider';
import { MessagingServiceHelper } from '../helpers/messaging-service.helper';

/**
 * Twilio implementation of `MessagingServicesProvider`.
 */
@Injectable()
export class TwilioMessagingServicesProvider implements MessagingServicesProvider {
  constructor(private readonly helper: MessagingServiceHelper) {}

  async list(params?: { limit?: number }): Promise<MessagingService[]> {
    const r = await this.helper.listServices(params);
    return r.map(toService);
  }

  async fetch(serviceSid: string): Promise<MessagingService> {
    const r = await this.helper.fetchService(serviceSid);
    return toService(r);
  }

  async create(params: CreateMessagingServiceParams): Promise<MessagingService> {
    const r = await this.helper.createService({
      friendlyName: params.friendlyName,
      inboundRequestUrl: params.inboundRequestUrl,
      fallbackUrl: params.fallbackUrl,
      statusCallback: params.statusCallback,
    });
    return toService(r);
  }

  delete(serviceSid: string): Promise<boolean> {
    return this.helper.deleteService(serviceSid);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toService(r: any): MessagingService {
  return {
    sid: r.sid,
    friendlyName: r.friendlyName,
    inboundRequestUrl: r.inboundRequestUrl,
    fallbackUrl: r.fallbackUrl,
    statusCallback: r.statusCallback,
    raw: r,
  };
}
