import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubaccountHelper } from '../helpers/subaccount.helper';

export class CreateSubaccountDto {
  @ApiProperty({ description: 'Friendly name for the subaccount', example: 'My Subaccount' })
  @IsNotEmpty({ message: 'Friendly name is required' })
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName: string;
}

export class UpdateSubaccountDto {
  @ApiPropertyOptional({ description: 'Friendly name for the subaccount', example: 'Updated Name' })
  @IsOptional()
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName?: string;

  @ApiPropertyOptional({ description: 'Account status', enum: ['active', 'suspended', 'closed'], example: 'active' })
  @IsOptional()
  @IsEnum(['active', 'suspended', 'closed'], { message: 'Status must be active, suspended, or closed' })
  status?: 'active' | 'suspended' | 'closed';
}

export class TransferPhoneNumberDto {
  @ApiProperty({ description: 'Phone number SID to transfer', example: 'PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsNotEmpty({ message: 'Phone number SID is required' })
  @IsString({ message: 'Phone number SID must be a string' })
  phoneNumberSid: string;

  @ApiProperty({ description: 'Target account SID', example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsNotEmpty({ message: 'Target account SID is required' })
  @IsString({ message: 'Target account SID must be a string' })
  targetAccountSid: string;
}

export class ListSubaccountsDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: ['active', 'suspended', 'closed'] })
  @IsOptional()
  @IsEnum(['active', 'suspended', 'closed'], { message: 'Status must be active, suspended, or closed' })
  status?: 'active' | 'suspended' | 'closed';

  @ApiPropertyOptional({ description: 'Filter by friendly name' })
  @IsOptional()
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName?: string;

  @ApiPropertyOptional({ description: 'Maximum number of results', example: 20, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  limit?: number;
}

@ApiTags('Twilio - Subaccounts')
@Controller('twilio/subaccounts')
export class SubaccountsController {
  constructor(private readonly subaccountHelper: SubaccountHelper) {}

  /**
   * List all subaccounts
   * GET /twilio/subaccounts?status=active&friendlyName=Test&limit=10
   */
  @ApiOperation({ summary: 'List subaccounts', description: 'Retrieve all subaccounts with optional filtering' })
  @ApiResponse({ status: 200, description: 'Subaccounts retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', enum: ['active', 'suspended', 'closed'] })
  @ApiQuery({ name: 'friendlyName', required: false, description: 'Filter by friendly name' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get()
  async listSubaccounts(@Query() query: ListSubaccountsDto) {
    try {
      const subaccounts = await this.subaccountHelper.listSubaccounts({
        status: query.status,
        friendlyName: query.friendlyName,
        limit: query.limit,
      });
      return {
        success: true,
        data: subaccounts,
        count: subaccounts.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list subaccounts',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific subaccount by SID
   * GET /twilio/subaccounts/:accountSid
   */
  @ApiOperation({ summary: 'Get subaccount by SID', description: 'Retrieve details of a specific subaccount' })
  @ApiResponse({ status: 200, description: 'Subaccount retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subaccount not found' })
  @ApiParam({ name: 'accountSid', description: 'Twilio Account SID', example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get(':accountSid')
  async getSubaccount(@Param('accountSid') accountSid: string) {
    try {
      const subaccount = await this.subaccountHelper.fetchSubaccount(accountSid);
      return {
        success: true,
        data: subaccount,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch subaccount',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Create a new subaccount
   * POST /twilio/subaccounts
   */
  @ApiOperation({ summary: 'Create subaccount', description: 'Create a new Twilio subaccount' })
  @ApiResponse({ status: 201, description: 'Subaccount created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - friendlyName is required' })
  @Post()
  async createSubaccount(@Body() createDto: CreateSubaccountDto) {
    try {
      const subaccount = await this.subaccountHelper.createSubaccount(
        createDto.friendlyName,
      );
      return {
        success: true,
        data: subaccount,
        message: 'Subaccount created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create subaccount',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a subaccount
   * PATCH /twilio/subaccounts/:accountSid
   */
  @ApiOperation({ summary: 'Update subaccount', description: 'Update subaccount details (friendly name or status)' })
  @ApiResponse({ status: 200, description: 'Subaccount updated successfully' })
  @ApiParam({ name: 'accountSid', description: 'Twilio Account SID', example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Patch(':accountSid')
  async updateSubaccount(
    @Param('accountSid') accountSid: string,
    @Body() updateDto: UpdateSubaccountDto,
  ) {
    try {
      const subaccount = await this.subaccountHelper.updateSubaccount(accountSid, updateDto);
      return {
        success: true,
        data: subaccount,
        message: 'Subaccount updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update subaccount',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Suspend a subaccount
   * POST /twilio/subaccounts/:accountSid/suspend
   */
  @ApiOperation({ summary: 'Suspend subaccount', description: 'Suspend a subaccount (prevents usage)' })
  @ApiResponse({ status: 200, description: 'Subaccount suspended successfully' })
  @ApiParam({ name: 'accountSid', description: 'Twilio Account SID', example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post(':accountSid/suspend')
  async suspendSubaccount(@Param('accountSid') accountSid: string) {
    try {
      const subaccount = await this.subaccountHelper.suspendSubaccount(accountSid);
      return {
        success: true,
        data: subaccount,
        message: 'Subaccount suspended successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to suspend subaccount',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Activate a subaccount
   * POST /twilio/subaccounts/:accountSid/activate
   */
  @ApiOperation({ summary: 'Activate subaccount', description: 'Activate a suspended subaccount' })
  @ApiResponse({ status: 200, description: 'Subaccount activated successfully' })
  @ApiParam({ name: 'accountSid', description: 'Twilio Account SID', example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post(':accountSid/activate')
  async activateSubaccount(@Param('accountSid') accountSid: string) {
    try {
      const subaccount = await this.subaccountHelper.activateSubaccount(accountSid);
      return {
        success: true,
        data: subaccount,
        message: 'Subaccount activated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to activate subaccount',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Close a subaccount
   * POST /twilio/subaccounts/:accountSid/close
   */
  @ApiOperation({ summary: 'Close subaccount', description: 'Permanently close a subaccount (cannot be undone)' })
  @ApiResponse({ status: 200, description: 'Subaccount closed successfully' })
  @ApiParam({ name: 'accountSid', description: 'Twilio Account SID', example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post(':accountSid/close')
  async closeSubaccount(@Param('accountSid') accountSid: string) {
    try {
      const subaccount = await this.subaccountHelper.closeSubaccount(accountSid);
      return {
        success: true,
        data: subaccount,
        message: 'Subaccount closed successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to close subaccount',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Transfer a phone number between accounts
   * POST /twilio/subaccounts/transfer-phone-number
   */
  @ApiOperation({ summary: 'Transfer phone number', description: 'Transfer a phone number from one account to another' })
  @ApiResponse({ status: 200, description: 'Phone number transferred successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - phoneNumberSid and targetAccountSid are required' })
  @Post('transfer-phone-number')
  async transferPhoneNumber(@Body() transferDto: TransferPhoneNumberDto) {
    try {
      const phoneNumber = await this.subaccountHelper.transferPhoneNumber(
        transferDto.phoneNumberSid,
        transferDto.targetAccountSid,
      );
      return {
        success: true,
        data: phoneNumber,
        message: 'Phone number transferred successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to transfer phone number',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
