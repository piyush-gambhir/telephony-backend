import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShortCodesHelper } from '../helpers/short-codes.helper';

export class UpdateShortCodeDto {
  @ApiPropertyOptional({ description: 'Friendly name for the short code', example: 'My Short Code' })
  friendlyName?: string;

  @ApiPropertyOptional({ description: 'API version to use', example: '2010-04-01' })
  apiVersion?: string;

  @ApiPropertyOptional({ description: 'SMS webhook URL', example: 'https://example.com/sms' })
  smsUrl?: string;

  @ApiPropertyOptional({ description: 'HTTP method for SMS webhooks', enum: ['GET', 'POST'], example: 'POST' })
  smsMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'SMS fallback URL', example: 'https://example.com/fallback' })
  smsFallbackUrl?: string;

  @ApiPropertyOptional({ description: 'HTTP method for fallback URL', enum: ['GET', 'POST'], example: 'POST' })
  smsFallbackMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'URI for the short code', example: '/shortcode' })
  uri?: string;
}

@ApiTags('Twilio - Short Codes')
@Controller('twilio/short-codes')
export class ShortCodesController {
  constructor(private readonly shortCodesHelper: ShortCodesHelper) {}

  /**
   * Get a short code by SID
   * GET /twilio/short-codes/:shortCodeSid
   */
  @ApiOperation({ summary: 'Get short code by SID', description: 'Retrieve details of a specific short code' })
  @ApiResponse({ status: 200, description: 'Short code retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Short code not found' })
  @ApiParam({ name: 'shortCodeSid', description: 'Twilio Short Code SID', example: 'SCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get(':shortCodeSid')
  async getShortCode(@Param('shortCodeSid') shortCodeSid: string) {
    try {
      const result = await this.shortCodesHelper.fetchShortCode(shortCodeSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch short code',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List short codes
   * GET /twilio/short-codes
   */
  @ApiOperation({ summary: 'List short codes', description: 'Retrieve all short codes owned by the account' })
  @ApiResponse({ status: 200, description: 'Short codes retrieved successfully' })
  @ApiQuery({ name: 'shortCode', required: false, description: 'Filter by short code number' })
  @ApiQuery({ name: 'friendlyName', required: false, description: 'Filter by friendly name' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get()
  async listShortCodes(
    @Query('shortCode') shortCode?: string,
    @Query('friendlyName') friendlyName?: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const params = {
        shortCode,
        friendlyName,
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
      };

      const result = await this.shortCodesHelper.listShortCodes(params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list short codes',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a short code
   * PUT /twilio/short-codes/:shortCodeSid
   */
  @ApiOperation({ summary: 'Update short code', description: 'Update the configuration of a short code' })
  @ApiResponse({ status: 200, description: 'Short code updated successfully' })
  @ApiParam({ name: 'shortCodeSid', description: 'Twilio Short Code SID', example: 'SCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Put(':shortCodeSid')
  async updateShortCode(
    @Param('shortCodeSid') shortCodeSid: string,
    @Body() updateDto: UpdateShortCodeDto,
  ) {
    try {
      const result = await this.shortCodesHelper.updateShortCode(shortCodeSid, updateDto);
      return {
        success: true,
        data: result,
        message: 'Short code updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update short code',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get short code by phone number
   * GET /twilio/short-codes/by-number/:shortCode
   */
  @ApiOperation({ summary: 'Get short code by number', description: 'Retrieve a short code by its phone number' })
  @ApiResponse({ status: 200, description: 'Short code retrieved successfully' })
  @ApiParam({ name: 'shortCode', description: 'Short code phone number', example: '12345' })
  @Get('by-number/:shortCode')
  async getShortCodeByNumber(@Param('shortCode') shortCode: string) {
    try {
      const result = await this.shortCodesHelper.getShortCodeByNumber(shortCode);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get short code by number',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
