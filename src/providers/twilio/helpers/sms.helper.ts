import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Simplified wrapper over Twilio's Programmable Messaging API.
 * Handles SMS/MMS sending, message fetching, and segment estimation.
 *
 * @docs https://www.twilio.com/docs/messaging/api/message-resource
 * @docs https://www.twilio.com/docs/messaging/guides/webhook-request
 */
@Injectable()
export class SmsHelper {
  private readonly logger = new Logger(SmsHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Send an SMS or MMS message.
   *
   * @param params - Message parameters
   * @returns Created message instance
   */
  async sendMessage(params: {
    to: string;
    from: string;
    body?: string;
    mediaUrl?: string | string[];
    statusCallback?: string;
    statusCallbackMethod?: 'GET' | 'POST';
    maxPrice?: number;
    provideFeedback?: boolean;
  }): Promise<Awaited<ReturnType<typeof this.client.messages.create>>> {
    this.logger.debug(`[SmsHelper] Sending message from ${params.from} to ${params.to}`);
    this.logger.debug(`[SmsHelper] Message body length: ${params.body?.length || 0} characters`);

    try {
      const result = await this.client.messages.create({
        to: params.to,
        from: params.from,
        body: params.body,
        mediaUrl: Array.isArray(params.mediaUrl)
          ? params.mediaUrl
          : params.mediaUrl
            ? [params.mediaUrl]
            : undefined,
        statusCallback: params.statusCallback,
        maxPrice: params.maxPrice,
        provideFeedback: params.provideFeedback,
      });
      this.logger.debug(
        `[SmsHelper] Message sent successfully: ${result.sid}, status: ${result.status}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`[SmsHelper] Failed to send message: ${error.message}`);
      this.logger.error(`[SmsHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Fetch a specific message by SID.
   *
   * @param messageSid - Message SID
   * @returns Message instance
   */
  async fetchMessage(
    messageSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.messages>['fetch']>>> {
    this.logger.debug(`[SmsHelper] Fetching message: ${messageSid}`);
    try {
      const result = await this.client.messages(messageSid).fetch();
      this.logger.debug(`[SmsHelper] Message fetched: ${result.sid}, status: ${result.status}`);
      return result;
    } catch (error) {
      this.logger.error(`[SmsHelper] Failed to fetch message ${messageSid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * List messages with optional filtering.
   *
   * @param params - Optional filter parameters
   * @returns List of message instances
   */
  async listMessages(params?: {
    to?: string;
    from?: string;
    dateSent?: Date;
    dateSentBefore?: Date;
    dateSentAfter?: Date;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.messages.list>>> {
    this.logger.debug(`[SmsHelper] Listing messages with params: ${JSON.stringify(params)}`);
    try {
      const messages = await this.client.messages.list(params || {});
      this.logger.debug(`[SmsHelper] Found ${messages.length} messages`);
      return messages;
    } catch (error) {
      this.logger.error(`[SmsHelper] Failed to list messages: ${error.message}`);
      throw error;
    }
  }

  /**
   * Estimate the number of segments a message will consume.
   * Uses GSM-7 encoding (1 segment = 160 chars) or UCS-2 (1 segment = 70 chars).
   *
   * @param body - Message body text
   * @returns Estimated segment count
   */
  estimateSegments(body: string): number {
    // Check if message contains non-GSM-7 characters
    const gsm7Regex =
      /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-.\/:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà]*$/;
    const isGsm7 = gsm7Regex.test(body);

    if (isGsm7) {
      // GSM-7: 160 characters per segment, 153 characters per segment if concatenated
      return body.length <= 160 ? 1 : Math.ceil(body.length / 153);
    } else {
      // UCS-2: 70 characters per segment, 67 characters per segment if concatenated
      return body.length <= 70 ? 1 : Math.ceil(body.length / 67);
    }
  }

  /**
   * Delete a message by SID.
   *
   * @param messageSid - Message SID
   * @returns True if deleted successfully
   */
  async deleteMessage(messageSid: string): Promise<boolean> {
    this.logger.debug(`[SmsHelper] Deleting message: ${messageSid}`);
    try {
      await this.client.messages(messageSid).remove();
      this.logger.debug(`[SmsHelper] Message deleted successfully: ${messageSid}`);
      return true;
    } catch (error) {
      this.logger.error(`[SmsHelper] Failed to delete message ${messageSid}: ${error.message}`);
      throw error;
    }
  }
}
