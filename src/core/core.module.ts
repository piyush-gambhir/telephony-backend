import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LookupCoreController } from './controllers/lookup.controller';
import { NumbersCoreController } from './controllers/numbers.controller';
import { SmsCoreController } from './controllers/sms.controller';
import { VerifyCoreController } from './controllers/verify.controller';
import { VoiceCoreController } from './controllers/voice.controller';
import { ProviderRegistryService } from './provider-registry.service';

/**
 * Core (provider-agnostic) module: capability interfaces, the
 * `ProviderRegistryService`, and capability-level REST controllers.
 *
 * Provider modules (Twilio, Vonage, Plivo, MessageBird) register their
 * implementations against the registry so that controllers here can resolve
 * the active provider per capability at request time.
 */
@Global()
@Module({
  imports: [ConfigModule],
  controllers: [
    SmsCoreController,
    VoiceCoreController,
    VerifyCoreController,
    LookupCoreController,
    NumbersCoreController,
  ],
  providers: [ProviderRegistryService],
  exports: [ProviderRegistryService],
})
export class CoreModule {}
