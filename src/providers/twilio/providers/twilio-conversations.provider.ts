import { Injectable } from '@nestjs/common';
import {
  Conversation,
  ConversationsProvider,
  CreateConversationParams,
} from '../../../core/interfaces/conversations.provider';
import { ConversationsHelper } from '../helpers/conversations.helper';

/**
 * Twilio implementation of `ConversationsProvider`.
 */
@Injectable()
export class TwilioConversationsProvider implements ConversationsProvider {
  constructor(private readonly helper: ConversationsHelper) {}

  async list(params?: { limit?: number }): Promise<Conversation[]> {
    const r = await this.helper.listConversations(params);
    return r.map(toConv);
  }

  async fetch(conversationSid: string): Promise<Conversation> {
    return toConv(await this.helper.fetchConversation(conversationSid));
  }

  async create(params: CreateConversationParams): Promise<Conversation> {
    return toConv(await this.helper.createConversation(params));
  }

  delete(conversationSid: string): Promise<boolean> {
    return this.helper.deleteConversation(conversationSid);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toConv(r: any): Conversation {
  return {
    sid: r.sid,
    friendlyName: r.friendlyName,
    uniqueName: r.uniqueName,
    state: r.state,
    raw: r,
  };
}
