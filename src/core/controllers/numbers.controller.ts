import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CAPABILITY } from '../capabilities';
import type {
  ListOwnedNumbersParams,
  PurchaseNumberParams,
  SearchAvailableNumbersParams,
} from '../interfaces';
import { ProviderRegistryService } from '../provider-registry.service';

@ApiTags('Numbers')
@Controller('numbers')
export class NumbersCoreController {
  constructor(private readonly registry: ProviderRegistryService) {}

  @Get('available')
  @ApiOperation({ summary: 'Search available numbers via the active provider' })
  search(@Query() query: SearchAvailableNumbersParams) {
    return this.registry.get(CAPABILITY.NUMBERS).searchAvailable(query);
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Purchase a phone number' })
  purchase(@Body() body: PurchaseNumberParams) {
    return this.registry.get(CAPABILITY.NUMBERS).purchase(body);
  }

  @Get()
  @ApiOperation({ summary: 'List owned numbers' })
  list(@Query() query: ListOwnedNumbersParams) {
    return this.registry.get(CAPABILITY.NUMBERS).listOwned(query);
  }

  @Get(':sid')
  @ApiOperation({ summary: 'Fetch an owned number by SID/ID' })
  fetch(@Param('sid') sid: string) {
    return this.registry.get(CAPABILITY.NUMBERS).fetchOwned(sid);
  }

  @Delete(':sid')
  @ApiOperation({ summary: 'Release an owned number' })
  release(@Param('sid') sid: string) {
    return this.registry.get(CAPABILITY.NUMBERS).release(sid);
  }
}
