import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Enhanced recording management.
 * Handles fetching, listing, and deleting recordings.
 *
 * @docs https://www.twilio.com/docs/voice/api/recording-resource
 */
@Injectable()
export class RecordingsHelper {
  private readonly logger = new Logger(RecordingsHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Fetch a specific recording by SID.
   *
   * @param recordingSid - Recording SID
   * @returns Recording instance
   */
  async fetchRecording(
    recordingSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.recordings>['fetch']>>> {
    return this.client.recordings(recordingSid).fetch();
  }

  /**
   * List recordings with optional filtering.
   *
   * @param params - Optional filter parameters
   * @returns List of recording instances
   */
  async listRecordings(params?: {
    callSid?: string;
    dateCreatedBefore?: Date;
    dateCreatedAfter?: Date;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.recordings.list>>> {
    return this.client.recordings.list(params || {});
  }

  /**
   * Delete a recording.
   *
   * @param recordingSid - Recording SID
   * @returns True if deleted successfully
   */
  async deleteRecording(recordingSid: string): Promise<boolean> {
    await this.client.recordings(recordingSid).remove();
    return true;
  }

  /**
   * Get recording URL for download.
   *
   * @param recordingSid - Recording SID
   * @param accountSid - Account SID (optional, defaults to client's account)
   * @returns Recording URL
   */
  async getRecordingUrl(
    recordingSid: string,
    accountSid?: string,
  ): Promise<string> {
    const recording = await this.fetchRecording(recordingSid);
    const sid = accountSid || recording.accountSid;
    return `https://api.twilio.com/2010-04-01/Accounts/${sid}/Recordings/${recordingSid}.mp3`;
  }

  /**
   * Get recording in a specific format.
   *
   * @param recordingSid - Recording SID
   * @param format - Recording format ('mp3' | 'wav')
   * @param accountSid - Account SID (optional)
   * @returns Recording URL
   */
  async getRecordingUrlByFormat(
    recordingSid: string,
    format: 'mp3' | 'wav' = 'mp3',
    accountSid?: string,
  ): Promise<string> {
    const recording = await this.fetchRecording(recordingSid);
    const sid = accountSid || recording.accountSid;
    return `https://api.twilio.com/2010-04-01/Accounts/${sid}/Recordings/${recordingSid}.${format}`;
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
    return this.client.recordings.list({ callSid });
  }

  /**
   * Get recording duration in seconds.
   *
   * @param recordingSid - Recording SID
   * @returns Duration in seconds, or null if not available
   */
  async getRecordingDuration(recordingSid: string): Promise<number | null> {
    const recording = await this.fetchRecording(recordingSid);
    return recording.duration ? parseInt(recording.duration, 10) : null;
  }

  /**
   * Get recording file size in bytes.
   *
   * @param recordingSid - Recording SID
   * @returns Size in bytes, or null if not available
   */
  async getRecordingSize(recordingSid: string): Promise<number | null> {
    const recording = await this.fetchRecording(recordingSid);
    return (recording as any).size ? parseInt((recording as any).size, 10) : null;
  }
}

