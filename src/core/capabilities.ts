/**
 * Capability tokens used by the provider registry to resolve the active
 * provider for a given telephony capability.
 *
 * Each provider implementation registers itself against one or more of these
 * tokens via the `ProviderRegistryService`. Capability-level controllers
 * resolve the active provider at request time.
 */
export const CAPABILITY = {
  SMS: 'SMS',
  VOICE: 'VOICE',
  VERIFY: 'VERIFY',
  LOOKUP: 'LOOKUP',
  NUMBERS: 'NUMBERS',
} as const;

export type Capability = (typeof CAPABILITY)[keyof typeof CAPABILITY];

/**
 * Names of providers known to the codebase. Adding a new provider simply
 * means adding it here and shipping a module that registers itself with the
 * registry under the relevant capability tokens.
 */
export const PROVIDER = {
  TWILIO: 'twilio',
  VONAGE: 'vonage',
  PLIVO: 'plivo',
  MESSAGEBIRD: 'messagebird',
} as const;

export type ProviderName = (typeof PROVIDER)[keyof typeof PROVIDER];

/**
 * Env-var name used to select the active provider for a capability.
 * Examples: PROVIDER_SMS, PROVIDER_VOICE, PROVIDER_VERIFY, ...
 */
export const capabilityEnvVar = (capability: Capability): string => `PROVIDER_${capability}`;
