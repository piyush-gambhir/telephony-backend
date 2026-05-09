import { Injectable } from '@nestjs/common';
import {
  LookupParams,
  LookupProvider,
  LookupResult,
} from '../../../core/interfaces/lookup.provider';
import { LookupHelper } from '../helpers/lookup.helper';

/**
 * Twilio implementation of `LookupProvider`. Twilio Lookup v2 takes
 * `fields` as a comma-separated `addOns` (data packages) string; we map the
 * generic `fields[]` interface to that.
 */
@Injectable()
export class TwilioLookupProvider implements LookupProvider {
  constructor(private readonly helper: LookupHelper) {}

  async lookup(params: LookupParams): Promise<LookupResult> {
    const addOns = params.fields && params.fields.length ? params.fields.join(',') : undefined;
    const r = (await this.helper.lookupPhoneNumber(params.phoneNumber, {
      countryCode: params.countryCode,
      addOns,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;
    return {
      phoneNumber: r.phoneNumber,
      countryCode: r.countryCode,
      valid: r.valid,
      carrier: r.carrier ?? null,
      callerName: r.callerName ?? null,
      raw: r,
    };
  }
}
