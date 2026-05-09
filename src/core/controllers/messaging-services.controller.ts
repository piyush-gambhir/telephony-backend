import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CAPABILITY } from '../capabilities';
import type { CreateMessagingServiceParams } from '../interfaces';
import { ProviderRegistryService } from '../provider-registry.service';

@ApiTags('Messaging Services')
@Controller('messaging-services')
export class MessagingServicesCoreController {
  constructor(private readonly registry: ProviderRegistryService) {}

  @Get()
  @ApiOperation({ summary: 'List messaging services' })
  list(@Query('limit') limit?: number) {
    return this.registry.get(CAPABILITY.MESSAGING_SERVICES).list({ limit });
  }

  @Post()
  @ApiOperation({ summary: 'Create a messaging service' })
  create(@Body() body: CreateMessagingServiceParams) {
    return this.registry.get(CAPABILITY.MESSAGING_SERVICES).create(body);
  }

  @Get(':sid')
  @ApiOperation({ summary: 'Fetch a messaging service' })
  fetch(@Param('sid') sid: string) {
    return this.registry.get(CAPABILITY.MESSAGING_SERVICES).fetch(sid);
  }

  @Delete(':sid')
  @ApiOperation({ summary: 'Delete a messaging service' })
  remove(@Param('sid') sid: string) {
    return this.registry.get(CAPABILITY.MESSAGING_SERVICES).delete(sid);
  }
}
