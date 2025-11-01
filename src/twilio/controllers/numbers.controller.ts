import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NumbersHelper } from '../helpers/numbers.helper';

export class SearchNumbersDto {
  @ApiPropertyOptional({ description: 'Area code to search within', example: 415, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Area code must be a number' })
  areaCode?: number;

  @ApiPropertyOptional({ description: 'Phone number pattern to search for', example: '555' })
  @IsOptional()
  @IsString({ message: 'Contains must be a string' })
  contains?: string;

  @ApiPropertyOptional({
    description: 'Filter numbers that support SMS',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'SMS enabled must be a boolean' })
  smsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Filter numbers that support voice calls',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Voice enabled must be a boolean' })
  voiceEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Filter numbers that support MMS',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'MMS enabled must be a boolean' })
  mmsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Filter numbers that support fax',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Fax enabled must be a boolean' })
  faxEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Include beta numbers in search',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Beta must be a boolean' })
  beta?: boolean;

  @ApiPropertyOptional({
    description: 'Search numbers near this phone number',
    example: '+15551234567',
  })
  @IsOptional()
  @IsString({ message: 'Near number must be a string' })
  nearNumber?: string;

  @ApiPropertyOptional({
    description: 'Search numbers near latitude/longitude',
    example: '37.7749,-122.4194',
  })
  @IsOptional()
  @IsString({ message: 'Near lat long must be a string' })
  nearLatLong?: string;

  @ApiPropertyOptional({
    description: 'Distance in miles from nearNumber or nearLatLong',
    example: 50,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Distance must be a number' })
  distance?: number;

  @ApiPropertyOptional({ description: 'Filter by postal code', example: '94102' })
  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  inPostalCode?: string;

  @ApiPropertyOptional({ description: 'Filter by region/state', example: 'CA' })
  @IsOptional()
  @IsString({ message: 'Region must be a string' })
  inRegion?: string;

  @ApiPropertyOptional({ description: 'Filter by rate center', example: 'SAN FRANCISCO' })
  @IsOptional()
  @IsString({ message: 'Rate center must be a string' })
  inRateCenter?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 20,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  limit?: number;
}

export class PurchaseNumberDto {
  @ApiProperty({ description: 'Phone number to purchase (E.164 format)', example: '+15551234567' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'URL for voice webhooks',
    example: 'https://example.com/voice',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Voice URL must be a valid URL' })
  voiceUrl?: string;

  @ApiPropertyOptional({
    description: 'HTTP method for voice webhooks',
    enum: ['GET', 'POST'],
    example: 'POST',
  })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'Voice method must be either GET or POST' })
  voiceMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'URL for SMS webhooks', example: 'https://example.com/sms' })
  @IsOptional()
  @IsUrl({}, { message: 'SMS URL must be a valid URL' })
  smsUrl?: string;

  @ApiPropertyOptional({
    description: 'HTTP method for SMS webhooks',
    enum: ['GET', 'POST'],
    example: 'POST',
  })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'SMS method must be either GET or POST' })
  smsMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({
    description: 'Status callback URL',
    example: 'https://example.com/status',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Status callback must be a valid URL' })
  statusCallback?: string;

  @ApiPropertyOptional({
    description: 'HTTP method for status callback',
    enum: ['GET', 'POST'],
    example: 'POST',
  })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'Status callback method must be either GET or POST' })
  statusCallbackMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'Friendly name for the number', example: 'My Twilio Number' })
  @IsOptional()
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName?: string;
}

export class UpdateNumberDto {
  @ApiPropertyOptional({
    description: 'URL for voice webhooks',
    example: 'https://example.com/voice',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Voice URL must be a valid URL' })
  voiceUrl?: string;

  @ApiPropertyOptional({
    description: 'HTTP method for voice webhooks',
    enum: ['GET', 'POST'],
    example: 'POST',
  })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'Voice method must be either GET or POST' })
  voiceMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'URL for SMS webhooks', example: 'https://example.com/sms' })
  @IsOptional()
  @IsUrl({}, { message: 'SMS URL must be a valid URL' })
  smsUrl?: string;

  @ApiPropertyOptional({
    description: 'HTTP method for SMS webhooks',
    enum: ['GET', 'POST'],
    example: 'POST',
  })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'SMS method must be either GET or POST' })
  smsMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({
    description: 'Status callback URL',
    example: 'https://example.com/status',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Status callback must be a valid URL' })
  statusCallback?: string;

  @ApiPropertyOptional({
    description: 'HTTP method for status callback',
    enum: ['GET', 'POST'],
    example: 'POST',
  })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'Status callback method must be either GET or POST' })
  statusCallbackMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({
    description: 'Friendly name for the number',
    example: 'Updated Number Name',
  })
  @IsOptional()
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName?: string;
}

export class ListNumbersDto {
  @ApiPropertyOptional({ description: 'Filter by phone number', example: '+15551234567' })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by friendly name', example: 'My Number' })
  @IsOptional()
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName?: string;

  @ApiPropertyOptional({ description: 'Include beta numbers', example: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Beta must be a boolean' })
  beta?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 20,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  limit?: number;
}

@ApiTags('Twilio - Phone Numbers')
@Controller('twilio/numbers')
export class NumbersController {
  constructor(private readonly numbersHelper: NumbersHelper) {}

  /**
   * Search available local phone numbers
   * GET /twilio/numbers/search/local/:countryCode?areaCode=555&limit=10
   */
  @ApiOperation({
    summary: 'Search local phone numbers',
    description: 'Search for available local phone numbers in a specific country',
  })
  @ApiResponse({ status: 200, description: 'Phone numbers retrieved successfully' })
  @ApiParam({ name: 'countryCode', description: 'ISO country code (e.g., US, GB)', example: 'US' })
  @ApiQuery({
    name: 'areaCode',
    required: false,
    description: 'Area code to search within',
    type: Number,
  })
  @ApiQuery({
    name: 'contains',
    required: false,
    description: 'Phone number pattern to search for',
  })
  @ApiQuery({
    name: 'smsEnabled',
    required: false,
    description: 'Filter numbers that support SMS',
    type: Boolean,
  })
  @ApiQuery({
    name: 'voiceEnabled',
    required: false,
    description: 'Filter numbers that support voice',
    type: Boolean,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results',
    type: Number,
  })
  @Get('search/local/:countryCode')
  async searchLocalNumbers(
    @Param('countryCode') countryCode: string,
    @Query() query: SearchNumbersDto,
  ) {
    try {
      const params = {
        areaCode: query.areaCode,
        contains: query.contains,
        smsEnabled: query.smsEnabled ? query.smsEnabled === true : undefined,
        voiceEnabled: query.voiceEnabled ? query.voiceEnabled === true : undefined,
        mmsEnabled: query.mmsEnabled ? query.mmsEnabled === true : undefined,
        faxEnabled: query.faxEnabled ? query.faxEnabled === true : undefined,
        beta: query.beta ? query.beta === true : undefined,
        nearNumber: query.nearNumber,
        nearLatLong: query.nearLatLong,
        distance: query.distance,
        inPostalCode: query.inPostalCode,
        inRegion: query.inRegion,
        inRateCenter: query.inRateCenter,
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.numbersHelper.searchAvailableNumbers(countryCode, params);
      return {
        success: true,
        data: result,
        count: result.length,
        country: countryCode,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to search local numbers',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search available toll-free numbers
   * GET /twilio/numbers/search/tollfree/:countryCode?limit=10
   */
  @ApiOperation({
    summary: 'Search toll-free numbers',
    description: 'Search for available toll-free phone numbers in a specific country',
  })
  @ApiResponse({ status: 200, description: 'Toll-free numbers retrieved successfully' })
  @ApiParam({ name: 'countryCode', description: 'ISO country code (e.g., US, GB)', example: 'US' })
  @ApiQuery({
    name: 'contains',
    required: false,
    description: 'Phone number pattern to search for',
  })
  @ApiQuery({
    name: 'smsEnabled',
    required: false,
    description: 'Filter numbers that support SMS',
    type: Boolean,
  })
  @ApiQuery({
    name: 'voiceEnabled',
    required: false,
    description: 'Filter numbers that support voice',
    type: Boolean,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results',
    type: Number,
  })
  @Get('search/tollfree/:countryCode')
  async searchTollFreeNumbers(
    @Param('countryCode') countryCode: string,
    @Query() query: SearchNumbersDto,
  ) {
    try {
      const params = {
        areaCode: query.areaCode,
        contains: query.contains,
        smsEnabled: query.smsEnabled ? query.smsEnabled === true : undefined,
        voiceEnabled: query.voiceEnabled ? query.voiceEnabled === true : undefined,
        mmsEnabled: query.mmsEnabled ? query.mmsEnabled === true : undefined,
        faxEnabled: query.faxEnabled ? query.faxEnabled === true : undefined,
        beta: query.beta ? query.beta === true : undefined,
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.numbersHelper.searchTollFreeNumbers(countryCode, params);
      return {
        success: true,
        data: result,
        count: result.length,
        country: countryCode,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to search toll-free numbers',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Purchase a phone number
   * POST /twilio/numbers/purchase
   */
  @ApiOperation({
    summary: 'Purchase phone number',
    description: 'Purchase an available phone number from Twilio',
  })
  @ApiResponse({ status: 201, description: 'Phone number purchased successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - phone number is required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('purchase')
  async purchaseNumber(@Body() purchaseDto: PurchaseNumberDto) {
    try {
      const result = await this.numbersHelper.purchaseNumber(purchaseDto.phoneNumber, {
        voiceUrl: purchaseDto.voiceUrl,
        voiceMethod: purchaseDto.voiceMethod,
        smsUrl: purchaseDto.smsUrl,
        smsMethod: purchaseDto.smsMethod,
        statusCallback: purchaseDto.statusCallback,
        statusCallbackMethod: purchaseDto.statusCallbackMethod,
        friendlyName: purchaseDto.friendlyName,
      });
      return {
        success: true,
        data: result,
        message: 'Phone number purchased successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to purchase phone number',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch a specific phone number by SID
   * GET /twilio/numbers/:phoneNumberSid
   */
  @ApiOperation({
    summary: 'Get phone number by SID',
    description: 'Retrieve details of a specific phone number by its SID',
  })
  @ApiResponse({ status: 200, description: 'Phone number retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Phone number not found' })
  @ApiParam({
    name: 'phoneNumberSid',
    description: 'Twilio Phone Number SID',
    example: 'PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get(':phoneNumberSid')
  async getNumber(@Param('phoneNumberSid') phoneNumberSid: string) {
    try {
      const result = await this.numbersHelper.fetchNumber(phoneNumberSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch phone number',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List owned phone numbers
   * GET /twilio/numbers?friendlyName=MyNumber&limit=10
   */
  @ApiOperation({
    summary: 'List phone numbers',
    description: 'Retrieve a list of phone numbers owned by the account',
  })
  @ApiResponse({ status: 200, description: 'Phone numbers retrieved successfully' })
  @ApiQuery({ name: 'phoneNumber', required: false, description: 'Filter by phone number' })
  @ApiQuery({ name: 'friendlyName', required: false, description: 'Filter by friendly name' })
  @ApiQuery({ name: 'beta', required: false, description: 'Include beta numbers', type: Boolean })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results',
    type: Number,
  })
  @Get()
  async listNumbers(@Query() query: ListNumbersDto) {
    try {
      const params = {
        phoneNumber: query.phoneNumber,
        friendlyName: query.friendlyName,
        beta: query.beta ? query.beta === true : undefined,
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.numbersHelper.listNumbers(params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list phone numbers',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a phone number's configuration
   * PUT /twilio/numbers/:phoneNumberSid
   */
  @ApiOperation({
    summary: 'Update phone number',
    description: 'Update the configuration of a phone number (webhooks, friendly name, etc.)',
  })
  @ApiResponse({ status: 200, description: 'Phone number updated successfully' })
  @ApiResponse({ status: 404, description: 'Phone number not found' })
  @ApiParam({
    name: 'phoneNumberSid',
    description: 'Twilio Phone Number SID',
    example: 'PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Put(':phoneNumberSid')
  async updateNumber(
    @Param('phoneNumberSid') phoneNumberSid: string,
    @Body() updateDto: UpdateNumberDto,
  ) {
    try {
      const result = await this.numbersHelper.updateNumber(phoneNumberSid, updateDto);
      return {
        success: true,
        data: result,
        message: 'Phone number updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update phone number',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Release/delete a phone number
   * DELETE /twilio/numbers/:phoneNumberSid
   */
  @ApiOperation({
    summary: 'Release phone number',
    description: 'Release a phone number from your account (cannot be undone)',
  })
  @ApiResponse({ status: 200, description: 'Phone number released successfully' })
  @ApiResponse({ status: 404, description: 'Phone number not found' })
  @ApiParam({
    name: 'phoneNumberSid',
    description: 'Twilio Phone Number SID',
    example: 'PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Delete(':phoneNumberSid')
  async releaseNumber(@Param('phoneNumberSid') phoneNumberSid: string) {
    try {
      const result = await this.numbersHelper.releaseNumber(phoneNumberSid);
      return {
        success: true,
        message: 'Phone number released successfully',
        data: { released: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to release phone number',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
