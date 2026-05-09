import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { MessageBirdModule } from './providers/messagebird/messagebird.module';
import { PlivoModule } from './providers/plivo/plivo.module';
import { TwilioModule, TwilioModuleOptions } from './providers/twilio/twilio.module';
import { VonageModule } from './providers/vonage/vonage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TwilioModuleOptions => ({
        accountSid: configService.get<string>('TWILIO_ACCOUNT_SID') || '',
        authToken: configService.get<string>('TWILIO_AUTH_TOKEN') || '',
        webhookAuthToken: configService.get<string>('TWILIO_WEBHOOK_AUTH_TOKEN'),
      }),
    }),
    VonageModule,
    PlivoModule,
    MessageBirdModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
