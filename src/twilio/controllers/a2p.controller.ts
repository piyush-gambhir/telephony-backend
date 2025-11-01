import {
  Controller,
  Get,
  Post,
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
  IsNumber,
  IsBoolean,
  IsUrl,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { A2pHelper } from '../helpers/a2p.helper';

export class CreateBrandDto {
  @ApiProperty({ description: 'Customer Profile Bundle SID from TrustHub', example: 'BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  customerProfileBundleSid: string;

  @ApiPropertyOptional({ description: 'Brand type', enum: ['STANDARD', 'STARTER'], example: 'STANDARD' })
  brandType?: 'STANDARD' | 'STARTER';

  @ApiPropertyOptional({ description: 'Mock brand for testing', example: false, type: Boolean })
  mock?: boolean;

  @ApiPropertyOptional({ description: 'Skip automatic secondary vetting', example: false, type: Boolean })
  skipAutomaticSecVet?: boolean;
}

export class CreateCampaignDto {
  @ApiProperty({ description: 'Brand Registration SID', example: 'BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  brandRegistrationSid: string;

  @ApiProperty({ description: 'Campaign name', example: 'My A2P Campaign' })
  campaignName: string;

  @ApiProperty({ description: 'Campaign use case', example: '2FA' })
  campaignUseCase: string;

  @ApiProperty({ description: 'Messaging Service SID', example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  messagingServiceSid: string;

  @ApiPropertyOptional({ description: 'Campaign description', example: 'Two-factor authentication messages' })
  description?: string;

  @ApiPropertyOptional({ description: 'Sample messages', type: [String], example: ['Your code is 123456'] })
  sampleMessages?: string[];

  @ApiPropertyOptional({ description: 'Whether messages contain embedded links', example: false, type: Boolean })
  hasEmbeddedLinks?: boolean;

  @ApiPropertyOptional({ description: 'Whether messages contain embedded phone numbers', example: false, type: Boolean })
  hasEmbeddedPhone?: boolean;

  @ApiPropertyOptional({ description: 'Opt-in keywords', type: [String], example: ['START', 'YES'] })
  optInKeywords?: string[];

  @ApiPropertyOptional({ description: 'Opt-in message', example: 'You have opted in to receive messages' })
  optInMessage?: string;

  @ApiPropertyOptional({ description: 'Opt-out keywords', type: [String], example: ['STOP', 'END'] })
  optOutKeywords?: string[];

  @ApiPropertyOptional({ description: 'Opt-out message', example: 'You have opted out' })
  optOutMessage?: string;

  @ApiPropertyOptional({ description: 'Help keywords', type: [String], example: ['HELP'] })
  helpKeywords?: string[];

  @ApiPropertyOptional({ description: 'Help message', example: 'Reply HELP for assistance' })
  helpMessage?: string;
}

@ApiTags('Twilio - A2P 10DLC')
@Controller('twilio/a2p')
export class A2pController {
  constructor(private readonly a2pHelper: A2pHelper) {}

  /**
   * Create an A2P Brand (business identity)
   * POST /twilio/a2p/brands
   */
  @ApiOperation({ summary: 'Create A2P brand', description: 'Create a new A2P 10DLC brand registration' })
  @ApiResponse({ status: 201, description: 'A2P Brand created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - customerProfileBundleSid is required' })
  @Post('brands')
  async createBrand(@Body() createDto: CreateBrandDto) {
    if (!createDto.customerProfileBundleSid) {
      throw new HttpException(
        {
          success: false,
          message: 'customerProfileBundleSid is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.a2pHelper.createBrand(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        createDto,
      );
      return {
        success: true,
        data: result,
        message: 'A2P Brand created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create A2P Brand',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a Brand by SID
   * GET /twilio/a2p/brands/:brandSid
   */
  @ApiOperation({ summary: 'Get A2P brand by SID', description: 'Retrieve details of a specific A2P brand registration' })
  @ApiResponse({ status: 200, description: 'A2P Brand retrieved successfully' })
  @ApiResponse({ status: 404, description: 'A2P Brand not found' })
  @ApiParam({ name: 'brandSid', description: 'Twilio Brand Registration SID', example: 'BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('brands/:brandSid')
  async getBrand(@Param('brandSid') brandSid: string) {
    try {
      const result = await this.a2pHelper.fetchBrand(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        brandSid,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch A2P Brand',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List Brands
   * GET /twilio/a2p/brands
   */
  @ApiOperation({ summary: 'List A2P brands', description: 'Retrieve all A2P brand registrations' })
  @ApiResponse({ status: 200, description: 'A2P Brands retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get('brands')
  async listBrands(@Query('limit') limit?: number) {
    try {
      const params = {
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
      };

      const result = await this.a2pHelper.listBrands(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        params,
      );
      return {
        success: true,
        data: result,
        count: result.brand_registrations?.length || 0,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list A2P Brands',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create an A2P Campaign
   * POST /twilio/a2p/campaigns
   */
  @ApiOperation({ summary: 'Create A2P campaign', description: 'Create a new A2P 10DLC campaign for messaging' })
  @ApiResponse({ status: 201, description: 'A2P Campaign created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - required fields missing' })
  @Post('campaigns')
  async createCampaign(@Body() createDto: CreateCampaignDto) {
    if (
      !createDto.brandRegistrationSid ||
      !createDto.campaignName ||
      !createDto.campaignUseCase ||
      !createDto.messagingServiceSid
    ) {
      throw new HttpException(
        {
          success: false,
          message: 'brandRegistrationSid, campaignName, campaignUseCase, and messagingServiceSid are required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.a2pHelper.createCampaign(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        createDto,
      );
      return {
        success: true,
        data: result,
        message: 'A2P Campaign created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create A2P Campaign',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a Campaign by SID
   * GET /twilio/a2p/campaigns/:campaignSid
   */
  @ApiOperation({ summary: 'Get A2P campaign by SID', description: 'Retrieve details of a specific A2P campaign' })
  @ApiResponse({ status: 200, description: 'A2P Campaign retrieved successfully' })
  @ApiResponse({ status: 404, description: 'A2P Campaign not found' })
  @ApiParam({ name: 'campaignSid', description: 'Twilio Campaign SID', example: 'CXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('campaigns/:campaignSid')
  async getCampaign(@Param('campaignSid') campaignSid: string) {
    try {
      const result = await this.a2pHelper.fetchCampaign(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        campaignSid,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch A2P Campaign',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List Campaigns for a Brand
   * GET /twilio/a2p/brands/:brandSid/campaigns
   */
  @ApiOperation({ summary: 'List A2P campaigns', description: 'Retrieve all campaigns for a specific A2P brand' })
  @ApiResponse({ status: 200, description: 'A2P Campaigns retrieved successfully' })
  @ApiParam({ name: 'brandSid', description: 'Twilio Brand Registration SID', example: 'BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get('brands/:brandSid/campaigns')
  async listCampaigns(@Param('brandSid') brandSid: string, @Query('limit') limit?: number) {
    try {
      const params = {
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
      };

      const result = await this.a2pHelper.listCampaigns(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        brandSid,
        params,
      );
      return {
        success: true,
        data: result,
        count: result.campaigns?.length || 0,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list A2P Campaigns',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Campaign verification status
   * GET /twilio/a2p/campaigns/:campaignSid/verification
   */
  @ApiOperation({ summary: 'Get campaign verification', description: 'Retrieve verification status for an A2P campaign' })
  @ApiResponse({ status: 200, description: 'Campaign verification retrieved successfully' })
  @ApiParam({ name: 'campaignSid', description: 'Twilio Campaign SID', example: 'CXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('campaigns/:campaignSid/verification')
  async getCampaignVerification(@Param('campaignSid') campaignSid: string) {
    try {
      const result = await this.a2pHelper.getCampaignVerification(
        process.env.TWILIO_ACCOUNT_SID || '',
        process.env.TWILIO_AUTH_TOKEN || '',
        campaignSid,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get A2P Campaign verification',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
