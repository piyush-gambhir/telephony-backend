import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Capability, ProviderName, capabilityEnvVar } from './capabilities';
import {
  ConversationsProvider,
  LookupProvider,
  MessagingServicesProvider,
  NumbersProvider,
  SmsProvider,
  VerifyProvider,
  VoiceProvider,
} from './interfaces';

/**
 * Mapping of capability -> implementation type. Used purely for type
 * inference inside the registry; the runtime store keeps `unknown`.
 */
export interface CapabilityImplMap {
  SMS: SmsProvider;
  VOICE: VoiceProvider;
  VERIFY: VerifyProvider;
  LOOKUP: LookupProvider;
  NUMBERS: NumbersProvider;
  MESSAGING_SERVICES: MessagingServicesProvider;
  CONVERSATIONS: ConversationsProvider;
}

type Registry = {
  [C in Capability]?: Map<ProviderName, CapabilityImplMap[C]>;
};

/**
 * Resolves the active provider implementation for each capability based on
 * environment variables (`PROVIDER_SMS=twilio`, `PROVIDER_VOICE=twilio`, ...).
 *
 * Each provider module calls `register` from its `onModuleInit` to register
 * itself for one or more capabilities. Capability-level controllers call
 * `get` at request time to resolve the active implementation.
 *
 * Different providers can serve different capabilities — the env vars are
 * independent.
 */
@Injectable()
export class ProviderRegistryService {
  private readonly logger = new Logger(ProviderRegistryService.name);
  private readonly registry: Registry = {};

  constructor(private readonly config: ConfigService) {}

  register<C extends Capability>(
    capability: C,
    providerName: ProviderName,
    impl: CapabilityImplMap[C],
  ): void {
    let bucket = this.registry[capability] as Map<ProviderName, CapabilityImplMap[C]> | undefined;
    if (!bucket) {
      bucket = new Map();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.registry as any)[capability] = bucket;
    }
    bucket.set(providerName, impl);
    this.logger.log(`Registered provider "${providerName}" for capability "${capability}"`);
  }

  /**
   * Resolve the active provider implementation for the given capability.
   * Throws `NotImplementedException` if no provider is configured or the
   * configured provider has not registered itself.
   */
  get<C extends Capability>(capability: C): CapabilityImplMap[C] {
    const envVar = capabilityEnvVar(capability);
    const providerName = (this.config.get<string>(envVar) || '').toLowerCase() as ProviderName;

    if (!providerName) {
      throw new NotImplementedException(
        `No provider configured for capability "${capability}". Set ${envVar} (e.g. ${envVar}=twilio).`,
      );
    }

    const bucket = this.registry[capability] as
      | Map<ProviderName, CapabilityImplMap[C]>
      | undefined;
    const impl = bucket?.get(providerName);
    if (!impl) {
      throw new NotImplementedException(
        `Provider "${providerName}" is not registered for capability "${capability}". ` +
          `Either it isn't bundled or it hasn't finished registering.`,
      );
    }
    return impl;
  }

  /** Active provider name for a capability (for logging / debug). */
  activeProviderName(capability: Capability): string | undefined {
    return this.config.get<string>(capabilityEnvVar(capability));
  }
}
