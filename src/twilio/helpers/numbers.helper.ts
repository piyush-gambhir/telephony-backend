import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Search, buy, release, and list phone numbers.
 * Handles available number search, purchase, and management.
 *
 * @docs https://www.twilio.com/docs/phone-numbers/api/incomingphonenumber-resource
 * @docs https://www.twilio.com/docs/phone-numbers/api/availablephonenumber-resource
 */
@Injectable()
export class NumbersHelper {
  private readonly logger = new Logger(NumbersHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Search available phone numbers.
   *
   * @param countryCode - ISO country code (e.g., 'US', 'GB')
   * @param params - Search parameters
   * @returns List of available phone numbers
   */
  async searchAvailableNumbers(
    countryCode: string,
    params?: {
      areaCode?: number;
      contains?: string;
      smsEnabled?: boolean;
      voiceEnabled?: boolean;
      mmsEnabled?: boolean;
      faxEnabled?: boolean;
      beta?: boolean;
      nearNumber?: string;
      nearLatLong?: string;
      distance?: number;
      inPostalCode?: string;
      inRegion?: string;
      inRateCenter?: string;
      limit?: number;
    },
  ): Promise<
    Awaited<ReturnType<ReturnType<typeof this.client.availablePhoneNumbers>['local']['list']>>
  > {
    const availableNumbers = await this.client
      .availablePhoneNumbers(countryCode)
      .local.list(params || {});
    return availableNumbers;
  }

  /**
   * Search available toll-free numbers.
   *
   * @param countryCode - ISO country code (e.g., 'US')
   * @param params - Search parameters
   * @returns List of available toll-free numbers
   */
  async searchTollFreeNumbers(
    countryCode: string,
    params?: {
      areaCode?: number;
      contains?: string;
      smsEnabled?: boolean;
      voiceEnabled?: boolean;
      mmsEnabled?: boolean;
      faxEnabled?: boolean;
      beta?: boolean;
      limit?: number;
    },
  ): Promise<
    Awaited<ReturnType<ReturnType<typeof this.client.availablePhoneNumbers>['tollFree']['list']>>
  > {
    const availableNumbers = await this.client
      .availablePhoneNumbers(countryCode)
      .tollFree.list(params || {});
    return availableNumbers;
  }

  /**
   * Purchase a phone number.
   *
   * @param phoneNumber - Phone number to purchase (E.164 format)
   * @param params - Optional configuration parameters
   * @returns Purchased phone number instance
   */
  async purchaseNumber(
    phoneNumber: string,
    params?: {
      voiceUrl?: string;
      voiceMethod?: 'GET' | 'POST';
      smsUrl?: string;
      smsMethod?: 'GET' | 'POST';
      statusCallback?: string;
      statusCallbackMethod?: 'GET' | 'POST';
      friendlyName?: string;
    },
  ): Promise<Awaited<ReturnType<typeof this.client.incomingPhoneNumbers.create>>> {
    this.logger.debug(`[NumbersHelper] Purchasing phone number: ${phoneNumber}`);

    try {
      const result = await this.client.incomingPhoneNumbers.create({
        phoneNumber,
        voiceUrl: params?.voiceUrl,
        voiceMethod: params?.voiceMethod,
        smsUrl: params?.smsUrl,
        smsMethod: params?.smsMethod,
        statusCallback: params?.statusCallback,
        statusCallbackMethod: params?.statusCallbackMethod,
        friendlyName: params?.friendlyName,
      });
      this.logger.debug(`[NumbersHelper] Phone number purchased successfully: ${result.sid}`);
      return result;
    } catch (error) {
      this.logger.error(
        `[NumbersHelper] Failed to purchase number ${phoneNumber}: ${error.message}`,
      );
      this.logger.error(`[NumbersHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Fetch a specific phone number by SID.
   *
   * @param phoneNumberSid - Phone number SID
   * @returns Phone number instance
   */
  async fetchNumber(
    phoneNumberSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.incomingPhoneNumbers>['fetch']>>> {
    return this.client.incomingPhoneNumbers(phoneNumberSid).fetch();
  }

  /**
   * List owned phone numbers with optional filtering.
   *
   * @param params - Optional filter parameters
   * @returns List of phone number instances
   */
  async listNumbers(params?: {
    phoneNumber?: string;
    friendlyName?: string;
    beta?: boolean;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.incomingPhoneNumbers.list>>> {
    const numbers = await this.client.incomingPhoneNumbers.list(params || {});
    return numbers;
  }

  /**
   * Update a phone number's configuration.
   *
   * @param phoneNumberSid - Phone number SID
   * @param params - Update parameters
   * @returns Updated phone number instance
   */
  async updateNumber(
    phoneNumberSid: string,
    params: {
      voiceUrl?: string;
      voiceMethod?: 'GET' | 'POST';
      smsUrl?: string;
      smsMethod?: 'GET' | 'POST';
      statusCallback?: string;
      statusCallbackMethod?: 'GET' | 'POST';
      friendlyName?: string;
    },
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.incomingPhoneNumbers>['update']>>> {
    return this.client.incomingPhoneNumbers(phoneNumberSid).update(params);
  }

  /**
   * Release (delete) a phone number.
   *
   * @param phoneNumberSid - Phone number SID
   * @returns True if released successfully
   */
  async releaseNumber(phoneNumberSid: string): Promise<boolean> {
    await this.client.incomingPhoneNumbers(phoneNumberSid).remove();
    return true;
  }
}
