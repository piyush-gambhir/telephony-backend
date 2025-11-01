import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { VerifyHelper } from '../helpers/verify.helper';

export class SendVerificationDto {
  @ApiProperty({ description: 'Phone number to verify (E.164 format)', example: '+1234567890' })
  @IsNotEmpty({ message: 'Phone number (to) is required' })
  @IsString({ message: 'Phone number must be a string' })
  to: string;

  @ApiPropertyOptional({
    description: 'Verification channel',
    enum: ['sms', 'call', 'email', 'whatsapp'],
    example: 'sms',
  })
  @IsOptional()
  @IsEnum(['sms', 'call', 'email', 'whatsapp'], {
    message: 'Channel must be one of: sms, call, email, whatsapp',
  })
  channel?: 'sms' | 'call' | 'email' | 'whatsapp';

  @ApiPropertyOptional({
    description: 'Custom message template',
    example: 'Your verification code is: {{code}}',
  })
  @IsOptional()
  @IsString({ message: 'Custom message must be a string' })
  customMessage?: string;

  @ApiPropertyOptional({ description: 'Custom verification code (for testing)', example: '123456' })
  @IsOptional()
  @IsString({ message: 'Custom code must be a string' })
  customCode?: string;

  @ApiPropertyOptional({ description: 'Digits to play during call verification', example: '1234' })
  @IsOptional()
  @IsString({ message: 'Send digits must be a string' })
  sendDigits?: string;

  @ApiPropertyOptional({ description: 'Locale for verification messages', example: 'en' })
  @IsOptional()
  @IsString({ message: 'Locale must be a string' })
  locale?: string;

  @ApiPropertyOptional({ description: 'Amount for payment verification', example: '29.99' })
  @IsOptional()
  @IsString({ message: 'Amount must be a string' })
  amount?: string;

  @ApiPropertyOptional({ description: 'Payee name for payment verification', example: 'Acme Corp' })
  @IsOptional()
  @IsString({ message: 'Payee must be a string' })
  payee?: string;

  @ApiPropertyOptional({ description: 'Rate limit configuration' })
  @IsOptional()
  @IsObject({ message: 'Rate limits must be an object' })
  rateLimits?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, string>;
}

export class CheckVerificationDto {
  @ApiProperty({ description: 'Phone number to verify (E.164 format)', example: '+1234567890' })
  @IsNotEmpty({ message: 'Phone number (to) is required' })
  @IsString({ message: 'Phone number must be a string' })
  to: string;

  @ApiProperty({ description: 'Verification code to check', example: '123456' })
  @IsNotEmpty({ message: 'Verification code is required' })
  @IsString({ message: 'Verification code must be a string' })
  code: string;
}

@ApiTags('Twilio - Verification')
@Controller('twilio/verify')
export class VerifyController {
  constructor(private readonly verifyHelper: VerifyHelper) {}

  /**
   * Send a verification code
   * POST /twilio/verify/services/:serviceSid/verifications
   */
  @ApiOperation({
    summary: 'Send verification code',
    description: 'Send a verification code via SMS, call, email, or WhatsApp',
  })
  @ApiResponse({ status: 201, description: 'Verification code sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - to phone number is required' })
  @ApiParam({
    name: 'serviceSid',
    description: 'Twilio Verify Service SID',
    example: 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Post('services/:serviceSid/verifications')
  async sendVerification(
    @Param('serviceSid') serviceSid: string,
    @Body() sendDto: SendVerificationDto,
  ) {
    try {
      const result = await this.verifyHelper.sendVerification(serviceSid, sendDto.to, {
        channel: sendDto.channel,
        customMessage: sendDto.customMessage,
        customCode: sendDto.customCode,
        sendDigits: sendDto.sendDigits,
        locale: sendDto.locale,
        amount: sendDto.amount,
        payee: sendDto.payee,
        rateLimits: sendDto.rateLimits,
        metadata: sendDto.metadata,
      });
      return {
        success: true,
        data: result,
        message: 'Verification code sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send verification code',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify a code
   * POST /twilio/verify/services/:serviceSid/verification-checks
   */
  @ApiOperation({
    summary: 'Check verification code',
    description: 'Verify a code sent to a phone number',
  })
  @ApiResponse({ status: 200, description: 'Verification check completed' })
  @ApiResponse({ status: 400, description: 'Bad request - to phone number and code are required' })
  @ApiParam({
    name: 'serviceSid',
    description: 'Twilio Verify Service SID',
    example: 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Post('services/:serviceSid/verification-checks')
  async checkVerification(
    @Param('serviceSid') serviceSid: string,
    @Body() checkDto: CheckVerificationDto,
  ) {
    try {
      const result = await this.verifyHelper.checkVerificationCode(
        serviceSid,
        checkDto.to,
        checkDto.code,
      );
      return {
        success: true,
        data: result,
        message: result.valid ? 'Verification successful' : 'Verification failed',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to verify code',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch a verification by SID
   * GET /twilio/verify/services/:serviceSid/verifications/:verificationSid
   */
  @ApiOperation({
    summary: 'Get verification by SID',
    description: 'Retrieve details of a specific verification attempt',
  })
  @ApiResponse({ status: 200, description: 'Verification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Verification not found' })
  @ApiParam({
    name: 'serviceSid',
    description: 'Twilio Verify Service SID',
    example: 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'verificationSid',
    description: 'Twilio Verification SID',
    example: 'VExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('services/:serviceSid/verifications/:verificationSid')
  async getVerification(
    @Param('serviceSid') serviceSid: string,
    @Param('verificationSid') verificationSid: string,
  ) {
    try {
      const result = await this.verifyHelper.fetchVerification(serviceSid, verificationSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch verification',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Fetch a verification check by SID
   * GET /twilio/verify/services/:serviceSid/verification-checks/:checkSid
   */
  @ApiOperation({
    summary: 'Get verification check by SID',
    description: 'Retrieve details of a specific verification check',
  })
  @ApiResponse({ status: 200, description: 'Verification check retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Verification check not found' })
  @ApiParam({
    name: 'serviceSid',
    description: 'Twilio Verify Service SID',
    example: 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'checkSid',
    description: 'Twilio Verification Check SID',
    example: 'VCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('services/:serviceSid/verification-checks/:checkSid')
  async getVerificationCheck(
    @Param('serviceSid') serviceSid: string,
    @Param('checkSid') checkSid: string,
  ) {
    try {
      const result = await this.verifyHelper.fetchVerificationCheck(serviceSid, checkSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch verification check',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List verifications for a service
   * GET /twilio/verify/services/:serviceSid/verifications
   */
  @ApiOperation({
    summary: 'List verifications',
    description: 'Retrieve all verification attempts for a Verify Service',
  })
  @ApiResponse({ status: 200, description: 'Verifications retrieved successfully' })
  @ApiParam({
    name: 'serviceSid',
    description: 'Twilio Verify Service SID',
    example: 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('services/:serviceSid/verifications')
  async listVerifications(@Param('serviceSid') serviceSid: string) {
    try {
      const result = await this.verifyHelper.listVerifications(serviceSid);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list verifications',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
