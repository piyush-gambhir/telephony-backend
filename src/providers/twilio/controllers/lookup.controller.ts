import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { LookupHelper } from '../helpers/lookup.helper';

export class LookupPhoneDto {
  @ApiProperty({ description: 'Phone number to lookup (E.164 format)', example: '+1234567890' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'ISO country code (e.g., US, GB)', example: 'US' })
  @IsOptional()
  @IsString({ message: 'Country code must be a string' })
  countryCode?: string;
}

@ApiTags('Twilio - Lookup')
@Controller('twilio/lookup')
export class LookupController {
  constructor(private readonly lookupHelper: LookupHelper) {}

  /**
   * Look up phone number information
   * GET /twilio/lookup?phoneNumber=+1234567890&countryCode=US
   */
  @ApiOperation({ summary: 'Lookup phone number', description: 'Retrieve carrier and caller information for a phone number' })
  @ApiResponse({ status: 200, description: 'Phone number information retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - phoneNumber is required' })
  @ApiQuery({ name: 'phoneNumber', required: true, description: 'Phone number to lookup (E.164 format)', example: '+1234567890' })
  @ApiQuery({ name: 'countryCode', required: false, description: 'ISO country code (e.g., US, GB)', example: 'US' })
  @Get()
  async lookupPhoneNumber(@Query() query: LookupPhoneDto) {
    try {
      const result = await this.lookupHelper.lookupPhoneNumber(query.phoneNumber, {
        countryCode: query.countryCode,
        type: 'carrier',
      });
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to lookup phone number',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Validate if a phone number is valid
   * GET /twilio/lookup/validate?phoneNumber=+1234567890&countryCode=US
   */
  @ApiOperation({ summary: 'Validate phone number', description: 'Check if a phone number is valid and properly formatted' })
  @ApiResponse({ status: 200, description: 'Phone number validation completed' })
  @ApiResponse({ status: 400, description: 'Bad request - phoneNumber is required' })
  @ApiQuery({ name: 'phoneNumber', required: true, description: 'Phone number to validate (E.164 format)', example: '+1234567890' })
  @ApiQuery({ name: 'countryCode', required: false, description: 'ISO country code (e.g., US, GB)', example: 'US' })
  @Get('validate')
  async validatePhoneNumber(@Query() query: LookupPhoneDto) {
    try {
      const isValid = await this.lookupHelper.validatePhoneNumber(query.phoneNumber, query.countryCode);
      return {
        success: true,
        data: {
          phoneNumber: query.phoneNumber,
          isValid,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to validate phone number',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get line type information for a phone number
   * GET /twilio/lookup/line-type?phoneNumber=+1234567890&countryCode=US
   */
  @ApiOperation({ summary: 'Get line type', description: 'Determine the line type of a phone number (mobile, landline, voip, etc.)' })
  @ApiResponse({ status: 200, description: 'Line type information retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - phoneNumber is required' })
  @ApiQuery({ name: 'phoneNumber', required: true, description: 'Phone number to check (E.164 format)', example: '+1234567890' })
  @ApiQuery({ name: 'countryCode', required: false, description: 'ISO country code (e.g., US, GB)', example: 'US' })
  @Get('line-type')
  async getLineType(@Query() query: LookupPhoneDto) {
    try {
      const lineType = await this.lookupHelper.getLineType(query.phoneNumber, query.countryCode);
      return {
        success: true,
        data: {
          phoneNumber: query.phoneNumber,
          lineType,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get line type information',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
