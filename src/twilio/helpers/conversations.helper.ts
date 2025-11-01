import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Multi-channel messaging conversations.
 * Handles conversations, participants, and messages.
 *
 * @docs https://www.twilio.com/docs/conversations
 */
@Injectable()
export class ConversationsHelper {
  private readonly logger = new Logger(ConversationsHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Create a new conversation.
   *
   * @param params - Conversation parameters
   * @returns Created conversation instance
   */
  async createConversation(params?: {
    friendlyName?: string;
    uniqueName?: string;
    attributes?: string;
    messagingServiceSid?: string;
    dateCreated?: Date;
    dateUpdated?: Date;
    state?: 'inactive' | 'active' | 'closed';
    timers?: {
      inactive?: string;
      closed?: string;
    };
  }): Promise<Awaited<ReturnType<typeof this.client.conversations.v1.conversations.create>>> {
    return this.client.conversations.v1.conversations.create(params || {});
  }

  /**
   * Fetch a conversation by SID.
   *
   * @param conversationSid - Conversation SID
   * @returns Conversation instance
   */
  async fetchConversation(
    conversationSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.conversations.v1.conversations>['fetch']>>> {
    return this.client.conversations.v1.conversations(conversationSid).fetch();
  }

  /**
   * List conversations.
   *
   * @param params - Optional filter parameters
   * @returns List of conversation instances
   */
  async listConversations(params?: {
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.conversations.v1.conversations.list>>> {
    return this.client.conversations.v1.conversations.list(params || {});
  }

  /**
   * Update a conversation.
   *
   * @param conversationSid - Conversation SID
   * @param params - Update parameters
   * @returns Updated conversation instance
   */
  async updateConversation(
    conversationSid: string,
    params: {
      friendlyName?: string;
      dateCreated?: Date;
      dateUpdated?: Date;
      attributes?: string;
      messagingServiceSid?: string;
      state?: 'inactive' | 'active' | 'closed';
      timers?: {
        inactive?: string;
        closed?: string;
      };
    },
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.conversations.v1.conversations>['update']>>> {
    return this.client.conversations.v1.conversations(conversationSid).update(params);
  }

  /**
   * Delete a conversation.
   *
   * @param conversationSid - Conversation SID
   * @returns True if deleted successfully
   */
  async deleteConversation(conversationSid: string): Promise<boolean> {
    await this.client.conversations.v1.conversations(conversationSid).remove();
    return true;
  }

  /**
   * Add a participant to a conversation.
   *
   * @param conversationSid - Conversation SID
   * @param params - Participant parameters
   * @returns Created participant instance
   */
  async addParticipant(
    conversationSid: string,
    params: {
      identity?: string;
      messagingBinding?: {
        address?: string;
        proxyAddress?: string;
        type?: 'sms' | 'whatsapp';
      };
      attributes?: string;
      roleSid?: string;
    },
  ): Promise<any> {
    const conversation = this.client.conversations.v1.conversations(conversationSid);
    return (conversation.participants as any).create(params);
  }

  /**
   * List participants in a conversation.
   *
   * @param conversationSid - Conversation SID
   * @returns List of participant instances
   */
  async listParticipants(conversationSid: string): Promise<any[]> {
    const conversation = this.client.conversations.v1.conversations(conversationSid);
    return (conversation.participants as any).list();
  }

  /**
   * Remove a participant from a conversation.
   *
   * @param conversationSid - Conversation SID
   * @param participantSid - Participant SID
   * @returns True if removed successfully
   */
  async removeParticipant(
    conversationSid: string,
    participantSid: string,
  ): Promise<boolean> {
    await this.client.conversations.v1
      .conversations(conversationSid)
      .participants(participantSid)
      .remove();
    return true;
  }

  /**
   * Send a message in a conversation.
   *
   * @param conversationSid - Conversation SID
   * @param params - Message parameters
   * @returns Created message instance
   */
  async sendMessage(
    conversationSid: string,
    params: {
      author?: string;
      body?: string;
      dateCreated?: Date;
      dateUpdated?: Date;
      attributes?: string;
      mediaSid?: string;
      xTwilioWebhookEnabled?: 'true' | 'false';
    },
  ): Promise<any> {
    const conversation = this.client.conversations.v1.conversations(conversationSid);
    return (conversation.messages as any).create(params);
  }

  /**
   * List messages in a conversation.
   *
   * @param conversationSid - Conversation SID
   * @param params - Optional filter parameters
   * @returns List of message instances
   */
  async listMessages(
    conversationSid: string,
    params?: {
      limit?: number;
    },
  ): Promise<any[]> {
    const conversation = this.client.conversations.v1.conversations(conversationSid);
    return (conversation.messages as any).list(params || {});
  }
}

