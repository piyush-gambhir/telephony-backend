import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Control voice call lifecycle.
 * Handles outbound calls, fetching call data, and retrieving recordings.
 *
 * @docs https://www.twilio.com/docs/voice/api/call-resource
 * @docs https://www.twilio.com/docs/voice/twiml
 */
@Injectable()
export class VoiceHelper {
  private readonly logger = new Logger(VoiceHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Create an outbound call.
   *
   * @param params - Call parameters
   * @returns Created call instance
   */
  async createCall(params: {
    to: string;
    from: string;
    url?: string;
    twiml?: string;
    statusCallback?: string;
    statusCallbackEvent?: string[];
    statusCallbackMethod?: 'GET' | 'POST';
    record?: boolean;
    recordingStatusCallback?: string;
    recordingChannels?: 'mono' | 'dual';
    recordingStatusCallbackMethod?: 'GET' | 'POST';
  }): Promise<Awaited<ReturnType<typeof this.client.calls.create>>> {
    if (!params.url && !params.twiml) {
      throw new Error('Either url or twiml must be provided');
    }

    this.logger.debug(`[VoiceHelper] Creating call from ${params.from} to ${params.to}`);
    
    try {
      const result = await this.client.calls.create({
        to: params.to,
        from: params.from,
        url: params.url,
        twiml: params.twiml,
        statusCallback: params.statusCallback,
        statusCallbackEvent: params.statusCallbackEvent,
        statusCallbackMethod: params.statusCallbackMethod,
        record: params.record,
        recordingStatusCallback: params.recordingStatusCallback,
        recordingChannels: params.recordingChannels,
        recordingStatusCallbackMethod: params.recordingStatusCallbackMethod,
      });
      this.logger.debug(`[VoiceHelper] Call created successfully: ${result.sid}, status: ${result.status}`);
      return result;
    } catch (error) {
      this.logger.error(`[VoiceHelper] Failed to create call: ${error.message}`);
      this.logger.error(`[VoiceHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Fetch a specific call by SID.
   *
   * @param callSid - Call SID
   * @returns Call instance
   */
  async fetchCall(
    callSid: string,
  ): Promise<
    Awaited<ReturnType<ReturnType<typeof this.client.calls>['fetch']>>
  > {
    return this.client.calls(callSid).fetch();
  }

  /**
   * List calls with optional filtering.
   *
   * @param params - Optional filter parameters
   * @returns List of call instances
   */
  async listCalls(params?: {
    to?: string;
    from?: string;
    status?:
      | 'queued'
      | 'ringing'
      | 'in-progress'
      | 'completed'
      | 'busy'
      | 'failed'
      | 'no-answer'
      | 'canceled';
    startTimeBefore?: Date;
    startTimeAfter?: Date;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.calls.list>>> {
    const calls = await this.client.calls.list(params || {});
    return calls;
  }

  /**
   * Update an ongoing call.
   *
   * @param callSid - Call SID
   * @param params - Update parameters
   * @returns Updated call instance
   */
  async updateCall(
    callSid: string,
    params: {
      status?: 'canceled' | 'completed';
      url?: string;
      twiml?: string;
    },
  ): Promise<
    Awaited<ReturnType<ReturnType<typeof this.client.calls>['update']>>
  > {
    return this.client.calls(callSid).update(params);
  }

  /**
   * Hang up an ongoing call.
   *
   * @param callSid - Call SID
   * @returns Updated call instance
   */
  async hangupCall(
    callSid: string,
  ): Promise<
    Awaited<ReturnType<ReturnType<typeof this.client.calls>['update']>>
  > {
    return this.client.calls(callSid).update({ status: 'completed' });
  }

  /**
   * Get call duration in seconds.
   *
   * @param callSid - Call SID
   * @returns Duration in seconds, or null if call hasn't completed
   */
  async getCallDuration(callSid: string): Promise<number | null> {
    const call = await this.fetchCall(callSid);
    return call.duration ? parseInt(call.duration, 10) : null;
  }

  /**
   * List recordings for a specific call.
   *
   * @param callSid - Call SID
   * @returns List of recording instances
   */
  async listCallRecordings(
    callSid: string,
  ): Promise<Awaited<ReturnType<typeof this.client.recordings.list>>> {
    const recordings = await this.client.recordings.list({ callSid });
    return recordings;
  }
}
