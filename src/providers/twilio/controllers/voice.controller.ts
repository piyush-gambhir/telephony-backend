import {
  Body,
  Controller,
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
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { VoiceHelper } from '../helpers/voice.helper';

export class CreateCallDto {
  @ApiProperty({ description: 'Recipient phone number (E.164 format)', example: '+1234567890' })
  @IsNotEmpty({ message: 'Recipient phone number (to) is required' })
  @IsString({ message: 'Recipient phone number must be a string' })
  to: string;

  @ApiProperty({ description: 'Sender phone number (E.164 format)', example: '+15551234567' })
  @IsNotEmpty({ message: 'Sender phone number (from) is required' })
  @IsString({ message: 'Sender phone number must be a string' })
  from: string;

  @ApiPropertyOptional({
    description: 'URL that returns TwiML instructions for the call',
    example: 'http://demo.twilio.com/docs/voice.xml',
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL must be a valid URL' })
  url?: string;

  @ApiPropertyOptional({
    description: 'TwiML instructions for the call (alternative to url)',
    example: '<Response><Say>Hello</Say></Response>',
  })
  @IsOptional()
  @IsString({ message: 'TwiML must be a string' })
  twiml?: string;

  @ApiPropertyOptional({
    description: 'Webhook URL for call status updates',
    example: 'https://example.com/callback',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Status callback must be a valid URL' })
  statusCallback?: string;

  @ApiPropertyOptional({
    description: 'Events to trigger status callback',
    type: [String],
    example: ['initiated', 'ringing', 'answered'],
  })
  @IsOptional()
  @IsArray({ message: 'Status callback events must be an array' })
  @IsString({ each: true, message: 'Each status callback event must be a string' })
  statusCallbackEvent?: string[];

  @ApiPropertyOptional({
    description: 'HTTP method for status callback',
    enum: ['GET', 'POST'],
    example: 'POST',
  })
  @IsOptional()
  @IsEnum(['GET', 'POST'], { message: 'Status callback method must be either GET or POST' })
  statusCallbackMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'Whether to record the call', example: true, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Record must be a boolean' })
  record?: boolean;

  @ApiPropertyOptional({
    description: 'Webhook URL for recording status updates',
    example: 'https://example.com/recording-callback',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Recording status callback must be a valid URL' })
  recordingStatusCallback?: string;

  @ApiPropertyOptional({
    description: 'Recording channels',
    enum: ['mono', 'dual'],
    example: 'mono',
  })
  @IsOptional()
  @IsEnum(['mono', 'dual'], { message: 'Recording channels must be either mono or dual' })
  recordingChannels?: 'mono' | 'dual';

  @ApiPropertyOptional({
    description: 'HTTP method for recording status callback',
    enum: ['GET', 'POST'],
    example: 'POST',
  })
  @IsOptional()
  @IsEnum(['GET', 'POST'], {
    message: 'Recording status callback method must be either GET or POST',
  })
  recordingStatusCallbackMethod?: 'GET' | 'POST';
}

export class UpdateCallDto {
  @ApiPropertyOptional({
    description: 'Call status to update to',
    enum: ['canceled', 'completed'],
    example: 'completed',
  })
  @IsOptional()
  @IsEnum(['canceled', 'completed'], { message: 'Status must be either canceled or completed' })
  status?: 'canceled' | 'completed';

  @ApiPropertyOptional({
    description: 'URL that returns TwiML instructions',
    example: 'http://demo.twilio.com/docs/voice.xml',
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL must be a valid URL' })
  url?: string;

  @ApiPropertyOptional({
    description: 'TwiML instructions for the call',
    example: '<Response><Say>Goodbye</Say></Response>',
  })
  @IsOptional()
  @IsString({ message: 'TwiML must be a string' })
  twiml?: string;
}

export class ListCallsDto {
  @ApiPropertyOptional({ description: 'Filter by recipient phone number', example: '+1234567890' })
  @IsOptional()
  @IsString({ message: 'Recipient phone number must be a string' })
  to?: string;

  @ApiPropertyOptional({ description: 'Filter by sender phone number', example: '+15551234567' })
  @IsOptional()
  @IsString({ message: 'Sender phone number must be a string' })
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter by call status',
    enum: [
      'queued',
      'ringing',
      'in-progress',
      'completed',
      'busy',
      'failed',
      'no-answer',
      'canceled',
    ],
    example: 'completed',
  })
  @IsOptional()
  @IsEnum(
    ['queued', 'ringing', 'in-progress', 'completed', 'busy', 'failed', 'no-answer', 'canceled'],
    { message: 'Invalid call status' },
  )
  status?:
    | 'queued'
    | 'ringing'
    | 'in-progress'
    | 'completed'
    | 'busy'
    | 'failed'
    | 'no-answer'
    | 'canceled';

  @ApiPropertyOptional({
    description: 'Filter calls started before this date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString({ message: 'Start time before must be a string' })
  startTimeBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter calls started after this date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString({ message: 'Start time after must be a string' })
  startTimeAfter?: string;

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

@ApiTags('Twilio - Voice')
@Controller('twilio/voice')
export class VoiceController {
  constructor(private readonly voiceHelper: VoiceHelper) {}

  /**
   * Create a new outbound call
   * POST /twilio/voice/calls
   */
  @ApiOperation({
    summary: 'Create outbound call',
    description: 'Initiate a new outbound voice call using Twilio Programmable Voice',
  })
  @ApiResponse({ status: 201, description: 'Call created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - missing required fields' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('calls')
  async createCall(@Body() createDto: CreateCallDto) {
    if (!createDto.url && !createDto.twiml) {
      throw new HttpException(
        {
          success: false,
          message: 'Either url or twiml must be provided',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.voiceHelper.createCall(createDto);
      return {
        success: true,
        data: result,
        message: 'Call created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create call',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch a specific call by SID
   * GET /twilio/voice/calls/:callSid
   */
  @ApiOperation({
    summary: 'Get call by SID',
    description: 'Retrieve details of a specific voice call by its SID',
  })
  @ApiResponse({ status: 200, description: 'Call retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  @ApiParam({
    name: 'callSid',
    description: 'Twilio Call SID',
    example: 'CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('calls/:callSid')
  async getCall(@Param('callSid') callSid: string) {
    try {
      const result = await this.voiceHelper.fetchCall(callSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch call',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List calls with optional filtering
   * GET /twilio/voice/calls?status=completed&limit=10
   */
  @ApiOperation({
    summary: 'List calls',
    description: 'Retrieve a list of voice calls with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Calls retrieved successfully' })
  @ApiQuery({ name: 'to', required: false, description: 'Filter by recipient phone number' })
  @ApiQuery({ name: 'from', required: false, description: 'Filter by sender phone number' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by call status' })
  @ApiQuery({
    name: 'startTimeBefore',
    required: false,
    description: 'Filter calls started before this date',
  })
  @ApiQuery({
    name: 'startTimeAfter',
    required: false,
    description: 'Filter calls started after this date',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results',
    type: Number,
  })
  @Get('calls')
  async listCalls(@Query() query: ListCallsDto) {
    try {
      const params = {
        to: query.to,
        from: query.from,
        status: query.status,
        startTimeBefore: query.startTimeBefore ? new Date(query.startTimeBefore) : undefined,
        startTimeAfter: query.startTimeAfter ? new Date(query.startTimeAfter) : undefined,
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.voiceHelper.listCalls(params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list calls',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update an ongoing call
   * PUT /twilio/voice/calls/:callSid
   */
  @ApiOperation({
    summary: 'Update call',
    description: 'Update an active call (cancel, complete, or redirect)',
  })
  @ApiResponse({ status: 200, description: 'Call updated successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  @ApiParam({
    name: 'callSid',
    description: 'Twilio Call SID',
    example: 'CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Put('calls/:callSid')
  async updateCall(@Param('callSid') callSid: string, @Body() updateDto: UpdateCallDto) {
    try {
      const result = await this.voiceHelper.updateCall(callSid, updateDto);
      return {
        success: true,
        data: result,
        message: 'Call updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update call',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Hang up/complete a call
   * POST /twilio/voice/calls/:callSid/hangup
   */
  @ApiOperation({ summary: 'Hang up call', description: 'Terminate an active voice call' })
  @ApiResponse({ status: 200, description: 'Call hung up successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  @ApiParam({
    name: 'callSid',
    description: 'Twilio Call SID',
    example: 'CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Post('calls/:callSid/hangup')
  async hangupCall(@Param('callSid') callSid: string) {
    try {
      const result = await this.voiceHelper.hangupCall(callSid);
      return {
        success: true,
        data: result,
        message: 'Call hung up successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to hang up call',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get call duration
   * GET /twilio/voice/calls/:callSid/duration
   */
  @ApiOperation({
    summary: 'Get call duration',
    description: 'Retrieve the duration of a completed call in seconds',
  })
  @ApiResponse({ status: 200, description: 'Call duration retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  @ApiParam({
    name: 'callSid',
    description: 'Twilio Call SID',
    example: 'CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('calls/:callSid/duration')
  async getCallDuration(@Param('callSid') callSid: string) {
    try {
      const duration = await this.voiceHelper.getCallDuration(callSid);
      return {
        success: true,
        data: {
          callSid,
          duration: duration,
          unit: 'seconds',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get call duration',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List recordings for a specific call
   * GET /twilio/voice/calls/:callSid/recordings
   */
  @ApiOperation({
    summary: 'List call recordings',
    description: 'Retrieve all recordings associated with a specific call',
  })
  @ApiResponse({ status: 200, description: 'Recordings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  @ApiParam({
    name: 'callSid',
    description: 'Twilio Call SID',
    example: 'CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('calls/:callSid/recordings')
  async listCallRecordings(@Param('callSid') callSid: string) {
    try {
      const result = await this.voiceHelper.listCallRecordings(callSid);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list call recordings',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
