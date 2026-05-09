/**
 * Provider-agnostic Voice capability surface.
 */
export interface MakeCallParams {
  to: string;
  from: string;
  url?: string;
  twiml?: string;
  statusCallback?: string;
  statusCallbackEvent?: string[];
  record?: boolean;
  timeout?: number;
}

export interface VoiceCall {
  sid: string;
  status: string;
  to?: string;
  from?: string;
  duration?: string | number | null;
  dateCreated?: Date | string | null;
  raw?: unknown;
}

export interface ListCallsParams {
  to?: string;
  from?: string;
  status?: string;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

export interface VoiceProvider {
  makeCall(params: MakeCallParams): Promise<VoiceCall>;
  fetchCall(callSid: string): Promise<VoiceCall>;
  listCalls(params?: ListCallsParams): Promise<VoiceCall[]>;
  /** Cancel an in-progress call. */
  hangupCall(callSid: string): Promise<VoiceCall>;
}
