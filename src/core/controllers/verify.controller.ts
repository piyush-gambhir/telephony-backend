import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CAPABILITY } from '../capabilities';
import type { CheckVerificationParams, StartVerificationParams } from '../interfaces';
import { ProviderRegistryService } from '../provider-registry.service';

@ApiTags('Verify')
@Controller('verify')
export class VerifyCoreController {
  constructor(private readonly registry: ProviderRegistryService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a verification (OTP) via the active provider' })
  start(@Body() body: StartVerificationParams) {
    return this.registry.get(CAPABILITY.VERIFY).startVerification(body);
  }

  @Post('check')
  @ApiOperation({ summary: 'Check a verification code' })
  check(@Body() body: CheckVerificationParams) {
    return this.registry.get(CAPABILITY.VERIFY).checkVerification(body);
  }
}
