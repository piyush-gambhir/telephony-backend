import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Fax sending and receiving.
 * Handles sending, receiving, and managing faxes.
 *
 * Note: Twilio Fax API has been deprecated. Use TwilioHttpHelper for REST API calls
 * or migrate to alternative solutions.
 *
 * @docs https://www.twilio.com/docs/fax
 * @deprecated Twilio Fax API is deprecated
 */
@Injectable()
export class FaxHelper {
  private readonly logger = new Logger(FaxHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Send a fax.
   * Note: Fax API is deprecated - consider using TwilioHttpHelper for REST API calls.
   *
   * @param params - Fax parameters
   * @returns Created fax instance
   */
  async sendFax(params: {
    to: string;
    from: string;
    mediaUrl: string;
    quality?: 'standard' | 'fine';
    statusCallback?: string;
    statusCallbackMethod?: 'GET' | 'POST';
    storeMedia?: boolean;
    ttl?: number;
  }): Promise<any> {
    // Fax API is deprecated - use TwilioHttpHelper for REST API calls
    throw new Error('Twilio Fax API is deprecated. Use TwilioHttpHelper for REST API calls.');
  }

  /**
   * Fetch a fax by SID.
   * Note: Fax API is deprecated - use TwilioHttpHelper for REST API calls.
   *
   * @param faxSid - Fax SID
   * @returns Fax instance
   */
  async fetchFax(faxSid: string): Promise<any> {
    throw new Error('Twilio Fax API is deprecated. Use TwilioHttpHelper for REST API calls.');
  }

  /**
   * List faxes with optional filtering.
   * Note: Fax API is deprecated - use TwilioHttpHelper for REST API calls.
   *
   * @param params - Optional filter parameters
   * @returns List of fax instances
   */
  async listFaxes(params?: {
    to?: string;
    from?: string;
    dateCreatedOnOrBefore?: Date;
    dateCreatedAfter?: Date;
    limit?: number;
  }): Promise<any[]> {
    throw new Error('Twilio Fax API is deprecated. Use TwilioHttpHelper for REST API calls.');
  }

  /**
   * Delete a fax.
   * Note: Fax API is deprecated - use TwilioHttpHelper for REST API calls.
   *
   * @param faxSid - Fax SID
   * @returns True if deleted successfully
   */
  async deleteFax(faxSid: string): Promise<boolean> {
    throw new Error('Twilio Fax API is deprecated. Use TwilioHttpHelper for REST API calls.');
  }

  /**
   * Update a fax (e.g., cancel).
   * Note: Fax API is deprecated - use TwilioHttpHelper for REST API calls.
   *
   * @param faxSid - Fax SID
   * @param status - Status to update to ('canceled')
   * @returns Updated fax instance
   */
  async updateFax(faxSid: string, status: 'canceled'): Promise<any> {
    throw new Error('Twilio Fax API is deprecated. Use TwilioHttpHelper for REST API calls.');
  }

  /**
   * Cancel a fax.
   * Note: Fax API is deprecated - use TwilioHttpHelper for REST API calls.
   *
   * @param faxSid - Fax SID
   * @returns Updated fax instance
   */
  async cancelFax(faxSid: string): Promise<any> {
    return this.updateFax(faxSid, 'canceled');
  }

  /**
   * Get fax media URL.
   * Note: Fax API is deprecated - use TwilioHttpHelper for REST API calls.
   *
   * @param faxSid - Fax SID
   * @returns Fax media URL
   */
  async getFaxMediaUrl(faxSid: string): Promise<string | null> {
    throw new Error('Twilio Fax API is deprecated. Use TwilioHttpHelper for REST API calls.');
  }
}
