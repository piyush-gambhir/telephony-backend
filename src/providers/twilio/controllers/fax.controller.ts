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
  IsNumber,
  IsBoolean,
  IsUrl,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FaxHelper } from '../helpers/fax.helper';

export class SendFaxDto {
  @ApiProperty({ description: 'Recipient fax number (E.164 format)', example: '+1234567890' })
  to: string;

  @ApiProperty({ description: 'Sender fax number (E.164 format)', example: '+15551234567' })
  from: string;

  @ApiProperty({ description: 'URL of the document to fax', example: 'https://example.com/document.pdf' })
  mediaUrl: string;

  @ApiPropertyOptional({ description: 'Fax quality', enum: ['standard', 'fine'], example: 'standard' })
  quality?: 'standard' | 'fine';

  @ApiPropertyOptional({ description: 'Status callback URL', example: 'https://example.com/callback' })
  statusCallback?: string;

  @ApiPropertyOptional({ description: 'HTTP method for status callback', enum: ['GET', 'POST'], example: 'POST' })
  statusCallbackMethod?: 'GET' | 'POST';

  @ApiPropertyOptional({ description: 'Store media for later retrieval', example: true, type: Boolean })
  storeMedia?: boolean;

  @ApiPropertyOptional({ description: 'Time to live in seconds', example: 3600, type: Number })
  ttl?: number;
}

@ApiTags('Twilio - Fax')
@Controller('twilio/fax')
export class FaxController {
  constructor(private readonly faxHelper: FaxHelper) {}

  /**
   * Send a fax
   * POST /twilio/fax/send
   * @deprecated Twilio Fax API is deprecated
   */
  @ApiOperation({ summary: 'Send fax', description: 'Send a fax document (Twilio Fax API is deprecated)' })
  @ApiResponse({ status: 201, description: 'Fax sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - to, from, and mediaUrl are required' })
  @Post('send')
  async sendFax(@Body() sendDto: SendFaxDto) {
    if (!sendDto.to || !sendDto.from || !sendDto.mediaUrl) {
      throw new HttpException(
        {
          success: false,
          message: 'to, from, and mediaUrl are required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.faxHelper.sendFax(sendDto);
      return {
        success: true,
        data: result,
        message: 'Fax sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send fax',
          error: error.message,
          note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get a fax by SID
   * GET /twilio/fax/:faxSid
   * @deprecated Twilio Fax API is deprecated
   */
  @ApiOperation({ summary: 'Get fax by SID', description: 'Retrieve details of a specific fax (Twilio Fax API is deprecated)' })
  @ApiResponse({ status: 200, description: 'Fax retrieved successfully' })
  @ApiParam({ name: 'faxSid', description: 'Twilio Fax SID', example: 'FExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get(':faxSid')
  async getFax(@Param('faxSid') faxSid: string) {
    try {
      const result = await this.faxHelper.fetchFax(faxSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch fax',
          error: error.message,
          note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * List faxes
   * GET /twilio/fax
   * @deprecated Twilio Fax API is deprecated
   */
  @ApiOperation({ summary: 'List faxes', description: 'Retrieve a list of faxes with optional filtering (Twilio Fax API is deprecated)' })
  @ApiResponse({ status: 200, description: 'Faxes retrieved successfully' })
  @ApiQuery({ name: 'to', required: false, description: 'Filter by recipient fax number' })
  @ApiQuery({ name: 'from', required: false, description: 'Filter by sender fax number' })
  @ApiQuery({ name: 'dateCreatedOnOrBefore', required: false, description: 'Filter faxes created on or before this date' })
  @ApiQuery({ name: 'dateCreatedAfter', required: false, description: 'Filter faxes created after this date' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get()
  async listFaxes(
    @Query('to') to?: string,
    @Query('from') from?: string,
    @Query('dateCreatedOnOrBefore') dateCreatedOnOrBefore?: string,
    @Query('dateCreatedAfter') dateCreatedAfter?: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const params = {
        to,
        from,
        dateCreatedOnOrBefore: dateCreatedOnOrBefore ? new Date(dateCreatedOnOrBefore) : undefined,
        dateCreatedAfter: dateCreatedAfter ? new Date(dateCreatedAfter) : undefined,
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
      };

      const result = await this.faxHelper.listFaxes(params);
      return {
        success: true,
        data: result,
        count: result.length,
        note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list faxes',
          error: error.message,
          note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Update a fax
   * PUT /twilio/fax/:faxSid
   * @deprecated Twilio Fax API is deprecated
   */
  @ApiOperation({ summary: 'Update fax', description: 'Update a fax status (Twilio Fax API is deprecated)' })
  @ApiResponse({ status: 200, description: 'Fax updated successfully' })
  @ApiParam({ name: 'faxSid', description: 'Twilio Fax SID', example: 'FExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Put(':faxSid')
  async updateFax(
    @Param('faxSid') faxSid: string,
    @Body() updateDto: { status: 'canceled' },
  ) {
    try {
      const result = await this.faxHelper.updateFax(faxSid, updateDto.status);
      return {
        success: true,
        data: result,
        message: 'Fax updated successfully',
        note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update fax',
          error: error.message,
          note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Cancel a fax
   * POST /twilio/fax/:faxSid/cancel
   * @deprecated Twilio Fax API is deprecated
   */
  @ApiOperation({ summary: 'Cancel fax', description: 'Cancel a pending fax (Twilio Fax API is deprecated)' })
  @ApiResponse({ status: 200, description: 'Fax cancelled successfully' })
  @ApiParam({ name: 'faxSid', description: 'Twilio Fax SID', example: 'FExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post(':faxSid/cancel')
  async cancelFax(@Param('faxSid') faxSid: string) {
    try {
      const result = await this.faxHelper.cancelFax(faxSid);
      return {
        success: true,
        data: result,
        message: 'Fax cancelled successfully',
        note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to cancel fax',
          error: error.message,
          note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete a fax
   * DELETE /twilio/fax/:faxSid
   * @deprecated Twilio Fax API is deprecated
   */
  @ApiOperation({ summary: 'Delete fax', description: 'Permanently delete a fax (Twilio Fax API is deprecated)' })
  @ApiResponse({ status: 200, description: 'Fax deleted successfully' })
  @ApiParam({ name: 'faxSid', description: 'Twilio Fax SID', example: 'FExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Delete(':faxSid')
  async deleteFax(@Param('faxSid') faxSid: string) {
    try {
      const result = await this.faxHelper.deleteFax(faxSid);
      return {
        success: true,
        message: 'Fax deleted successfully',
        data: { deleted: result },
        note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete fax',
          error: error.message,
          note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get fax media URL
   * GET /twilio/fax/:faxSid/media
   * @deprecated Twilio Fax API is deprecated
   */
  @ApiOperation({ summary: 'Get fax media URL', description: 'Retrieve the media URL for a fax document (Twilio Fax API is deprecated)' })
  @ApiResponse({ status: 200, description: 'Fax media URL retrieved successfully' })
  @ApiParam({ name: 'faxSid', description: 'Twilio Fax SID', example: 'FExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get(':faxSid/media')
  async getFaxMedia(@Param('faxSid') faxSid: string) {
    try {
      const mediaUrl = await this.faxHelper.getFaxMediaUrl(faxSid);
      return {
        success: true,
        data: { mediaUrl },
        note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get fax media',
          error: error.message,
          note: 'Twilio Fax API is deprecated. Consider using alternative fax solutions.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
