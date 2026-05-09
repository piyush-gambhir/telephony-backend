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
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrustHubHelper } from '../helpers/trusthub.helper';

export class CreateCustomerProfileDto {
  @ApiProperty({
    description: 'Friendly name for the customer profile',
    example: 'Acme Corporation',
  })
  friendlyName: string;

  @ApiProperty({ description: 'Contact email address', example: 'contact@acme.com' })
  email: string;

  @ApiPropertyOptional({
    description: 'Policy SID from TrustHub (defaults to RN9777bf0455c2308e6ecf5c25a5204d20)',
    example: 'RNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  policySid?: string;

  @ApiPropertyOptional({
    description: 'Status callback URL',
    example: 'https://example.com/callback',
  })
  statusCallback?: string;
}

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({
    description: 'Friendly name for the customer profile',
    example: 'Updated Name',
  })
  friendlyName?: string;

  @ApiPropertyOptional({ description: 'Contact email address', example: 'newemail@acme.com' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Status callback URL',
    example: 'https://example.com/callback',
  })
  statusCallback?: string;
}

@ApiTags('Twilio - TrustHub')
@Controller('twilio/trusthub')
export class TrustHubController {
  constructor(private readonly trustHubHelper: TrustHubHelper) {}

  /**
   * Create a Customer Profile (Business Profile)
   * POST /twilio/trusthub/customer-profiles
   */
  @ApiOperation({
    summary: 'Create customer profile',
    description: 'Create a new customer (business) profile for regulatory compliance',
  })
  @ApiResponse({ status: 201, description: 'Customer Profile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - friendlyName and email are required' })
  @Post('customer-profiles')
  async createCustomerProfile(@Body() createDto: CreateCustomerProfileDto) {
    if (!createDto.friendlyName || !createDto.email) {
      throw new HttpException(
        {
          success: false,
          message: 'friendlyName and email are required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Set default policy if not provided
    const policySid = createDto.policySid || 'RN9777bf0455c2308e6ecf5c25a5204d20';

    try {
      const result = await this.trustHubHelper.createCustomerProfile(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        {
          ...createDto,
          policySid,
        },
      );
      return {
        success: true,
        data: result,
        message: 'Customer Profile created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create Customer Profile',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a Customer Profile by SID
   * GET /twilio/trusthub/customer-profiles/:customerProfileSid
   */
  @ApiOperation({
    summary: 'Get customer profile by SID',
    description: 'Retrieve details of a specific customer profile',
  })
  @ApiResponse({ status: 200, description: 'Customer Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer Profile not found' })
  @ApiParam({
    name: 'customerProfileSid',
    description: 'Twilio Customer Profile SID',
    example: 'BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('customer-profiles/:customerProfileSid')
  async getCustomerProfile(@Param('customerProfileSid') customerProfileSid: string) {
    try {
      const result = await this.trustHubHelper.fetchCustomerProfile(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        customerProfileSid,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch Customer Profile',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List Customer Profiles
   * GET /twilio/trusthub/customer-profiles
   */
  @ApiOperation({
    summary: 'List customer profiles',
    description: 'Retrieve all customer profiles with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Customer Profiles retrieved successfully' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: ['draft', 'pending-review', 'twilio-rejected', 'twilio-approved'],
  })
  @ApiQuery({ name: 'friendlyName', required: false, description: 'Filter by friendly name' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results',
    type: Number,
  })
  @Get('customer-profiles')
  async listCustomerProfiles(
    @Query('status') status?: 'draft' | 'pending-review' | 'twilio-rejected' | 'twilio-approved',
    @Query('friendlyName') friendlyName?: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const params = {
        status,
        friendlyName,
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
      };

      const result = await this.trustHubHelper.listCustomerProfiles(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        params,
      );
      return {
        success: true,
        data: result,
        count: result.customer_profiles?.length || 0,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list Customer Profiles',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a Customer Profile
   * PUT /twilio/trusthub/customer-profiles/:customerProfileSid
   */
  @ApiOperation({
    summary: 'Update customer profile',
    description: 'Update customer profile details',
  })
  @ApiResponse({ status: 200, description: 'Customer Profile updated successfully' })
  @ApiParam({
    name: 'customerProfileSid',
    description: 'Twilio Customer Profile SID',
    example: 'BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Put('customer-profiles/:customerProfileSid')
  async updateCustomerProfile(
    @Param('customerProfileSid') customerProfileSid: string,
    @Body() updateDto: UpdateCustomerProfileDto,
  ) {
    try {
      const result = await this.trustHubHelper.updateCustomerProfile(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        customerProfileSid,
        updateDto,
      );
      return {
        success: true,
        data: result,
        message: 'Customer Profile updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update Customer Profile',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a Customer Profile
   * DELETE /twilio/trusthub/customer-profiles/:customerProfileSid
   */
  @ApiOperation({
    summary: 'Delete customer profile',
    description: 'Permanently delete a customer profile',
  })
  @ApiResponse({ status: 200, description: 'Customer Profile deleted successfully' })
  @ApiParam({
    name: 'customerProfileSid',
    description: 'Twilio Customer Profile SID',
    example: 'BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Delete('customer-profiles/:customerProfileSid')
  async deleteCustomerProfile(@Param('customerProfileSid') customerProfileSid: string) {
    try {
      const result = await this.trustHubHelper.deleteCustomerProfile(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        customerProfileSid,
      );
      return {
        success: true,
        message: 'Customer Profile deleted successfully',
        data: { deleted: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete Customer Profile',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Customer Profile verification status
   * GET /twilio/trusthub/customer-profiles/:customerProfileSid/status
   */
  @ApiOperation({
    summary: 'Get customer profile status',
    description: 'Retrieve verification status of a customer profile',
  })
  @ApiResponse({ status: 200, description: 'Customer Profile status retrieved successfully' })
  @ApiParam({
    name: 'customerProfileSid',
    description: 'Twilio Customer Profile SID',
    example: 'BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('customer-profiles/:customerProfileSid/status')
  async getCustomerProfileStatus(@Param('customerProfileSid') customerProfileSid: string) {
    try {
      const result = await this.trustHubHelper.getCustomerProfileStatus(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        customerProfileSid,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get Customer Profile status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List all available Policies
   * GET /twilio/trusthub/policies
   */
  @ApiOperation({
    summary: 'List policies',
    description: 'Retrieve all available TrustHub policies',
  })
  @ApiResponse({ status: 200, description: 'Policies retrieved successfully' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results',
    type: Number,
  })
  @Get('policies')
  async listPolicies(@Query('limit') limit?: number) {
    try {
      const params = {
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
      };

      const result = await this.trustHubHelper.listPolicies(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        params,
      );
      return {
        success: true,
        data: result,
        count: result.policies?.length || 0,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list Policies',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a Policy by SID
   * GET /twilio/trusthub/policies/:policySid
   */
  @ApiOperation({
    summary: 'Get policy by SID',
    description: 'Retrieve details of a specific TrustHub policy',
  })
  @ApiResponse({ status: 200, description: 'Policy retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiParam({
    name: 'policySid',
    description: 'Twilio Policy SID',
    example: 'RNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('policies/:policySid')
  async getPolicy(@Param('policySid') policySid: string) {
    try {
      const result = await this.trustHubHelper.fetchPolicy(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        policySid,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch Policy',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
