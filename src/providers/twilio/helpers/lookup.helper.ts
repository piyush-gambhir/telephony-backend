import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Phone number validation and information lookup.
 * Handles phone number validation, carrier info, and line type detection.
 *
 * @docs https://www.twilio.com/docs/lookup
 */
@Injectable()
export class LookupHelper {
  private readonly logger = new Logger(LookupHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Look up a phone number to get validation and carrier information.
   *
   * @param phoneNumber - Phone number to lookup (E.164 format)
   * @param params - Optional lookup parameters
   * @returns Phone number lookup result
   */
  async lookupPhoneNumber(
    phoneNumber: string,
    params?: {
      type?: 'carrier' | 'caller-name';
      countryCode?: string;
      addOns?: string;
      addOnsData?: Record<string, any>;
    },
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.lookups.v2.phoneNumbers>['fetch']>>> {
    return this.client.lookups.v2.phoneNumbers(phoneNumber).fetch(params || {});
  }

  /**
   * Validate a phone number format.
   *
   * @param phoneNumber - Phone number to validate
   * @param countryCode - Optional country code hint
   * @returns True if valid, false otherwise
   */
  async validatePhoneNumber(phoneNumber: string, countryCode?: string): Promise<boolean> {
    try {
      const result = await this.lookupPhoneNumber(phoneNumber, {
        countryCode,
      });
      return !!result.phoneNumber;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get carrier information for a phone number.
   *
   * @param phoneNumber - Phone number to lookup
   * @param countryCode - Optional country code hint
   * @returns Carrier information
   */
  async getCarrierInfo(
    phoneNumber: string,
    countryCode?: string,
  ): Promise<{
    carrier?: {
      type?: string;
      name?: string;
      mobileNetworkCode?: string;
      mobileCountryCode?: string;
      errorCode?: number;
    };
  }> {
    const result = await this.lookupPhoneNumber(phoneNumber, {
      type: 'carrier',
      countryCode,
    });
    return {
      carrier: (result as any).carrier,
    };
  }

  /**
   * Get caller name information for a phone number.
   *
   * @param phoneNumber - Phone number to lookup
   * @param countryCode - Optional country code hint
   * @returns Caller name information
   */
  async getCallerName(
    phoneNumber: string,
    countryCode?: string,
  ): Promise<{
    callerName?: {
      callerName?: string;
      callerType?: string;
      errorCode?: number;
    };
  }> {
    const result = await this.lookupPhoneNumber(phoneNumber, {
      type: 'caller-name',
      countryCode,
    });
    return {
      callerName: result.callerName,
    };
  }

  /**
   * Get line type information (mobile, landline, voip, etc.).
   *
   * @param phoneNumber - Phone number to lookup
   * @param countryCode - Optional country code hint
   * @returns Line type information
   */
  async getLineType(phoneNumber: string, countryCode?: string): Promise<string | null> {
    const result = await this.lookupPhoneNumber(phoneNumber, {
      type: 'carrier',
      countryCode,
    });
    return (result as any).carrier?.type || null;
  }
}
