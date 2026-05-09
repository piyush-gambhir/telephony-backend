/**
 * Provider-agnostic Lookup capability surface.
 */
export interface LookupParams {
  phoneNumber: string;
  /**
   * Provider-specific list of fields/data-types to enrich with.
   * Twilio: 'caller_name', 'line_type_intelligence', etc.
   */
  fields?: string[];
  countryCode?: string;
}

export interface LookupResult {
  phoneNumber: string;
  countryCode?: string;
  valid?: boolean;
  carrier?: Record<string, unknown> | null;
  callerName?: Record<string, unknown> | null;
  raw?: unknown;
}

export interface LookupProvider {
  lookup(params: LookupParams): Promise<LookupResult>;
}
