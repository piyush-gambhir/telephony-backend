/**
 * Provider-agnostic Conversations capability surface (multi-channel threads).
 */
export interface Conversation {
  sid: string;
  friendlyName?: string;
  uniqueName?: string;
  state?: string;
  raw?: unknown;
}

export interface CreateConversationParams {
  friendlyName?: string;
  uniqueName?: string;
  attributes?: string;
}

export interface ConversationsProvider {
  list(params?: { limit?: number }): Promise<Conversation[]>;
  fetch(conversationSid: string): Promise<Conversation>;
  create(params: CreateConversationParams): Promise<Conversation>;
  delete(conversationSid: string): Promise<boolean>;
}
