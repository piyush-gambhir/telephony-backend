import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { SmsHelper } from '../helpers/sms.helper';

export class SendSmsDto {
  @ApiProperty({ description: 'Recipient phone number (E.164 format)', example: '+1234567890' })
  @IsNotEmpty({ message: 'Recipient phone number (to) is required' })
  @IsString({ message: 'Recipient phone number must be a string' })
  to: string;

  @ApiProperty({
    description: 'Sender phone number or messaging service SID',
    example: '+15551234567',
  })
  @IsNotEmpty({ message: 'Sender phone number or SID (from) is required' })
  @IsString({ message: 'Sender must be a string' })
  from: string;

  @ApiPropertyOptional({
    description: 'SMS message body (max 1600 characters)',
    example: 'Hello from Twilio!',
  })
  @IsOptional()
  @IsString({ message: 'Message body must be a string' })
  @MaxLength(1600, { message: 'Message body cannot exceed 1600 characters' })
  body?: string;

  @ApiPropertyOptional({
    description: 'URL(s) for MMS media attachments',
    example: 'https://example.com/image.jpg',
    type: [String],
  })
  @IsOptional()
  @Type(() => String)
  mediaUrl?: string | string[];

  @ApiPropertyOptional({
    description: 'Webhook URL for delivery status callbacks',
    example: 'https://example.com/callback',
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
    description: 'Maximum price in USD for message delivery',
    example: 0.05,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Max price must be a number' })
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Whether to provide delivery feedback',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  provideFeedback?: boolean;
}

export class ListSmsDto {
  @ApiPropertyOptional({ description: 'Filter by recipient phone number', example: '+1234567890' })
  @IsOptional()
  @IsString({ message: 'Recipient phone number must be a string' })
  to?: string;

  @ApiPropertyOptional({ description: 'Filter by sender phone number', example: '+15551234567' })
  @IsOptional()
  @IsString({ message: 'Sender phone number must be a string' })
  from?: string;

  @ApiPropertyOptional({ description: 'Filter by date sent', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsString({ message: 'Date sent must be a string' })
  dateSent?: string;

  @ApiPropertyOptional({
    description: 'Filter messages sent before this date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString({ message: 'Date sent before must be a string' })
  dateSentBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter messages sent after this date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString({ message: 'Date sent after must be a string' })
  dateSentAfter?: string;

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

export class EstimateSegmentsDto {
  @ApiProperty({
    description: 'SMS message text to estimate segments for',
    example: 'Hello from Twilio!',
  })
  @IsNotEmpty({ message: 'Text is required' })
  @IsString({ message: 'Text must be a string' })
  text: string;
}

@ApiTags('Twilio - SMS')
@Controller('twilio/sms')
export class SmsController {
  constructor(private readonly smsHelper: SmsHelper) {}

  /**
   * Send an SMS or MMS message
   * POST /twilio/sms/send
   */
  @ApiOperation({
    summary: 'Send SMS/MMS message',
    description: 'Send an SMS or MMS message using Twilio Programmable Messaging',
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
        message: { type: 'string', example: 'Message sent successfully' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - missing required fields' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('send')
  async sendMessage(@Body() sendDto: SendSmsDto) {
    try {
      const result = await this.smsHelper.sendMessage(sendDto);
      return {
        success: true,
        data: result,
        message: 'SMS sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send SMS',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch a specific message by SID
   * GET /twilio/sms/:messageSid
   */
  @ApiOperation({
    summary: 'Get SMS message by SID',
    description: 'Retrieve details of a specific SMS message by its SID',
  })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true }, data: { type: 'object' } },
    },
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiParam({
    name: 'messageSid',
    description: 'Twilio Message SID',
    example: 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get(':messageSid')
  async getMessage(@Param('messageSid') messageSid: string) {
    try {
      const result = await this.smsHelper.fetchMessage(messageSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch message',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List messages with optional filtering
   * GET /twilio/sms?to=+1234567890&from=+0987654321&limit=10
   */
  @Get()
  async listMessages(@Query() query: ListSmsDto) {
    try {
      const params = {
        to: query.to,
        from: query.from,
        dateSent: query.dateSent ? new Date(query.dateSent) : undefined,
        dateSentBefore: query.dateSentBefore ? new Date(query.dateSentBefore) : undefined,
        dateSentAfter: query.dateSentAfter ? new Date(query.dateSentAfter) : undefined,
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.smsHelper.listMessages(params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list messages',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a message by SID
   * DELETE /twilio/sms/:messageSid
   */
  @Delete(':messageSid')
  async deleteMessage(@Param('messageSid') messageSid: string) {
    try {
      const result = await this.smsHelper.deleteMessage(messageSid);
      return {
        success: true,
        message: 'Message deleted successfully',
        data: { deleted: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete message',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Estimate SMS segment count
   * POST /twilio/sms/estimate-segments
   */
  @Post('estimate-segments')
  async estimateSegments(@Body() body: EstimateSegmentsDto) {
    try {
      const segments = this.smsHelper.estimateSegments(body.text);
      return {
        success: true,
        data: {
          text: body.text,
          segments: segments,
          length: body.text.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to estimate segments',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
