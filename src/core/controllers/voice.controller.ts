import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CAPABILITY } from '../capabilities';
import type { ListCallsParams, MakeCallParams } from '../interfaces';
import { ProviderRegistryService } from '../provider-registry.service';

@ApiTags('Voice')
@Controller('voice')
export class VoiceCoreController {
  constructor(private readonly registry: ProviderRegistryService) {}

  @Post('calls')
  @ApiOperation({ summary: 'Place a voice call via the active provider' })
  call(@Body() body: MakeCallParams) {
    return this.registry.get(CAPABILITY.VOICE).makeCall(body);
  }

  @Get('calls')
  @ApiOperation({ summary: 'List voice calls' })
  list(@Query() query: ListCallsParams) {
    return this.registry.get(CAPABILITY.VOICE).listCalls(query);
  }

  @Get('calls/:sid')
  @ApiOperation({ summary: 'Fetch a voice call by SID/ID' })
  fetch(@Param('sid') sid: string) {
    return this.registry.get(CAPABILITY.VOICE).fetchCall(sid);
  }

  @Delete('calls/:sid')
  @ApiOperation({ summary: 'Hang up an in-progress call' })
  hangup(@Param('sid') sid: string) {
    return this.registry.get(CAPABILITY.VOICE).hangupCall(sid);
  }
}
