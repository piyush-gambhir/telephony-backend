import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Phone number masking (Proxy).
 * Handles proxy sessions and participants for number masking.
 *
 * @docs https://www.twilio.com/docs/proxy
 */
@Injectable()
export class ProxyHelper {
  private readonly logger = new Logger(ProxyHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Create a proxy session.
   *
   * @param serviceSid - Proxy Service SID
   * @param params - Session parameters
   * @returns Created session instance
   */
  async createSession(
    serviceSid: string,
    params?: {
      uniqueName?: string;
      ttl?: number;
      mode?: 'message-only' | 'voice-only' | 'voice-and-message';
      statusCallback?: string;
      participants?: Array<{
        identifier: string;
        friendlyName?: string;
      }>;
    },
  ): Promise<any> {
    const service = this.client.proxy.v1.services(serviceSid);
    return (service.sessions as any).create(params || {});
  }

  /**
   * Fetch a session by SID.
   *
   * @param serviceSid - Proxy Service SID
   * @param sessionSid - Session SID
   * @returns Session instance
   */
  async fetchSession(serviceSid: string, sessionSid: string): Promise<any> {
    return this.client.proxy.v1
      .services(serviceSid)
      .sessions(sessionSid)
      .fetch();
  }

  /**
   * List sessions.
   *
   * @param serviceSid - Proxy Service SID
   * @param params - Optional filter parameters
   * @returns List of session instances
   */
  async listSessions(
    serviceSid: string,
    params?: {
      limit?: number;
    },
  ): Promise<any[]> {
    const service = this.client.proxy.v1.services(serviceSid);
    return (service.sessions as any).list(params || {});
  }

  /**
   * Update a session.
   *
   * @param serviceSid - Proxy Service SID
   * @param sessionSid - Session SID
   * @param params - Update parameters
   * @returns Updated session instance
   */
  async updateSession(
    serviceSid: string,
    sessionSid: string,
    params: {
      status?: 'open' | 'in-progress' | 'closed' | 'failed' | 'unknown';
      ttl?: number;
      mode?: 'message-only' | 'voice-only' | 'voice-and-message';
      statusCallback?: string;
    },
  ): Promise<any> {
    return this.client.proxy.v1
      .services(serviceSid)
      .sessions(sessionSid)
      .update(params);
  }

  /**
   * Delete a session.
   *
   * @param serviceSid - Proxy Service SID
   * @param sessionSid - Session SID
   * @returns True if deleted successfully
   */
  async deleteSession(serviceSid: string, sessionSid: string): Promise<boolean> {
    await this.client.proxy.v1
      .services(serviceSid)
      .sessions(sessionSid)
      .remove();
    return true;
  }

  /**
   * Add a participant to a session.
   *
   * @param serviceSid - Proxy Service SID
   * @param sessionSid - Session SID
   * @param params - Participant parameters
   * @returns Created participant instance
   */
  async addParticipant(
    serviceSid: string,
    sessionSid: string,
    params: {
      identifier: string;
      friendlyName?: string;
    },
  ): Promise<any> {
    const session = this.client.proxy.v1
      .services(serviceSid)
      .sessions(sessionSid);
    return (session.participants as any).create(params);
  }

  /**
   * List participants in a session.
   *
   * @param serviceSid - Proxy Service SID
   * @param sessionSid - Session SID
   * @returns List of participant instances
   */
  async listParticipants(serviceSid: string, sessionSid: string): Promise<any[]> {
    const session = this.client.proxy.v1
      .services(serviceSid)
      .sessions(sessionSid);
    return (session.participants as any).list();
  }

  /**
   * Remove a participant from a session.
   *
   * @param serviceSid - Proxy Service SID
   * @param sessionSid - Session SID
   * @param participantSid - Participant SID
   * @returns True if removed successfully
   */
  async removeParticipant(
    serviceSid: string,
    sessionSid: string,
    participantSid: string,
  ): Promise<boolean> {
    await this.client.proxy.v1
      .services(serviceSid)
      .sessions(sessionSid)
      .participants(participantSid)
      .remove();
    return true;
  }

  /**
   * Fetch a participant by SID.
   *
   * @param serviceSid - Proxy Service SID
   * @param sessionSid - Session SID
   * @param participantSid - Participant SID
   * @returns Participant instance
   */
  async fetchParticipant(
    serviceSid: string,
    sessionSid: string,
    participantSid: string,
  ): Promise<any> {
    return this.client.proxy.v1
      .services(serviceSid)
      .sessions(sessionSid)
      .participants(participantSid)
      .fetch();
  }
}

