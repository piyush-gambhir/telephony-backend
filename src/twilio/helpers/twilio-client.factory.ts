import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Centralized factory to create Twilio SDK clients from credentials.
 * Handles rotation and caching for multiple clients.
 *
 * @docs https://www.twilio.com/docs/libraries/node
 * @docs https://www.twilio.com/docs/usage/api
 */
@Injectable()
export class TwilioClientFactory {
  private readonly logger = new Logger(TwilioClientFactory.name);
  private readonly clientCache = new Map<string, Twilio.Twilio>();

  /**
   * Create or retrieve a cached Twilio client for the main account.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @returns Twilio client instance
   */
  createMainClient(accountSid: string, authToken: string): Twilio.Twilio {
    const cacheKey = `main:${accountSid}`;

    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey)!;
    }

    const client = Twilio(accountSid, authToken);
    this.clientCache.set(cacheKey, client);
    return client;
  }

  /**
   * Create or retrieve a cached Twilio client for a subaccount.
   *
   * @param accountSid - Subaccount SID
   * @param authToken - Auth Token or API Key Secret
   * @returns Twilio client instance
   */
  createSubaccountClient(accountSid: string, authToken: string): Twilio.Twilio {
    const cacheKey = `subaccount:${accountSid}`;

    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey)!;
    }

    const client = Twilio(accountSid, authToken);
    this.clientCache.set(cacheKey, client);
    return client;
  }

  /**
   * Create a Twilio client using an API Key (SID + Secret).
   *
   * @param accountSid - Account SID
   * @param apiKeySid - API Key SID (starts with SK...)
   * @param apiKeySecret - API Key Secret
   * @returns Twilio client instance
   */
  createApiKeyClient(
    accountSid: string,
    apiKeySid: string,
    apiKeySecret: string,
  ): Twilio.Twilio {
    const cacheKey = `apikey:${accountSid}:${apiKeySid}`;

    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey)!;
    }

    const client = Twilio(apiKeySid, apiKeySecret, { accountSid });
    this.clientCache.set(cacheKey, client);
    return client;
  }

  /**
   * Clear cached client for a specific account.
   *
   * @param accountSid - Account SID to clear
   */
  clearClient(accountSid: string): void {
    for (const [key] of this.clientCache.entries()) {
      if (key.includes(accountSid)) {
        this.clientCache.delete(key);
      }
    }
  }

  /**
   * Clear all cached clients.
   */
  clearAllClients(): void {
    this.clientCache.clear();
  }
}
