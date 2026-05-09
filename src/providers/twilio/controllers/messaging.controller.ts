import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessagingServiceHelper } from '../helpers/messaging-service.helper';

export class CreateServiceDto {
  @ApiProperty({ description: 'Friendly name for the messaging service', example: 'My Messaging Service' })
  @IsNotEmpty({ message: 'Friendly name is required' })
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName: string;

  @ApiPropertyOptional({ description: 'URL for inbound message webhooks', example: 'https://example.com/inbound' })
  @IsOptional()
  @IsUrl({}, { message: 'Inbound request URL must be a valid URL' })
  inboundRequestUrl?: string;

  @ApiPropertyOptional({ description: 'HTTP method for inbound webhooks', enum: ['GET', 'POST'], example: 'POST' })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'Inbound method must be either GET or POST' })
  inboundMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'Fallback URL if primary fails', example: 'https://example.com/fallback' })
  @IsOptional()
  @IsUrl({}, { message: 'Fallback URL must be a valid URL' })
  fallbackUrl?: string;

  @ApiPropertyOptional({ description: 'HTTP method for fallback URL', enum: ['GET', 'POST'], example: 'POST' })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'Fallback method must be either GET or POST' })
  fallbackMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'Status callback URL', example: 'https://example.com/status' })
  @IsOptional()
  @IsUrl({}, { message: 'Status callback must be a valid URL' })
  statusCallback?: string;

  @ApiPropertyOptional({ description: 'Maintain same sender for conversations', example: true, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Sticky sender must be a boolean' })
  stickySender?: boolean;

  @ApiPropertyOptional({ description: 'Enable smart encoding', example: true, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Smart encoding must be a boolean' })
  smartEncoding?: boolean;

  @ApiPropertyOptional({ description: 'Scan message content for compliance', enum: ['inherit', 'enable', 'disable'], example: 'enable' })
  @IsOptional()
  @IsEnum(['inherit', 'enable', 'disable'], { message: 'Scan message content must be inherit, enable, or disable' })
  scanMessageContent?: 'inherit' | 'enable' | 'disable';

  @ApiPropertyOptional({ description: 'Match area code for geographic routing', example: true, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Area code geomatch must be a boolean' })
  areaCodeGeomatch?: boolean;

  @ApiPropertyOptional({ description: 'Message validity period in seconds', example: 14400, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Validity period must be a number' })
  validityPeriod?: number;

  @ApiPropertyOptional({ description: 'Enable synchronous validation', example: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Synchronous validation must be a boolean' })
  synchronousValidation?: boolean;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ description: 'Friendly name for the messaging service', example: 'Updated Service Name' })
  @IsOptional()
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName?: string;

  @ApiPropertyOptional({ description: 'URL for inbound message webhooks', example: 'https://example.com/inbound' })
  @IsOptional()
  @IsUrl({}, { message: 'Inbound request URL must be a valid URL' })
  inboundRequestUrl?: string;

  @ApiPropertyOptional({ description: 'HTTP method for inbound webhooks', enum: ['GET', 'POST'], example: 'POST' })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'Inbound method must be either GET or POST' })
  inboundMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'Fallback URL if primary fails', example: 'https://example.com/fallback' })
  @IsOptional()
  @IsUrl({}, { message: 'Fallback URL must be a valid URL' })
  fallbackUrl?: string;

  @ApiPropertyOptional({ description: 'HTTP method for fallback URL', enum: ['GET', 'POST'], example: 'POST' })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'Fallback method must be either GET or POST' })
  fallbackMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'Status callback URL', example: 'https://example.com/status' })
  @IsOptional()
  @IsUrl({}, { message: 'Status callback must be a valid URL' })
  statusCallback?: string;

  @ApiPropertyOptional({ description: 'Maintain same sender for conversations', example: true, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Sticky sender must be a boolean' })
  stickySender?: boolean;

  @ApiPropertyOptional({ description: 'Enable smart encoding', example: true, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Smart encoding must be a boolean' })
  smartEncoding?: boolean;

  @ApiPropertyOptional({ description: 'Scan message content for compliance', enum: ['inherit', 'enable', 'disable'], example: 'enable' })
  @IsOptional()
  @IsEnum(['inherit', 'enable', 'disable'], { message: 'Scan message content must be inherit, enable, or disable' })
  scanMessageContent?: 'inherit' | 'enable' | 'disable';

  @ApiPropertyOptional({ description: 'Match area code for geographic routing', example: true, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Area code geomatch must be a boolean' })
  areaCodeGeomatch?: boolean;

  @ApiPropertyOptional({ description: 'Message validity period in seconds', example: 14400, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Validity period must be a number' })
  validityPeriod?: number;

  @ApiPropertyOptional({ description: 'Enable synchronous validation', example: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Synchronous validation must be a boolean' })
  synchronousValidation?: boolean;
}

export class ListServicesDto {
  @ApiPropertyOptional({ description: 'Maximum number of results to return', example: 20, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  limit?: number;
}

export class AddPhoneNumberDto {
  @ApiProperty({ description: 'Phone number SID to add to the messaging service', example: 'PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsNotEmpty({ message: 'Phone number SID is required' })
  @IsString({ message: 'Phone number SID must be a string' })
  phoneNumberSid: string;
}

export class AddShortCodeDto {
  @ApiProperty({ description: 'Short code SID to add to the messaging service', example: 'SCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsNotEmpty({ message: 'Short code SID is required' })
  @IsString({ message: 'Short code SID must be a string' })
  shortCodeSid: string;
}

@ApiTags('Twilio - Messaging Services')
@Controller('twilio/messaging')
export class MessagingController {
  constructor(private readonly messagingHelper: MessagingServiceHelper) {}

  /**
   * Create a new Messaging Service
   * POST /twilio/messaging/services
   */
  @ApiOperation({ summary: 'Create messaging service', description: 'Create a new Twilio Messaging Service for managing SMS campaigns' })
  @ApiResponse({ status: 201, description: 'Messaging service created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - friendlyName is required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('services')
  async createService(@Body() createDto: CreateServiceDto) {
    try {
      const result = await this.messagingHelper.createService(createDto);
      return {
        success: true,
        data: result,
        message: 'Messaging Service created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create Messaging Service',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch a specific Messaging Service by SID
   * GET /twilio/messaging/services/:serviceSid
   */
  @ApiOperation({ summary: 'Get messaging service by SID', description: 'Retrieve details of a specific Messaging Service by its SID' })
  @ApiResponse({ status: 200, description: 'Messaging service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Messaging service not found' })
  @ApiParam({ name: 'serviceSid', description: 'Twilio Messaging Service SID', example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('services/:serviceSid')
  async getService(@Param('serviceSid') serviceSid: string) {
    try {
      const result = await this.messagingHelper.fetchService(serviceSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch Messaging Service',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List all Messaging Services
   * GET /twilio/messaging/services?limit=10
   */
  @ApiOperation({ summary: 'List messaging services', description: 'Retrieve a list of all Messaging Services in the account' })
  @ApiResponse({ status: 200, description: 'Messaging services retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results to return', type: Number })
  @Get('services')
  async listServices(@Query() query: ListServicesDto) {
    try {
      const params = {
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.messagingHelper.listServices(params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list Messaging Services',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a Messaging Service
   * PUT /twilio/messaging/services/:serviceSid
   */
  @ApiOperation({ summary: 'Update messaging service', description: 'Update the configuration of a Messaging Service' })
  @ApiResponse({ status: 200, description: 'Messaging service updated successfully' })
  @ApiResponse({ status: 404, description: 'Messaging service not found' })
  @ApiParam({ name: 'serviceSid', description: 'Twilio Messaging Service SID', example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Put('services/:serviceSid')
  async updateService(@Param('serviceSid') serviceSid: string, @Body() updateDto: UpdateServiceDto) {
    try {
      const result = await this.messagingHelper.updateService(serviceSid, updateDto);
      return {
        success: true,
        data: result,
        message: 'Messaging Service updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update Messaging Service',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a Messaging Service
   * DELETE /twilio/messaging/services/:serviceSid
   */
  @ApiOperation({ summary: 'Delete messaging service', description: 'Delete a Messaging Service from the account' })
  @ApiResponse({ status: 200, description: 'Messaging service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Messaging service not found' })
  @ApiParam({ name: 'serviceSid', description: 'Twilio Messaging Service SID', example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Delete('services/:serviceSid')
  async deleteService(@Param('serviceSid') serviceSid: string) {
    try {
      const result = await this.messagingHelper.deleteService(serviceSid);
      return {
        success: true,
        message: 'Messaging Service deleted successfully',
        data: { deleted: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete Messaging Service',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Add a phone number to a Messaging Service
   * POST /twilio/messaging/services/:serviceSid/phone-numbers
   */
  @ApiOperation({ summary: 'Add phone number to service', description: 'Add a phone number to a Messaging Service' })
  @ApiResponse({ status: 201, description: 'Phone number added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - phoneNumberSid is required' })
  @ApiParam({ name: 'serviceSid', description: 'Twilio Messaging Service SID', example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post('services/:serviceSid/phone-numbers')
  async addPhoneNumber(
    @Param('serviceSid') serviceSid: string,
    @Body() body: AddPhoneNumberDto,
  ) {
    try {
      const result = await this.messagingHelper.addPhoneNumber(serviceSid, body.phoneNumberSid);
      return {
        success: true,
        data: result,
        message: 'Phone number added to Messaging Service successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to add phone number to Messaging Service',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Remove a phone number from a Messaging Service
   * DELETE /twilio/messaging/services/:serviceSid/phone-numbers/:phoneNumberSid
   */
  @ApiOperation({ summary: 'Remove phone number from service', description: 'Remove a phone number from a Messaging Service' })
  @ApiResponse({ status: 200, description: 'Phone number removed successfully' })
  @ApiParam({ name: 'serviceSid', description: 'Twilio Messaging Service SID', example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiParam({ name: 'phoneNumberSid', description: 'Twilio Phone Number SID', example: 'PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Delete('services/:serviceSid/phone-numbers/:phoneNumberSid')
  async removePhoneNumber(
    @Param('serviceSid') serviceSid: string,
    @Param('phoneNumberSid') phoneNumberSid: string,
  ) {
    try {
      const result = await this.messagingHelper.removePhoneNumber(serviceSid, phoneNumberSid);
      return {
        success: true,
        message: 'Phone number removed from Messaging Service successfully',
        data: { removed: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to remove phone number from Messaging Service',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List phone numbers in a Messaging Service
   * GET /twilio/messaging/services/:serviceSid/phone-numbers
   */
  @ApiOperation({ summary: 'List phone numbers in service', description: 'Retrieve all phone numbers associated with a Messaging Service' })
  @ApiResponse({ status: 200, description: 'Phone numbers retrieved successfully' })
  @ApiParam({ name: 'serviceSid', description: 'Twilio Messaging Service SID', example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('services/:serviceSid/phone-numbers')
  async listPhoneNumbers(@Param('serviceSid') serviceSid: string) {
    try {
      const result = await this.messagingHelper.listPhoneNumbers(serviceSid);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list phone numbers in Messaging Service',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Add a short code to a Messaging Service
   * POST /twilio/messaging/services/:serviceSid/short-codes
   */
  @ApiOperation({ summary: 'Add short code to service', description: 'Add a short code to a Messaging Service' })
  @ApiResponse({ status: 201, description: 'Short code added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - shortCodeSid is required' })
  @ApiParam({ name: 'serviceSid', description: 'Twilio Messaging Service SID', example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post('services/:serviceSid/short-codes')
  async addShortCode(
    @Param('serviceSid') serviceSid: string,
    @Body() body: AddShortCodeDto,
  ) {
    try {
      const result = await this.messagingHelper.addShortCode(serviceSid, body.shortCodeSid);
      return {
        success: true,
        data: result,
        message: 'Short code added to Messaging Service successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to add short code to Messaging Service',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Remove a short code from a Messaging Service
   * DELETE /twilio/messaging/services/:serviceSid/short-codes/:shortCodeSid
   */
  @ApiOperation({ summary: 'Remove short code from service', description: 'Remove a short code from a Messaging Service' })
  @ApiResponse({ status: 200, description: 'Short code removed successfully' })
  @ApiParam({ name: 'serviceSid', description: 'Twilio Messaging Service SID', example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiParam({ name: 'shortCodeSid', description: 'Twilio Short Code SID', example: 'SCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Delete('services/:serviceSid/short-codes/:shortCodeSid')
  async removeShortCode(
    @Param('serviceSid') serviceSid: string,
    @Param('shortCodeSid') shortCodeSid: string,
  ) {
    try {
      const result = await this.messagingHelper.removeShortCode(serviceSid, shortCodeSid);
      return {
        success: true,
        message: 'Short code removed from Messaging Service successfully',
        data: { removed: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to remove short code from Messaging Service',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
