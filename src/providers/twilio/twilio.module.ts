import { DynamicModule, Global, Module, OnModuleInit } from '@nestjs/common';
import Twilio from 'twilio';
import { CAPABILITY, PROVIDER } from '../../core/capabilities';
import { ProviderRegistryService } from '../../core/provider-registry.service';
import { TwilioConversationsProvider } from './providers/twilio-conversations.provider';
import { TwilioLookupProvider } from './providers/twilio-lookup.provider';
import { TwilioMessagingServicesProvider } from './providers/twilio-messaging-services.provider';
import { TwilioNumbersProvider } from './providers/twilio-numbers.provider';
import { TwilioSmsProvider } from './providers/twilio-sms.provider';
import { TwilioVerifyProvider } from './providers/twilio-verify.provider';
import { TwilioVoiceProvider } from './providers/twilio-voice.provider';
import { A2pController } from './controllers/a2p.controller';
import { ConversationsController } from './controllers/conversations.controller';
import { CredentialsController } from './controllers/credentials.controller';
import { FaxController } from './controllers/fax.controller';
import { LookupController } from './controllers/lookup.controller';
import { MessagingController } from './controllers/messaging.controller';
import { NumbersController } from './controllers/numbers.controller';
import { ProxyController } from './controllers/proxy.controller';
import { RecordingsController } from './controllers/recordings.controller';
import { ShortCodesController } from './controllers/short-codes.controller';
import { SmsController } from './controllers/sms.controller';
import { StudioController } from './controllers/studio.controller';
import { SubaccountsController } from './controllers/subaccounts.controller';
import { TaskRouterController } from './controllers/taskrouter.controller';
import { TrustHubController } from './controllers/trusthub.controller';
import { UsageController } from './controllers/usage.controller';
import { VerifyController } from './controllers/verify.controller';
import { VoiceController } from './controllers/voice.controller';
import { WebhookController } from './controllers/webhook.controller';
import { A2pHelper } from './helpers/a2p.helper';
import { ConversationsHelper } from './helpers/conversations.helper';
import { CredentialHelper } from './helpers/credential.helper';
import { FaxHelper } from './helpers/fax.helper';
import { LookupHelper } from './helpers/lookup.helper';
import { MessagingServiceHelper } from './helpers/messaging-service.helper';
import { NumbersHelper } from './helpers/numbers.helper';
import { ProxyHelper } from './helpers/proxy.helper';
import { RecordingsHelper } from './helpers/recordings.helper';
import { ShortCodesHelper } from './helpers/short-codes.helper';
import { SmsHelper } from './helpers/sms.helper';
import { StudioHelper } from './helpers/studio.helper';
import { SubaccountHelper } from './helpers/subaccount.helper';
import { TaskRouterHelper } from './helpers/task-router.helper';
import { TrustHubHelper } from './helpers/trusthub.helper';
import { TwilioClientFactory } from './helpers/twilio-client.factory';
import { TwilioHttpHelper } from './helpers/twilio-http.helper';
import { UsageHelper } from './helpers/usage.helper';
import { VerifyHelper } from './helpers/verify.helper';
import { VoiceHelper } from './helpers/voice.helper';
import { WebhookSignatureGuard } from './helpers/webhook-signature-guard';

export interface TwilioModuleOptions {
  accountSid: string;
  authToken: string;
  /**
   * Optional: Use a subaccount SID instead of main account
   */
  subaccountSid?: string;
  /**
   * Optional: Use an API Key instead of Auth Token
   */
  apiKeySid?: string;
  apiKeySecret?: string;
  /**
   * Optional: Global webhook auth token for signature validation
   * If not provided, will use authToken
   */
  webhookAuthToken?: string;
}

@Global()
@Module({})
export class TwilioModule implements OnModuleInit {
  constructor(
    private readonly registry: ProviderRegistryService,
    private readonly smsProvider: TwilioSmsProvider,
    private readonly voiceProvider: TwilioVoiceProvider,
    private readonly verifyProvider: TwilioVerifyProvider,
    private readonly lookupProvider: TwilioLookupProvider,
    private readonly numbersProvider: TwilioNumbersProvider,
    private readonly messagingServicesProvider: TwilioMessagingServicesProvider,
    private readonly conversationsProvider: TwilioConversationsProvider,
  ) {}

  /**
   * Register Twilio implementations with the provider registry. Capability
   * controllers in `src/core/` resolve the active provider from env at
   * request time; this just makes Twilio *available* under the registry.
   */
  onModuleInit(): void {
    this.registry.register(CAPABILITY.SMS, PROVIDER.TWILIO, this.smsProvider);
    this.registry.register(CAPABILITY.VOICE, PROVIDER.TWILIO, this.voiceProvider);
    this.registry.register(CAPABILITY.VERIFY, PROVIDER.TWILIO, this.verifyProvider);
    this.registry.register(CAPABILITY.LOOKUP, PROVIDER.TWILIO, this.lookupProvider);
    this.registry.register(CAPABILITY.NUMBERS, PROVIDER.TWILIO, this.numbersProvider);
    this.registry.register(
      CAPABILITY.MESSAGING_SERVICES,
      PROVIDER.TWILIO,
      this.messagingServicesProvider,
    );
    this.registry.register(
      CAPABILITY.CONVERSATIONS,
      PROVIDER.TWILIO,
      this.conversationsProvider,
    );
  }

  static forRootAsync(asyncOptions: {
    imports?: any[];
    inject?: any[];
    useFactory: (...args: any[]) => Promise<TwilioModuleOptions> | TwilioModuleOptions;
  }): DynamicModule {
    return {
      module: TwilioModule,
      imports: asyncOptions.imports || [],
      controllers: [
        SubaccountsController,
        SmsController,
        VoiceController,
        NumbersController,
        MessagingController,
        VerifyController,
        LookupController,
        RecordingsController,
        UsageController,
        CredentialsController,
        ConversationsController,
        ProxyController,
        TaskRouterController,
        TrustHubController,
        A2pController,
        FaxController,
        ShortCodesController,
        StudioController,
        WebhookController,
      ],
      providers: [
        {
          provide: 'TWILIO_MODULE_OPTIONS',
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject || [],
        },
        {
          provide: 'TWILIO_CLIENT',
          useFactory: (options: TwilioModuleOptions) => {
            const { accountSid, authToken, subaccountSid, apiKeySid, apiKeySecret } = options;

            if (!accountSid || !authToken) {
              throw new Error(
                'TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in environment variables',
              );
            }

            const clientFactory = new TwilioClientFactory();

            if (apiKeySid && apiKeySecret) {
              return clientFactory.createApiKeyClient(accountSid, apiKeySid, apiKeySecret);
            } else if (subaccountSid) {
              return clientFactory.createSubaccountClient(subaccountSid, authToken);
            } else {
              return clientFactory.createMainClient(accountSid, authToken);
            }
          },
          inject: ['TWILIO_MODULE_OPTIONS'],
        },
        {
          provide: TwilioClientFactory,
          useFactory: () => new TwilioClientFactory(),
        },
        {
          provide: SmsHelper,
          useFactory: (client: Twilio.Twilio) => new SmsHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: VoiceHelper,
          useFactory: (client: Twilio.Twilio) => new VoiceHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: NumbersHelper,
          useFactory: (client: Twilio.Twilio) => new NumbersHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: MessagingServiceHelper,
          useFactory: (client: Twilio.Twilio) => new MessagingServiceHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: SubaccountHelper,
          useFactory: (client: Twilio.Twilio) => new SubaccountHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: VerifyHelper,
          useFactory: (client: Twilio.Twilio) => new VerifyHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: LookupHelper,
          useFactory: (client: Twilio.Twilio) => new LookupHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: RecordingsHelper,
          useFactory: (client: Twilio.Twilio) => new RecordingsHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: UsageHelper,
          useFactory: (client: Twilio.Twilio) => new UsageHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: CredentialHelper,
          useFactory: (client: Twilio.Twilio) => new CredentialHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: ShortCodesHelper,
          useFactory: (client: Twilio.Twilio) => new ShortCodesHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: FaxHelper,
          useFactory: (client: Twilio.Twilio) => new FaxHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: ConversationsHelper,
          useFactory: (client: Twilio.Twilio) => new ConversationsHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: StudioHelper,
          useFactory: (client: Twilio.Twilio) => new StudioHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: ProxyHelper,
          useFactory: (client: Twilio.Twilio) => new ProxyHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: TaskRouterHelper,
          useFactory: (client: Twilio.Twilio) => new TaskRouterHelper(client),
          inject: ['TWILIO_CLIENT'],
        },
        {
          provide: WebhookSignatureGuard,
          useFactory: () => new WebhookSignatureGuard(),
        },
        {
          provide: TwilioHttpHelper,
          useFactory: () => new TwilioHttpHelper(),
        },
        {
          provide: TrustHubHelper,
          useFactory: (httpHelper: TwilioHttpHelper) => new TrustHubHelper(httpHelper),
          inject: [TwilioHttpHelper],
        },
        {
          provide: A2pHelper,
          useFactory: (httpHelper: TwilioHttpHelper) => new A2pHelper(httpHelper),
          inject: [TwilioHttpHelper],
        },
        {
          provide: 'TWILIO_CONFIG',
          useFactory: (options: TwilioModuleOptions) => ({
            accountSid: options.accountSid,
            authToken: options.webhookAuthToken || options.authToken,
          }),
          inject: ['TWILIO_MODULE_OPTIONS'],
        },
        // Capability adapters that implement core interfaces.
        TwilioSmsProvider,
        TwilioVoiceProvider,
        TwilioVerifyProvider,
        TwilioLookupProvider,
        TwilioNumbersProvider,
        TwilioMessagingServicesProvider,
        TwilioConversationsProvider,
      ],
      exports: [
        TwilioClientFactory,
        'TWILIO_CLIENT',
        SmsHelper,
        VoiceHelper,
        NumbersHelper,
        MessagingServiceHelper,
        WebhookSignatureGuard,
        TwilioHttpHelper,
        TrustHubHelper,
        A2pHelper,
        VerifyHelper,
        LookupHelper,
        RecordingsHelper,
        UsageHelper,
        SubaccountHelper,
        CredentialHelper,
        ShortCodesHelper,
        FaxHelper,
        ConversationsHelper,
        StudioHelper,
        ProxyHelper,
        TaskRouterHelper,
        'TWILIO_CONFIG',
        TwilioSmsProvider,
        TwilioVoiceProvider,
        TwilioVerifyProvider,
        TwilioLookupProvider,
        TwilioNumbersProvider,
        TwilioMessagingServicesProvider,
        TwilioConversationsProvider,
      ],
    };
  }

  static forRoot(options: TwilioModuleOptions): DynamicModule {
    const { accountSid, authToken, subaccountSid, apiKeySid, apiKeySecret } = options;

    // Create Twilio client factory
    const clientFactory = new TwilioClientFactory();

    // Create main Twilio client
    let twilioClient: Twilio.Twilio;
    if (apiKeySid && apiKeySecret) {
      twilioClient = clientFactory.createApiKeyClient(accountSid, apiKeySid, apiKeySecret);
    } else if (subaccountSid) {
      twilioClient = clientFactory.createSubaccountClient(subaccountSid, authToken);
    } else {
      twilioClient = clientFactory.createMainClient(accountSid, authToken);
    }

    // Create helpers
    const smsHelper = new SmsHelper(twilioClient);
    const voiceHelper = new VoiceHelper(twilioClient);
    const numbersHelper = new NumbersHelper(twilioClient);
    const messagingServiceHelper = new MessagingServiceHelper(twilioClient);
    const webhookSignatureGuard = new WebhookSignatureGuard();
    const twilioHttpHelper = new TwilioHttpHelper();
    const trustHubHelper = new TrustHubHelper(twilioHttpHelper);
    const a2pHelper = new A2pHelper(twilioHttpHelper);
    const verifyHelper = new VerifyHelper(twilioClient);
    const lookupHelper = new LookupHelper(twilioClient);
    const recordingsHelper = new RecordingsHelper(twilioClient);
    const usageHelper = new UsageHelper(twilioClient);
    const subaccountHelper = new SubaccountHelper(twilioClient);
    const credentialHelper = new CredentialHelper(twilioClient);
    const shortCodesHelper = new ShortCodesHelper(twilioClient);
    const faxHelper = new FaxHelper(twilioClient);
    const conversationsHelper = new ConversationsHelper(twilioClient);
    const studioHelper = new StudioHelper(twilioClient);
    const proxyHelper = new ProxyHelper(twilioClient);
    const taskRouterHelper = new TaskRouterHelper(twilioClient);

    return {
      module: TwilioModule,
      controllers: [SubaccountsController],
      providers: [
        {
          provide: TwilioClientFactory,
          useValue: clientFactory,
        },
        {
          provide: 'TWILIO_CLIENT',
          useValue: twilioClient,
        },
        {
          provide: SmsHelper,
          useValue: smsHelper,
        },
        {
          provide: VoiceHelper,
          useValue: voiceHelper,
        },
        {
          provide: NumbersHelper,
          useValue: numbersHelper,
        },
        {
          provide: MessagingServiceHelper,
          useValue: messagingServiceHelper,
        },
        {
          provide: WebhookSignatureGuard,
          useValue: webhookSignatureGuard,
        },
        {
          provide: TwilioHttpHelper,
          useValue: twilioHttpHelper,
        },
        {
          provide: TrustHubHelper,
          useValue: trustHubHelper,
        },
        {
          provide: A2pHelper,
          useValue: a2pHelper,
        },
        {
          provide: VerifyHelper,
          useValue: verifyHelper,
        },
        {
          provide: LookupHelper,
          useValue: lookupHelper,
        },
        {
          provide: RecordingsHelper,
          useValue: recordingsHelper,
        },
        {
          provide: UsageHelper,
          useValue: usageHelper,
        },
        {
          provide: SubaccountHelper,
          useValue: subaccountHelper,
        },
        {
          provide: CredentialHelper,
          useValue: credentialHelper,
        },
        {
          provide: ShortCodesHelper,
          useValue: shortCodesHelper,
        },
        {
          provide: FaxHelper,
          useValue: faxHelper,
        },
        {
          provide: ConversationsHelper,
          useValue: conversationsHelper,
        },
        {
          provide: StudioHelper,
          useValue: studioHelper,
        },
        {
          provide: ProxyHelper,
          useValue: proxyHelper,
        },
        {
          provide: TaskRouterHelper,
          useValue: taskRouterHelper,
        },
        {
          provide: 'TWILIO_CONFIG',
          useValue: {
            accountSid,
            authToken: options.webhookAuthToken || authToken,
          },
        },
        TwilioSmsProvider,
        TwilioVoiceProvider,
        TwilioVerifyProvider,
        TwilioLookupProvider,
        TwilioNumbersProvider,
        TwilioMessagingServicesProvider,
        TwilioConversationsProvider,
      ],
      exports: [
        TwilioClientFactory,
        'TWILIO_CLIENT',
        SmsHelper,
        VoiceHelper,
        NumbersHelper,
        MessagingServiceHelper,
        WebhookSignatureGuard,
        TwilioHttpHelper,
        TrustHubHelper,
        A2pHelper,
        VerifyHelper,
        LookupHelper,
        RecordingsHelper,
        UsageHelper,
        SubaccountHelper,
        CredentialHelper,
        ShortCodesHelper,
        FaxHelper,
        ConversationsHelper,
        StudioHelper,
        ProxyHelper,
        TaskRouterHelper,
        'TWILIO_CONFIG',
        TwilioSmsProvider,
        TwilioVoiceProvider,
        TwilioVerifyProvider,
        TwilioLookupProvider,
        TwilioNumbersProvider,
        TwilioMessagingServicesProvider,
        TwilioConversationsProvider,
      ],
    };
  }
}
