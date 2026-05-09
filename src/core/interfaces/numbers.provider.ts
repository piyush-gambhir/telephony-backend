/**
 * Provider-agnostic Phone-numbers capability surface.
 */
export interface SearchAvailableNumbersParams {
  countryCode: string;
  type?: 'local' | 'mobile' | 'tollFree' | string;
  areaCode?: string;
  contains?: string;
  smsEnabled?: boolean;
  voiceEnabled?: boolean;
  mmsEnabled?: boolean;
  limit?: number;
}

export interface AvailableNumber {
  phoneNumber: string;
  friendlyName?: string;
  countryCode?: string;
  capabilities?: Record<string, boolean>;
  raw?: unknown;
}

export interface PurchaseNumberParams {
  phoneNumber: string;
  smsUrl?: string;
  voiceUrl?: string;
  statusCallback?: string;
  friendlyName?: string;
}

export interface OwnedNumber {
  sid: string;
  phoneNumber: string;
  friendlyName?: string;
  capabilities?: Record<string, boolean>;
  smsUrl?: string;
  voiceUrl?: string;
  raw?: unknown;
}

export interface ListOwnedNumbersParams {
  phoneNumber?: string;
  friendlyName?: string;
  limit?: number;
}

export interface NumbersProvider {
  searchAvailable(params: SearchAvailableNumbersParams): Promise<AvailableNumber[]>;
  purchase(params: PurchaseNumberParams): Promise<OwnedNumber>;
  listOwned(params?: ListOwnedNumbersParams): Promise<OwnedNumber[]>;
  fetchOwned(numberSid: string): Promise<OwnedNumber>;
  release(numberSid: string): Promise<boolean>;
}
