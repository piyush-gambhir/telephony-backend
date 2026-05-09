import { Injectable, Module, NotImplementedException, OnModuleInit } from '@nestjs/common';
import { CAPABILITY, PROVIDER } from '../../core/capabilities';
import {
  ListCallsParams,
  ListOwnedNumbersParams,
  ListSmsParams,
  LookupParams,
  LookupProvider,
  MakeCallParams,
  NumbersProvider,
  PurchaseNumberParams,
  SearchAvailableNumbersParams,
  SendSmsParams,
  SmsProvider,
  StartVerificationParams,
  VerifyProvider,
  VoiceProvider,
  CheckVerificationParams,
} from '../../core/interfaces';
import { ProviderRegistryService } from '../../core/provider-registry.service';

const NAME = PROVIDER.VONAGE;
const notImpl = (op: string) =>
  new NotImplementedException(`Vonage provider has no implementation for "${op}" yet.`);

@Injectable()
export class VonageSmsProvider implements SmsProvider {
  sendMessage(_p: SendSmsParams) {
    return Promise.reject(notImpl('sms.sendMessage'));
  }
  fetchMessage(_sid: string) {
    return Promise.reject(notImpl('sms.fetchMessage'));
  }
  listMessages(_p?: ListSmsParams) {
    return Promise.reject(notImpl('sms.listMessages'));
  }
  deleteMessage(_sid: string) {
    return Promise.reject(notImpl('sms.deleteMessage'));
  }
  estimateSegments(_b: string): number {
    throw notImpl('sms.estimateSegments');
  }
}

@Injectable()
export class VonageVoiceProvider implements VoiceProvider {
  makeCall(_p: MakeCallParams) {
    return Promise.reject(notImpl('voice.makeCall'));
  }
  fetchCall(_sid: string) {
    return Promise.reject(notImpl('voice.fetchCall'));
  }
  listCalls(_p?: ListCallsParams) {
    return Promise.reject(notImpl('voice.listCalls'));
  }
  hangupCall(_sid: string) {
    return Promise.reject(notImpl('voice.hangupCall'));
  }
}

@Injectable()
export class VonageVerifyProvider implements VerifyProvider {
  startVerification(_p: StartVerificationParams) {
    return Promise.reject(notImpl('verify.start'));
  }
  checkVerification(_p: CheckVerificationParams) {
    return Promise.reject(notImpl('verify.check'));
  }
}

@Injectable()
export class VonageLookupProvider implements LookupProvider {
  lookup(_p: LookupParams) {
    return Promise.reject(notImpl('lookup.lookup'));
  }
}

@Injectable()
export class VonageNumbersProvider implements NumbersProvider {
  searchAvailable(_p: SearchAvailableNumbersParams) {
    return Promise.reject(notImpl('numbers.searchAvailable'));
  }
  purchase(_p: PurchaseNumberParams) {
    return Promise.reject(notImpl('numbers.purchase'));
  }
  listOwned(_p?: ListOwnedNumbersParams) {
    return Promise.reject(notImpl('numbers.listOwned'));
  }
  fetchOwned(_sid: string) {
    return Promise.reject(notImpl('numbers.fetchOwned'));
  }
  release(_sid: string) {
    return Promise.reject(notImpl('numbers.release'));
  }
}

/**
 * Placeholder Vonage provider module. Registers `NotImplementedException`-
 * throwing implementations against the registry so the wiring compiles and
 * runs end-to-end. Future contributors fill in real implementations and add
 * Vonage-specific controllers/surfaces under `src/providers/vonage/` if
 * needed (e.g. Vonage Conversations, Vonage Verify Workflow).
 */
@Module({
  providers: [
    VonageSmsProvider,
    VonageVoiceProvider,
    VonageVerifyProvider,
    VonageLookupProvider,
    VonageNumbersProvider,
  ],
  exports: [
    VonageSmsProvider,
    VonageVoiceProvider,
    VonageVerifyProvider,
    VonageLookupProvider,
    VonageNumbersProvider,
  ],
})
export class VonageModule implements OnModuleInit {
  constructor(
    private readonly registry: ProviderRegistryService,
    private readonly sms: VonageSmsProvider,
    private readonly voice: VonageVoiceProvider,
    private readonly verify: VonageVerifyProvider,
    private readonly lookup: VonageLookupProvider,
    private readonly numbers: VonageNumbersProvider,
  ) {}

  onModuleInit(): void {
    this.registry.register(CAPABILITY.SMS, NAME, this.sms);
    this.registry.register(CAPABILITY.VOICE, NAME, this.voice);
    this.registry.register(CAPABILITY.VERIFY, NAME, this.verify);
    this.registry.register(CAPABILITY.LOOKUP, NAME, this.lookup);
    this.registry.register(CAPABILITY.NUMBERS, NAME, this.numbers);
  }
}
