import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UsageHelper } from '../helpers/usage.helper';

export class ListUsageRecordsDto {
  @ApiPropertyOptional({ description: 'Usage category (sms, voice, fax, etc.)', example: 'sms' })
  @IsOptional()
  @IsEnum(['sms', 'voice', 'fax', 'monitor', 'recording', 'api-requests', 'wireless', 'all'], { message: 'Invalid usage category' })
  category?: 'sms' | 'voice' | 'fax' | 'monitor' | 'recording' | 'api-requests' | 'wireless' | 'all';

  @ApiPropertyOptional({ description: 'Start date (ISO format)', example: '2024-01-01' })
  @IsOptional()
  @IsString({ message: 'Start date must be a string' })
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO format)', example: '2024-01-31' })
  @IsOptional()
  @IsString({ message: 'End date must be a string' })
  endDate?: string;

  @ApiPropertyOptional({ description: 'Maximum number of results', example: 20, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  limit?: number;
}

export class GetUsageByCategoryDto {
  @ApiPropertyOptional({ description: 'Start date (ISO format)', example: '2024-01-01' })
  @IsOptional()
  @IsString({ message: 'Start date must be a string' })
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO format)', example: '2024-01-31' })
  @IsOptional()
  @IsString({ message: 'End date must be a string' })
  endDate?: string;
}

export class GetPhoneNumberPricingDto {
  @ApiProperty({ description: 'Phone number (E.164 format)', example: '+1234567890' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber: string;

  @ApiProperty({ description: 'ISO country code', example: 'US' })
  @IsString({ message: 'Country code must be a string' })
  countryCode: string;
}

@ApiTags('Twilio - Usage & Billing')
@Controller('twilio/usage')
export class UsageController {
  constructor(private readonly usageHelper: UsageHelper) {}

  /**
   * List usage records
   * GET /twilio/usage/records?category=sms&startDate=2024-01-01&endDate=2024-01-31
   */
  @ApiOperation({ summary: 'List usage records', description: 'Retrieve usage records for SMS, voice, fax, and other Twilio services' })
  @ApiResponse({ status: 200, description: 'Usage records retrieved successfully' })
  @ApiQuery({ name: 'category', required: false, description: 'Usage category (sms, voice, fax, etc.)', example: 'sms' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)', example: '2024-01-31' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get('records')
  async listUsageRecords(@Query() query: ListUsageRecordsDto) {
    try {
      const params = {
        category: query.category,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        limit: query.limit,
      };

      const result = await this.usageHelper.listUsageRecords(params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list usage records',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get today's usage
   * GET /twilio/usage/today?category=sms
   */
  @ApiOperation({ summary: 'Get today\'s usage', description: 'Retrieve usage records for today by category' })
  @ApiResponse({ status: 200, description: 'Today\'s usage retrieved successfully' })
  @ApiQuery({ name: 'category', required: false, description: 'Usage category (sms, voice, fax, etc.)', example: 'sms' })
  @Get('today')
  async getTodayUsage(@Query('category') category?: string) {
    try {
      const result = await this.usageHelper.getTodayUsage(category);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get today\'s usage',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get usage by category
   * GET /twilio/usage/category/:category?startDate=2024-01-01&endDate=2024-01-31
   */
  @ApiOperation({ summary: 'Get usage by category', description: 'Retrieve usage records filtered by a specific category' })
  @ApiResponse({ status: 200, description: 'Usage records retrieved successfully' })
  @ApiParam({ name: 'category', description: 'Usage category', example: 'sms' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)', example: '2024-01-31' })
  @Get('category/:category')
  async getUsageByCategory(
    @Param('category') category: string,
    @Query() query: GetUsageByCategoryDto,
  ) {
    try {
      const params = {
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      };

      const result = await this.usageHelper.listUsageRecordsByCategory(category as any, params);
      return {
        success: true,
        data: result,
        count: result.length,
        category,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get usage by category',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get account balance
   * GET /twilio/usage/balance
   */
  @ApiOperation({ summary: 'Get account balance', description: 'Retrieve the current account balance and currency' })
  @ApiResponse({ status: 200, description: 'Account balance retrieved successfully' })
  @Get('balance')
  async getAccountBalance() {
    try {
      const balance = await this.usageHelper.getAccountBalance();
      return {
        success: true,
        data: {
          balance: balance.balance,
          currency: balance.currency,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get account balance',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get phone number pricing
   * GET /twilio/usage/pricing/phone-number?phoneNumber=+1234567890&countryCode=US
   */
  @ApiOperation({ summary: 'Get phone number pricing', description: 'Retrieve pricing information for a specific phone number' })
  @ApiResponse({ status: 200, description: 'Phone number pricing retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - phoneNumber and countryCode are required' })
  @ApiQuery({ name: 'phoneNumber', required: true, description: 'Phone number (E.164 format)', example: '+1234567890' })
  @ApiQuery({ name: 'countryCode', required: true, description: 'ISO country code', example: 'US' })
  @Get('pricing/phone-number')
  async getPhoneNumberPricing(@Query() query: GetPhoneNumberPricingDto) {
    try {
      const result = await this.usageHelper.getPhoneNumberPricing(query.phoneNumber, query.countryCode);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get phone number pricing',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
