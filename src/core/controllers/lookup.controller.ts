import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CAPABILITY } from '../capabilities';
import { ProviderRegistryService } from '../provider-registry.service';

@ApiTags('Lookup')
@Controller('lookup')
export class LookupCoreController {
  constructor(private readonly registry: ProviderRegistryService) {}

  @Get(':phoneNumber')
  @ApiOperation({ summary: 'Lookup a phone number via the active provider' })
  lookup(
    @Param('phoneNumber') phoneNumber: string,
    @Query('fields') fields?: string,
    @Query('countryCode') countryCode?: string,
  ) {
    return this.registry.get(CAPABILITY.LOOKUP).lookup({
      phoneNumber,
      fields: fields ? fields.split(',').map((s) => s.trim()) : undefined,
      countryCode,
    });
  }
}
