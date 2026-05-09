/**
 * Provider-agnostic Messaging Services capability surface (sender pools,
 * messaging service SIDs, etc.).
 */
export interface MessagingService {
  sid: string;
  friendlyName?: string;
  inboundRequestUrl?: string;
  fallbackUrl?: string;
  statusCallback?: string;
  raw?: unknown;
}

export interface CreateMessagingServiceParams {
  friendlyName: string;
  inboundRequestUrl?: string;
  fallbackUrl?: string;
  statusCallback?: string;
}

export interface MessagingServicesProvider {
  list(params?: { limit?: number }): Promise<MessagingService[]>;
  fetch(serviceSid: string): Promise<MessagingService>;
  create(params: CreateMessagingServiceParams): Promise<MessagingService>;
  delete(serviceSid: string): Promise<boolean>;
}
