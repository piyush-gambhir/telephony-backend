import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Usage and billing tracking.
 * Handles fetching usage records and pricing information.
 *
 * @docs https://www.twilio.com/docs/usage/api
 */
@Injectable()
export class UsageHelper {
  private readonly logger = new Logger(UsageHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * List usage records.
   *
   * @param params - Optional filter parameters
   * @returns List of usage record instances
   */
  async listUsageRecords(params?: {
    category?:
      | 'sms'
      | 'voice'
      | 'fax'
      | 'monitor'
      | 'recording'
      | 'api-requests'
      | 'wireless'
      | 'all';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.usage.records.list>>> {
    return this.client.usage.records.list(params || {});
  }

  /**
   * List usage records by category.
   *
   * @param category - Usage category
   * @param params - Optional filter parameters
   * @returns List of usage record instances
   */
  async listUsageRecordsByCategory(
    category: 'sms' | 'voice' | 'fax' | 'monitor' | 'recording' | 'api-requests' | 'wireless',
    params?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    },
  ): Promise<Awaited<ReturnType<typeof this.client.usage.records.list>>> {
    return this.client.usage.records.list({
      category,
      ...params,
    });
  }

  /**
   * Get today's usage.
   *
   * @param category - Optional category filter
   * @returns List of today's usage records
   */
  async getTodayUsage(
    category?: string,
  ): Promise<Awaited<ReturnType<typeof this.client.usage.records.list>>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.client.usage.records.list({
      startDate: today,
      category: category as any,
    });
  }

  /**
   * Get usage for a date range.
   *
   * @param startDate - Start date
   * @param endDate - End date
   * @param category - Optional category filter
   * @returns List of usage records
   */
  async getUsageForDateRange(
    startDate: Date,
    endDate: Date,
    category?: string,
  ): Promise<Awaited<ReturnType<typeof this.client.usage.records.list>>> {
    return this.client.usage.records.list({
      startDate,
      endDate,
      category: category as any,
    });
  }

  /**
   * Get SMS usage.
   *
   * @param params - Optional filter parameters
   * @returns List of SMS usage records
   */
  async getSmsUsage(params?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.usage.records.list>>> {
    return this.listUsageRecordsByCategory('sms', params);
  }

  /**
   * Get Voice usage.
   *
   * @param params - Optional filter parameters
   * @returns List of Voice usage records
   */
  async getVoiceUsage(params?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.usage.records.list>>> {
    return this.listUsageRecordsByCategory('voice', params);
  }

  /**
   * Fetch phone number pricing information.
   *
   * @param phoneNumber - Phone number to get pricing for (E.164 format)
   * @param countryCode - Country code (e.g., 'US')
   * @returns Pricing information
   */
  async getPhoneNumberPricing(phoneNumber: string, countryCode: string): Promise<any> {
    // This requires a custom API call as it's not in the SDK
    // Using TwilioHttpHelper would be better, but for now return info
    return {
      phoneNumber,
      countryCode,
      note: 'Use TwilioHttpHelper for detailed pricing API calls',
    };
  }

  /**
   * Get account balance.
   *
   * @returns Account balance information
   */
  async getAccountBalance(): Promise<{
    balance: string;
    currency: string;
  }> {
    const account = await this.client.api.accounts(this.client.accountSid).fetch();
    return {
      balance: (account.balance as any)?.toString() || '0',
      currency: (account as any).currency || 'USD',
    };
  }
}
