import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Manage Messaging Services for grouping phone numbers and A2P campaigns.
 * Handles creation, configuration, and sender management.
 *
 * @docs https://www.twilio.com/docs/messaging/api/service-resource
 * @docs https://www.twilio.com/docs/messaging/services/senders
 */
@Injectable()
export class MessagingServiceHelper {
  private readonly logger = new Logger(MessagingServiceHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Create a new Messaging Service.
   *
   * @param params - Messaging Service parameters
   * @returns Created Messaging Service instance
   */
  async createService(params: {
    friendlyName: string;
    inboundRequestUrl?: string;
    inboundMethod?: 'GET' | 'POST';
    fallbackUrl?: string;
    fallbackMethod?: 'GET' | 'POST';
    statusCallback?: string;
    stickySender?: boolean;
    smartEncoding?: boolean;
    scanMessageContent?: 'inherit' | 'enable' | 'disable';
    areaCodeGeomatch?: boolean;
    validityPeriod?: number;
    synchronousValidation?: boolean;
  }): Promise<Awaited<ReturnType<typeof this.client.messaging.v1.services.create>>> {
    return this.client.messaging.v1.services.create({
      friendlyName: params.friendlyName,
      inboundRequestUrl: params.inboundRequestUrl,
      inboundMethod: params.inboundMethod,
      fallbackUrl: params.fallbackUrl,
      fallbackMethod: params.fallbackMethod,
      statusCallback: params.statusCallback,
      stickySender: params.stickySender,
      smartEncoding: params.smartEncoding,
      scanMessageContent: params.scanMessageContent,
      areaCodeGeomatch: params.areaCodeGeomatch,
      validityPeriod: params.validityPeriod,
      synchronousValidation: params.synchronousValidation,
    });
  }

  /**
   * Fetch a specific Messaging Service by SID.
   *
   * @param serviceSid - Messaging Service SID
   * @returns Messaging Service instance
   */
  async fetchService(
    serviceSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.messaging.v1.services>['fetch']>>> {
    return this.client.messaging.v1.services(serviceSid).fetch();
  }

  /**
   * List all Messaging Services.
   *
   * @param params - Optional filter parameters
   * @returns List of Messaging Service instances
   */
  async listServices(params?: {
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.messaging.v1.services.list>>> {
    const services = await this.client.messaging.v1.services.list(params || {});
    return services;
  }

  /**
   * Update a Messaging Service configuration.
   *
   * @param serviceSid - Messaging Service SID
   * @param params - Update parameters
   * @returns Updated Messaging Service instance
   */
  async updateService(
    serviceSid: string,
    params: {
      friendlyName?: string;
      inboundRequestUrl?: string;
      inboundMethod?: 'GET' | 'POST';
      fallbackUrl?: string;
      fallbackMethod?: 'GET' | 'POST';
      statusCallback?: string;
      stickySender?: boolean;
      smartEncoding?: boolean;
      scanMessageContent?: 'inherit' | 'enable' | 'disable';
      areaCodeGeomatch?: boolean;
      validityPeriod?: number;
      synchronousValidation?: boolean;
    },
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.messaging.v1.services>['update']>>> {
    return this.client.messaging.v1.services(serviceSid).update(params);
  }

  /**
   * Delete a Messaging Service.
   *
   * @param serviceSid - Messaging Service SID
   * @returns True if deleted successfully
   */
  async deleteService(serviceSid: string): Promise<boolean> {
    await this.client.messaging.v1.services(serviceSid).remove();
    return true;
  }

  /**
   * Add a phone number to a Messaging Service.
   *
   * @param serviceSid - Messaging Service SID
   * @param phoneNumberSid - Phone number SID to add
   * @returns Created PhoneNumber instance
   */
  async addPhoneNumber(
    serviceSid: string,
    phoneNumberSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.messaging.v1.services>['phoneNumbers']['create']>>> {
    return this.client.messaging.v1
      .services(serviceSid)
      .phoneNumbers.create({ phoneNumberSid });
  }

  /**
   * Remove a phone number from a Messaging Service.
   *
   * @param serviceSid - Messaging Service SID
   * @param phoneNumberSid - Phone number SID to remove
   * @returns True if removed successfully
   */
  async removePhoneNumber(
    serviceSid: string,
    phoneNumberSid: string,
  ): Promise<boolean> {
    await this.client.messaging.v1
      .services(serviceSid)
      .phoneNumbers(phoneNumberSid)
      .remove();
    return true;
  }

  /**
   * List phone numbers associated with a Messaging Service.
   *
   * @param serviceSid - Messaging Service SID
   * @returns List of PhoneNumber instances
   */
  async listPhoneNumbers(
    serviceSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.messaging.v1.services>['phoneNumbers']['list']>>> {
    const phoneNumbers = await this.client.messaging.v1
      .services(serviceSid)
      .phoneNumbers.list();
    return phoneNumbers;
  }

  /**
   * Add a short code to a Messaging Service.
   *
   * @param serviceSid - Messaging Service SID
   * @param shortCodeSid - Short code SID to add
   * @returns Created ShortCode instance
   */
  async addShortCode(
    serviceSid: string,
    shortCodeSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.messaging.v1.services>['shortCodes']['create']>>> {
    return this.client.messaging.v1
      .services(serviceSid)
      .shortCodes.create({ shortCodeSid });
  }

  /**
   * Remove a short code from a Messaging Service.
   *
   * @param serviceSid - Messaging Service SID
   * @param shortCodeSid - Short code SID to remove
   * @returns True if removed successfully
   */
  async removeShortCode(
    serviceSid: string,
    shortCodeSid: string,
  ): Promise<boolean> {
    await this.client.messaging.v1
      .services(serviceSid)
      .shortCodes(shortCodeSid)
      .remove();
    return true;
  }
}

