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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ProxyHelper } from '../helpers/proxy.helper';

export class CreateSessionDto {
  @ApiProperty({ description: 'Proxy Service SID', example: 'KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsNotEmpty({ message: 'Service SID is required' })
  @IsString({ message: 'Service SID must be a string' })
  serviceSid: string;

  @ApiPropertyOptional({ description: 'Unique name for the session', example: 'session-123' })
  @IsOptional()
  @IsString({ message: 'Unique name must be a string' })
  uniqueName?: string;

  @ApiPropertyOptional({ description: 'Time to live in seconds', example: 3600, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'TTL must be a number' })
  ttl?: number;

  @ApiPropertyOptional({
    description: 'Session mode',
    enum: ['voice-only', 'message-only', 'voice-and-message'],
    example: 'voice-and-message',
  })
  @IsOptional()
  @IsEnum(['voice-only', 'message-only', 'voice-and-message'], {
    message: 'Mode must be voice-only, message-only, or voice-and-message',
  })
  mode?: 'voice-only' | 'message-only' | 'voice-and-message';

  @ApiPropertyOptional({
    description: 'Status callback URL',
    example: 'https://example.com/callback',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Status callback must be a valid URL' })
  statusCallback?: string;

  @ApiPropertyOptional({ description: 'Initial participants', type: 'array' })
  @IsOptional()
  @IsArray({ message: 'Participants must be an array' })
  participants?: Array<{
    identifier: string;
    friendlyName?: string;
  }>;
}

export class GetSessionDto {
  @ApiProperty({ description: 'Proxy Service SID', example: 'KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsString({ message: 'Service SID must be a string' })
  serviceSid: string;
}

@ApiTags('Twilio - Proxy')
@Controller('twilio/proxy')
export class ProxyController {
  constructor(private readonly proxyHelper: ProxyHelper) {}

  /**
   * Create a proxy session
   * POST /twilio/proxy/sessions
   */
  @ApiOperation({
    summary: 'Create proxy session',
    description: 'Create a new proxy session for phone number masking',
  })
  @ApiResponse({ status: 201, description: 'Proxy session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - serviceSid is required' })
  @Post('sessions')
  async createSession(@Body() createDto: CreateSessionDto) {
    try {
      const result = await this.proxyHelper.createSession(createDto.serviceSid, {
        uniqueName: createDto.uniqueName,
        ttl: createDto.ttl,
        mode: createDto.mode,
        statusCallback: createDto.statusCallback,
        participants: createDto.participants,
      });
      return {
        success: true,
        data: result,
        message: 'Proxy session created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create proxy session',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a proxy session
   * GET /twilio/proxy/sessions/:sessionSid
   */
  @ApiOperation({
    summary: 'Get proxy session',
    description: 'Retrieve details of a specific proxy session',
  })
  @ApiResponse({ status: 200, description: 'Proxy session retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - serviceSid is required' })
  @ApiResponse({ status: 404, description: 'Proxy session not found' })
  @ApiParam({
    name: 'sessionSid',
    description: 'Twilio Session SID',
    example: 'KCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiQuery({
    name: 'serviceSid',
    required: true,
    description: 'Proxy Service SID',
    example: 'KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('sessions/:sessionSid')
  async getSession(@Param('sessionSid') sessionSid: string, @Query() query: GetSessionDto) {
    try {
      const result = await this.proxyHelper.fetchSession(query.serviceSid, sessionSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch proxy session',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List proxy sessions
   * GET /twilio/proxy/sessions
   */
  @ApiOperation({
    summary: 'List proxy sessions',
    description: 'Retrieve all proxy sessions for a service',
  })
  @ApiResponse({ status: 200, description: 'Proxy sessions retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - serviceSid is required' })
  @ApiQuery({
    name: 'serviceSid',
    required: true,
    description: 'Proxy Service SID',
    example: 'KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results',
    type: Number,
  })
  @Get('sessions')
  async listSessions(@Query() query: { serviceSid?: string; limit?: number }) {
    if (!query.serviceSid) {
      throw new HttpException(
        {
          success: false,
          message: 'serviceSid query parameter is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.proxyHelper.listSessions(query.serviceSid);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list proxy sessions',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a proxy session
   * POST /twilio/proxy/sessions/:sessionSid
   */
  @ApiOperation({
    summary: 'Update proxy session',
    description: 'Update a proxy session configuration',
  })
  @ApiResponse({ status: 200, description: 'Proxy session updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - serviceSid is required' })
  @ApiParam({
    name: 'sessionSid',
    description: 'Twilio Session SID',
    example: 'KCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiQuery({
    name: 'serviceSid',
    required: true,
    description: 'Proxy Service SID',
    example: 'KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Post('sessions/:sessionSid')
  async updateSession(
    @Param('sessionSid') sessionSid: string,
    @Query('serviceSid') serviceSid: string,
    @Body() updateDto: any,
  ) {
    if (!serviceSid) {
      throw new HttpException(
        {
          success: false,
          message: 'serviceSid query parameter is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.proxyHelper.updateSession(serviceSid, sessionSid, updateDto);
      return {
        success: true,
        data: result,
        message: 'Proxy session updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update proxy session',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a proxy session
   * DELETE /twilio/proxy/sessions/:sessionSid
   */
  @ApiOperation({
    summary: 'Delete proxy session',
    description: 'Permanently delete a proxy session',
  })
  @ApiResponse({ status: 200, description: 'Proxy session deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - serviceSid is required' })
  @ApiParam({
    name: 'sessionSid',
    description: 'Twilio Session SID',
    example: 'KCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiQuery({
    name: 'serviceSid',
    required: true,
    description: 'Proxy Service SID',
    example: 'KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Delete('sessions/:sessionSid')
  async deleteSession(
    @Param('sessionSid') sessionSid: string,
    @Query('serviceSid') serviceSid: string,
  ) {
    if (!serviceSid) {
      throw new HttpException(
        {
          success: false,
          message: 'serviceSid query parameter is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.proxyHelper.deleteSession(serviceSid, sessionSid);
      return {
        success: true,
        message: 'Proxy session deleted successfully',
        data: { deleted: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete proxy session',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Add a participant to a proxy session
   * POST /twilio/proxy/sessions/:sessionSid/participants
   */
  @ApiOperation({
    summary: 'Add participant to session',
    description: 'Add a participant to a proxy session',
  })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - serviceSid is required' })
  @ApiParam({
    name: 'sessionSid',
    description: 'Twilio Session SID',
    example: 'KCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiQuery({
    name: 'serviceSid',
    required: true,
    description: 'Proxy Service SID',
    example: 'KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Post('sessions/:sessionSid/participants')
  async addParticipant(
    @Param('sessionSid') sessionSid: string,
    @Query('serviceSid') serviceSid: string,
    @Body()
    participantDto: {
      identifier: string;
      proxyIdentifier?: string;
      friendlyName?: string;
    },
  ) {
    if (!serviceSid) {
      throw new HttpException(
        {
          success: false,
          message: 'serviceSid query parameter is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.proxyHelper.addParticipant(serviceSid, sessionSid, participantDto);
      return {
        success: true,
        data: result,
        message: 'Participant added to proxy session successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to add participant to proxy session',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List participants in a proxy session
   * GET /twilio/proxy/sessions/:sessionSid/participants
   */
  @ApiOperation({
    summary: 'List session participants',
    description: 'Retrieve all participants in a proxy session',
  })
  @ApiResponse({ status: 200, description: 'Participants retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - serviceSid is required' })
  @ApiParam({
    name: 'sessionSid',
    description: 'Twilio Session SID',
    example: 'KCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiQuery({
    name: 'serviceSid',
    required: true,
    description: 'Proxy Service SID',
    example: 'KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Get('sessions/:sessionSid/participants')
  async listParticipants(
    @Param('sessionSid') sessionSid: string,
    @Query('serviceSid') serviceSid: string,
  ) {
    if (!serviceSid) {
      throw new HttpException(
        {
          success: false,
          message: 'serviceSid query parameter is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.proxyHelper.listParticipants(serviceSid, sessionSid);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list participants in proxy session',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Remove a participant from a proxy session
   * DELETE /twilio/proxy/sessions/:sessionSid/participants/:participantSid
   */
  @ApiOperation({
    summary: 'Remove participant from session',
    description: 'Remove a participant from a proxy session',
  })
  @ApiResponse({ status: 200, description: 'Participant removed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - serviceSid is required' })
  @ApiParam({
    name: 'sessionSid',
    description: 'Twilio Session SID',
    example: 'KCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'participantSid',
    description: 'Twilio Participant SID',
    example: 'KPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiQuery({
    name: 'serviceSid',
    required: true,
    description: 'Proxy Service SID',
    example: 'KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Delete('sessions/:sessionSid/participants/:participantSid')
  async removeParticipant(
    @Param('sessionSid') sessionSid: string,
    @Param('participantSid') participantSid: string,
    @Query('serviceSid') serviceSid: string,
  ) {
    if (!serviceSid) {
      throw new HttpException(
        {
          success: false,
          message: 'serviceSid query parameter is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.proxyHelper.removeParticipant(
        serviceSid,
        sessionSid,
        participantSid,
      );
      return {
        success: true,
        message: 'Participant removed from proxy session successfully',
        data: { removed: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to remove participant from proxy session',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
