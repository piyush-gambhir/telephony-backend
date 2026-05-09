import { Injectable } from '@nestjs/common';
import {
  AvailableNumber,
  ListOwnedNumbersParams,
  NumbersProvider,
  OwnedNumber,
  PurchaseNumberParams,
  SearchAvailableNumbersParams,
} from '../../../core/interfaces/numbers.provider';
import { NumbersHelper } from '../helpers/numbers.helper';

/**
 * Twilio implementation of `NumbersProvider`.
 */
@Injectable()
export class TwilioNumbersProvider implements NumbersProvider {
  constructor(private readonly helper: NumbersHelper) {}

  async searchAvailable(params: SearchAvailableNumbersParams): Promise<AvailableNumber[]> {
    const opts = {
      areaCode: params.areaCode ? Number(params.areaCode) : undefined,
      contains: params.contains,
      smsEnabled: params.smsEnabled,
      voiceEnabled: params.voiceEnabled,
      mmsEnabled: params.mmsEnabled,
      limit: params.limit,
    };
    const isTollFree = params.type === 'tollFree';
    const numbers = isTollFree
      ? await this.helper.searchTollFreeNumbers(params.countryCode, opts)
      : await this.helper.searchAvailableNumbers(params.countryCode, opts);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return numbers.map((n: any) => ({
      phoneNumber: n.phoneNumber,
      friendlyName: n.friendlyName,
      countryCode: n.isoCountry || params.countryCode,
      capabilities: n.capabilities,
      raw: n,
    }));
  }

  async purchase(params: PurchaseNumberParams): Promise<OwnedNumber> {
    const r = await this.helper.purchaseNumber(params.phoneNumber, {
      smsUrl: params.smsUrl,
      voiceUrl: params.voiceUrl,
      statusCallback: params.statusCallback,
      friendlyName: params.friendlyName,
    });
    return toOwned(r);
  }

  async listOwned(params?: ListOwnedNumbersParams): Promise<OwnedNumber[]> {
    const r = await this.helper.listNumbers(params);
    return r.map(toOwned);
  }

  async fetchOwned(numberSid: string): Promise<OwnedNumber> {
    const r = await this.helper.fetchNumber(numberSid);
    return toOwned(r);
  }

  release(numberSid: string): Promise<boolean> {
    return this.helper.releaseNumber(numberSid);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toOwned(r: any): OwnedNumber {
  return {
    sid: r.sid,
    phoneNumber: r.phoneNumber,
    friendlyName: r.friendlyName,
    capabilities: r.capabilities,
    smsUrl: r.smsUrl,
    voiceUrl: r.voiceUrl,
    raw: r,
  };
}
