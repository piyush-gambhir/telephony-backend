import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RecordingsHelper } from '../helpers/recordings.helper';

export class ListRecordingsDto {
  @ApiPropertyOptional({ description: 'Filter by Call SID', example: 'CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString({ message: 'Call SID must be a string' })
  callSid?: string;

  @ApiPropertyOptional({ description: 'Maximum number of results', example: 20, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  limit?: number;
}

@ApiTags('Twilio - Recordings')
@Controller('twilio/recordings')
export class RecordingsController {
  constructor(private readonly recordingsHelper: RecordingsHelper) {}

  /**
   * Fetch a specific recording by SID
   * GET /twilio/recordings/:recordingSid
   */
  @ApiOperation({ summary: 'Get recording by SID', description: 'Retrieve details of a specific voice call recording' })
  @ApiResponse({ status: 200, description: 'Recording retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Recording not found' })
  @ApiParam({ name: 'recordingSid', description: 'Twilio Recording SID', example: 'RExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get(':recordingSid')
  async getRecording(@Param('recordingSid') recordingSid: string) {
    try {
      const result = await this.recordingsHelper.fetchRecording(recordingSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch recording',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List recordings with optional filtering
   * GET /twilio/recordings?callSid=CA123&limit=10
   */
  @ApiOperation({ summary: 'List recordings', description: 'Retrieve a list of voice call recordings with optional filtering' })
  @ApiResponse({ status: 200, description: 'Recordings retrieved successfully' })
  @ApiQuery({ name: 'callSid', required: false, description: 'Filter by Call SID', example: 'CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get()
  async listRecordings(@Query() query: ListRecordingsDto) {
    try {
      const params = {
        callSid: query.callSid,
        limit: query.limit,
      };

      const result = await this.recordingsHelper.listRecordings(params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list recordings',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a recording by SID
   * DELETE /twilio/recordings/:recordingSid
   */
  @ApiOperation({ summary: 'Delete recording', description: 'Permanently delete a voice call recording' })
  @ApiResponse({ status: 200, description: 'Recording deleted successfully' })
  @ApiParam({ name: 'recordingSid', description: 'Twilio Recording SID', example: 'RExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Delete(':recordingSid')
  async deleteRecording(@Param('recordingSid') recordingSid: string) {
    try {
      const result = await this.recordingsHelper.deleteRecording(recordingSid);
      return {
        success: true,
        message: 'Recording deleted successfully',
        data: { deleted: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete recording',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get recording metadata (duration, size, etc.)
   * GET /twilio/recordings/:recordingSid/meta
   */
  @ApiOperation({ summary: 'Get recording metadata', description: 'Retrieve metadata for a recording (duration, size, channels, etc.)' })
  @ApiResponse({ status: 200, description: 'Recording metadata retrieved successfully' })
  @ApiParam({ name: 'recordingSid', description: 'Twilio Recording SID', example: 'RExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get(':recordingSid/meta')
  async getRecordingMeta(@Param('recordingSid') recordingSid: string) {
    try {
      const recording = await this.recordingsHelper.fetchRecording(recordingSid);

      // Extract metadata from recording object
      const meta = {
        sid: recording.sid,
        duration: (recording as any).duration,
        size: (recording as any).size,
        channels: (recording as any).channels,
        dateCreated: recording.dateCreated,
        dateUpdated: recording.dateUpdated,
        status: recording.status,
      };

      return {
        success: true,
        data: meta,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get recording metadata',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
