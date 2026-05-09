import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Short code management.
 * Handles listing and managing short codes.
 *
 * @docs https://www.twilio.com/docs/messaging/shortcodes
 */
@Injectable()
export class ShortCodesHelper {
  private readonly logger = new Logger(ShortCodesHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Fetch a short code by SID.
   *
   * @param shortCodeSid - Short code SID
   * @returns Short code instance
   */
  async fetchShortCode(
    shortCodeSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.api.account.shortCodes>['fetch']>>> {
    return this.client.api.account.shortCodes(shortCodeSid).fetch();
  }

  /**
   * List all short codes.
   *
   * @param params - Optional filter parameters
   * @returns List of short code instances
   */
  async listShortCodes(params?: {
    shortCode?: string;
    friendlyName?: string;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.api.account.shortCodes.list>>> {
    return this.client.api.account.shortCodes.list(params || {});
  }

  /**
   * Update a short code configuration.
   *
   * @param shortCodeSid - Short code SID
   * @param params - Update parameters
   * @returns Updated short code instance
   */
  async updateShortCode(
    shortCodeSid: string,
    params: {
      friendlyName?: string;
      apiVersion?: string;
      smsUrl?: string;
      smsMethod?: 'GET' | 'POST';
      smsFallbackUrl?: string;
      smsFallbackMethod?: 'GET' | 'POST';
      uri?: string;
    },
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.api.account.shortCodes>['update']>>> {
    return this.client.api.account.shortCodes(shortCodeSid).update(params);
  }

  /**
   * Get short code by phone number.
   *
   * @param shortCode - Short code phone number
   * @returns Short code instance or null
   */
  async getShortCodeByNumber(
    shortCode: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.api.account.shortCodes>['fetch']>> | null> {
    const shortCodes = await this.listShortCodes({ shortCode });
    return shortCodes.length > 0 ? shortCodes[0] : null;
  }
}

