import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CAPABILITY } from '../capabilities';
import type { ListSmsParams, SendSmsParams } from '../interfaces';
import { ProviderRegistryService } from '../provider-registry.service';

/**
 * Provider-agnostic SMS controller. Delegates to the active SMS provider
 * resolved from `PROVIDER_SMS`. Twilio-specific routes live under
 * `/twilio/sms` and are unchanged.
 */
@ApiTags('SMS')
@Controller('sms')
export class SmsCoreController {
  constructor(private readonly registry: ProviderRegistryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send an SMS/MMS message via the active provider' })
  send(@Body() body: SendSmsParams) {
    return this.registry.get(CAPABILITY.SMS).sendMessage(body);
  }

  @Get()
  @ApiOperation({ summary: 'List SMS messages from the active provider' })
  list(@Query() query: ListSmsParams) {
    return this.registry.get(CAPABILITY.SMS).listMessages(query);
  }

  @Get(':sid')
  @ApiOperation({ summary: 'Fetch an SMS message by SID/ID' })
  fetch(@Param('sid') sid: string) {
    return this.registry.get(CAPABILITY.SMS).fetchMessage(sid);
  }

  @Delete(':sid')
  @ApiOperation({ summary: 'Delete an SMS message' })
  remove(@Param('sid') sid: string) {
    return this.registry.get(CAPABILITY.SMS).deleteMessage(sid);
  }

  @Get('estimate/segments')
  @ApiOperation({ summary: 'Estimate SMS segment count for a body' })
  segments(@Query('body') body: string) {
    return { segments: this.registry.get(CAPABILITY.SMS).estimateSegments(body || '') };
  }
}
