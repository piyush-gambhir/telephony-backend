import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwilioModule, TwilioModuleOptions } from './twilio/twilio.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
