# telephony-backend

Provider-agnostic telephony backend (SMS, Voice, Verify, Lookup, Numbers, Messaging Services, Conversations, and Twilio-specific surfaces such as A2P 10DLC, TaskRouter, TrustHub, Studio, Proxy, Fax, Short Codes, Subaccounts, Credentials, Recordings, Usage and Webhooks).

Twilio is the first provider. Vonage, Plivo and MessageBird modules ship as stubs that throw `NotImplementedException` and can be filled in incrementally. Each capability is selected independently via env vars, so different providers can serve different capabilities.

## Architecture

```
src/
├── core/                      # Provider-agnostic layer
│   ├── interfaces/            # SmsProvider, VoiceProvider, VerifyProvider, ...
│   ├── controllers/           # /sms, /voice, /verify, /lookup, /numbers, ...
│   ├── provider-registry.service.ts
│   └── core.module.ts
└── providers/
    ├── twilio/                # Twilio implementation + Twilio-specific routes (/twilio/*)
    ├── vonage/                # Stub (NotImplementedException)
    ├── plivo/                 # Stub
    └── messagebird/           # Stub
```

The `ProviderRegistryService` resolves the active provider for each capability from `PROVIDER_<CAPABILITY>` env vars. Capability controllers (`/sms`, `/voice`, ...) delegate to the active provider at request time. Twilio-specific routes (`/twilio/sms`, `/twilio/taskrouter`, etc.) are unchanged from before this refactor — same paths, same request/response shapes — and remain available for surfaces that aren't part of the agnostic core.

## Configuration

Copy `.env.example` to `.env` and fill in credentials.

| Variable                       | Purpose                                                              |
| ------------------------------ | -------------------------------------------------------------------- |
| `PROVIDER_SMS`                 | Active SMS provider (`twilio`, `vonage`, `plivo`, `messagebird`)     |
| `PROVIDER_VOICE`               | Active Voice provider                                                |
| `PROVIDER_VERIFY`              | Active Verify provider                                               |
| `PROVIDER_LOOKUP`              | Active Lookup provider                                               |
| `PROVIDER_NUMBERS`             | Active Numbers provider                                              |
| `PROVIDER_MESSAGING_SERVICES`  | Active Messaging Services provider                                   |
| `PROVIDER_CONVERSATIONS`       | Active Conversations provider                                        |
| `TWILIO_ACCOUNT_SID`           | Twilio account SID                                                   |
| `TWILIO_AUTH_TOKEN`            | Twilio auth token                                                    |
| `TWILIO_WEBHOOK_AUTH_TOKEN`    | Optional override for webhook signature validation                   |
| `PORT`                         | HTTP port (default `3000`)                                           |

## Project setup

```bash
pnpm install
```

## Run

```bash
pnpm dev          # watch mode
pnpm start        # one-off
pnpm start:prod   # production (after `pnpm build`)
```

## Tests

```bash
pnpm test
pnpm test:e2e
pnpm test:cov
```

## Swagger

OpenAPI is served at `/api`. Tags are grouped into:

- **Core (Provider-agnostic)** — `SMS`, `Voice`, `Verify`, `Lookup`, `Numbers`, `Messaging Services`, `Conversations`.
- **Twilio** — Twilio-specific surfaces and full-fidelity Twilio-only routes.

## Adding a provider

1. Create `src/providers/<name>/<name>.module.ts`.
2. Implement the capability interfaces from `src/core/interfaces/` you want to support.
3. In the module's `onModuleInit`, register implementations with `ProviderRegistryService`.
4. Add the module to `AppModule` imports.
5. Set `PROVIDER_<CAPABILITY>=<name>` in `.env`.

The capability controllers in `src/core/controllers/` then route requests to the new provider with no further changes.
