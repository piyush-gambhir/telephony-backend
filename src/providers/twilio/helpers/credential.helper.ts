import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * API Key and credential management.
 * Handles creating, listing, and managing API keys.
 *
 * @docs https://www.twilio.com/docs/iam/api-key
 */
@Injectable()
export class CredentialHelper {
  private readonly logger = new Logger(CredentialHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Create a new API Key.
   *
   * @param friendlyName - Friendly name for the API key
   * @returns Created API key instance (includes secret - save it!)
   */
  async createApiKey(friendlyName: string): Promise<any> {
    // Note: API keys creation requires REST API calls via TwilioHttpHelper
    // This method is a placeholder - implement using TwilioHttpHelper.post
    throw new Error('API key creation requires REST API calls. Use TwilioHttpHelper instead.');
  }

  /**
   * Fetch an API key by SID.
   *
   * @param keySid - API Key SID (starts with SK...)
   * @returns API key instance
   */
  async fetchApiKey(
    keySid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.api.keys>['fetch']>>> {
    return this.client.api.keys(keySid).fetch();
  }

  /**
   * List all API keys.
   *
   * @param params - Optional filter parameters
   * @returns List of API key instances
   */
  async listApiKeys(params?: {
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.api.keys.list>>> {
    return this.client.api.keys.list(params || {});
  }

  /**
   * Update an API key.
   *
   * @param keySid - API Key SID
   * @param friendlyName - New friendly name
   * @returns Updated API key instance
   */
  async updateApiKey(
    keySid: string,
    friendlyName: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.api.keys>['update']>>> {
    return this.client.api.keys(keySid).update({ friendlyName });
  }

  /**
   * Delete an API key.
   *
   * @param keySid - API Key SID
   * @returns True if deleted successfully
   */
  async deleteApiKey(keySid: string): Promise<boolean> {
    await this.client.api.keys(keySid).remove();
    return true;
  }

  /**
   * Rotate an API key (delete old, create new).
   *
   * @param keySid - API Key SID to rotate
   * @param friendlyName - Friendly name for new key
   * @returns New API key instance (includes secret - save it!)
   */
  async rotateApiKey(keySid: string, friendlyName: string): Promise<any> {
    await this.deleteApiKey(keySid);
    return this.createApiKey(friendlyName);
  }
}

