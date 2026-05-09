import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Handle shutdown signals for logging
  process.on('SIGINT', async () => {
    const shutdownLogger = new Logger('Shutdown');
    shutdownLogger.warn('SIGINT received, shutting down gracefully...');
  });

  // Enable global validation pipe with class-validator and class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are provided
      transform: true, // Transform payload to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );

  // Swagger/OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('Telephony Backend API')
    .setDescription(
      'Provider-agnostic telephony API. Capability routes (SMS, Voice, Verify, Lookup, Numbers, Messaging Services, Conversations) delegate to the active provider configured via PROVIDER_<CAPABILITY> env vars. Provider-specific routes (e.g. /twilio/...) remain available for surfaces that aren\'t part of the agnostic core (TaskRouter, TrustHub, A2P 10DLC, Studio, Proxy, Fax, Short Codes, Subaccounts, Credentials, Recordings, Usage, Webhooks).',
    )
    .setVersion('1.0')
    // Provider-agnostic capability tags (delegate to active provider via registry).
    .addTag('SMS', 'Provider-agnostic SMS (delegates to PROVIDER_SMS)')
    .addTag('Voice', 'Provider-agnostic Voice (delegates to PROVIDER_VOICE)')
    .addTag('Verify', 'Provider-agnostic Verify/OTP (delegates to PROVIDER_VERIFY)')
    .addTag('Lookup', 'Provider-agnostic Lookup (delegates to PROVIDER_LOOKUP)')
    .addTag('Numbers', 'Provider-agnostic Numbers (delegates to PROVIDER_NUMBERS)')
    .addTag(
      'Messaging Services',
      'Provider-agnostic Messaging Services (delegates to PROVIDER_MESSAGING_SERVICES)',
    )
    .addTag(
      'Conversations',
      'Provider-agnostic Conversations (delegates to PROVIDER_CONVERSATIONS)',
    )
    .addTag('Twilio - SMS', 'SMS messaging operations')
    .addTag('Twilio - Voice', 'Voice call operations')
    .addTag('Twilio - Phone Numbers', 'Phone number management')
    .addTag('Twilio - Messaging Services', 'Messaging service management')
    .addTag('Twilio - Verification', 'Phone number verification (2FA/OTP)')
    .addTag('Twilio - Lookup', 'Phone number validation and information lookup')
    .addTag('Twilio - Recordings', 'Voice call recording management')
    .addTag('Twilio - Usage & Billing', 'Usage analytics and billing information')
    .addTag('Twilio - Subaccounts', 'Twilio subaccount management')
    .addTag('Twilio - Credentials', 'API key and credential management')
    .addTag('Twilio - Conversations', 'Multi-channel messaging conversations')
    .addTag('Twilio - Proxy', 'Phone number masking and proxy services')
    .addTag('Twilio - TaskRouter', 'Intelligent call routing and task management')
    .addTag('Twilio - TrustHub', 'Regulatory compliance and customer profiles')
    .addTag('Twilio - A2P 10DLC', 'Application-to-Person 10DLC compliance')
    .addTag('Twilio - Fax', 'Fax sending and receiving (deprecated)')
    .addTag('Twilio - Short Codes', 'Short code management')
    .addTag('Twilio - Studio', 'Studio flow execution and management')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Module-level organization using tag prefixes
  // Tags are prefixed with module name (e.g., "Twilio - SMS") to group them together
  // This ensures all Twilio endpoints appear together alphabetically
  // To add another module, simply prefix its tags (e.g., "PaymentModule - Stripe")
  const moduleTagGroups = [
    {
      name: 'Core (Provider-agnostic)',
      tags: [
        'SMS',
        'Voice',
        'Verify',
        'Lookup',
        'Numbers',
        'Messaging Services',
        'Conversations',
      ],
    },
    {
      name: 'Twilio',
      tags: [
        'Twilio - SMS',
        'Twilio - Voice',
        'Twilio - Phone Numbers',
        'Twilio - Messaging Services',
        'Twilio - Verification',
        'Twilio - Lookup',
        'Twilio - Recordings',
        'Twilio - Usage & Billing',
        'Twilio - Subaccounts',
        'Twilio - Credentials',
        'Twilio - Conversations',
        'Twilio - Proxy',
        'Twilio - TaskRouter',
        'Twilio - TrustHub',
        'Twilio - A2P 10DLC',
        'Twilio - Fax',
        'Twilio - Short Codes',
        'Twilio - Studio',
      ],
    },
    // Add more modules here:
    // {
    //   name: 'PaymentModule',
    //   tags: ['PaymentModule - Stripe', 'PaymentModule - PayPal'],
    // },
  ];

  // Apply tag groups to the OpenAPI document
  (document as any)['x-tagGroups'] = moduleTagGroups;

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: -1, // Hide schemas section
      docExpansion: 'none', // Don't expand operations by default
      filter: true, // Enable tag filtering
    },
    customSiteTitle: 'Telephony Backend API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      
      /* HTTP Method Colors */
      .swagger-ui .opblock.opblock-get {
        border-color: #28a745;
        background: rgba(40, 167, 69, 0.1);
      }
      .swagger-ui .opblock.opblock-get .opblock-summary-method {
        background: #28a745;
      }
      .swagger-ui .opblock.opblock-get-anonymous .opblock-summary-method {
        background: #28a745;
      }
      
      .swagger-ui .opblock.opblock-post {
        border-color: #007bff;
        background: rgba(0, 123, 255, 0.1);
      }
      .swagger-ui .opblock.opblock-post .opblock-summary-method {
        background: #007bff;
      }
      .swagger-ui .opblock.opblock-post-anonymous .opblock-summary-method {
        background: #007bff;
      }
      
      .swagger-ui .opblock.opblock-put {
        border-color: #ffc107;
        background: rgba(255, 193, 7, 0.1);
      }
      .swagger-ui .opblock.opblock-put .opblock-summary-method {
        background: #ffc107;
      }
      
      .swagger-ui .opblock.opblock-delete {
        border-color: #dc3545;
        background: rgba(220, 53, 69, 0.1);
      }
      .swagger-ui .opblock.opblock-delete .opblock-summary-method {
        background: #dc3545;
      }
      
      .swagger-ui .opblock.opblock-patch {
        border-color: #6c757d;
        background: rgba(108, 117, 125, 0.1);
      }
      .swagger-ui .opblock.opblock-patch .opblock-summary-method {
        background: #6c757d;
      }
      
      /* Module-level visual separation */
      .swagger-ui .opblock-tag-section {
        margin-bottom: 2rem;
      }
      /* Visual indicator for module groups */
      .swagger-ui .opblock-tag {
        position: relative;
      }
      /* Add subtle border to separate module sections */
      .swagger-ui .opblock-tag-section:not(:last-child) {
        border-bottom: 2px solid #e8e8e8;
        padding-bottom: 1.5rem;
        margin-bottom: 2rem;
      }
    `,
  });

  await app.listen(process.env.PORT ?? 3000);

  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  logger.log(
    `Swagger documentation available at: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
  logger.log(
    `Capability routes available at /sms, /voice, /verify, /lookup, /numbers, /messaging-services, /conversations (delegate to active provider).`,
  );
}
bootstrap();
