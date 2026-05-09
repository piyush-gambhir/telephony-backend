import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CAPABILITY } from '../capabilities';
import type { CreateConversationParams } from '../interfaces';
import { ProviderRegistryService } from '../provider-registry.service';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationsCoreController {
  constructor(private readonly registry: ProviderRegistryService) {}

  @Get()
  @ApiOperation({ summary: 'List conversations' })
  list(@Query('limit') limit?: number) {
    return this.registry.get(CAPABILITY.CONVERSATIONS).list({ limit });
  }

  @Post()
  @ApiOperation({ summary: 'Create a conversation' })
  create(@Body() body: CreateConversationParams) {
    return this.registry.get(CAPABILITY.CONVERSATIONS).create(body);
  }

  @Get(':sid')
  @ApiOperation({ summary: 'Fetch a conversation' })
  fetch(@Param('sid') sid: string) {
    return this.registry.get(CAPABILITY.CONVERSATIONS).fetch(sid);
  }

  @Delete(':sid')
  @ApiOperation({ summary: 'Delete a conversation' })
  remove(@Param('sid') sid: string) {
    return this.registry.get(CAPABILITY.CONVERSATIONS).delete(sid);
  }
}
