import {
  Controller,
  Get,
  Post,
  Put,
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
import { StudioHelper } from '../helpers/studio.helper';

export class ExecuteFlowDto {
  @ApiProperty({ description: 'Recipient phone number (E.164 format)', example: '+1234567890' })
  to: string;

  @ApiProperty({ description: 'Sender phone number (E.164 format)', example: '+15551234567' })
  from: string;

  @ApiPropertyOptional({ description: 'Flow execution parameters' })
  parameters?: Record<string, any>;
}

@ApiTags('Twilio - Studio')
@Controller('twilio/studio')
export class StudioController {
  constructor(private readonly studioHelper: StudioHelper) {}

  /**
   * Execute a Studio flow
   * POST /twilio/studio/flows/:flowSid/executions
   */
  @ApiOperation({ summary: 'Execute Studio flow', description: 'Execute a Twilio Studio flow with the specified parameters' })
  @ApiResponse({ status: 201, description: 'Studio flow executed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - to and from are required' })
  @ApiParam({ name: 'flowSid', description: 'Twilio Studio Flow SID', example: 'FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post('flows/:flowSid/executions')
  async executeFlow(@Param('flowSid') flowSid: string, @Body() executeDto: ExecuteFlowDto) {
    if (!executeDto.to || !executeDto.from) {
      throw new HttpException(
        {
          success: false,
          message: 'to and from are required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.studioHelper.executeFlow(flowSid, executeDto);
      return {
        success: true,
        data: result,
        message: 'Studio flow executed successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to execute Studio flow',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a flow execution
   * GET /twilio/studio/flows/:flowSid/executions/:executionSid
   */
  @ApiOperation({ summary: 'Get flow execution', description: 'Retrieve details of a specific Studio flow execution' })
  @ApiResponse({ status: 200, description: 'Flow execution retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Flow execution not found' })
  @ApiParam({ name: 'flowSid', description: 'Twilio Studio Flow SID', example: 'FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiParam({ name: 'executionSid', description: 'Twilio Execution SID', example: 'FNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('flows/:flowSid/executions/:executionSid')
  async getExecution(@Param('flowSid') flowSid: string, @Param('executionSid') executionSid: string) {
    try {
      const result = await this.studioHelper.fetchExecution(flowSid, executionSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch flow execution',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List flow executions
   * GET /twilio/studio/flows/:flowSid/executions
   */
  @ApiOperation({ summary: 'List flow executions', description: 'Retrieve all executions for a Studio flow' })
  @ApiResponse({ status: 200, description: 'Flow executions retrieved successfully' })
  @ApiParam({ name: 'flowSid', description: 'Twilio Studio Flow SID', example: 'FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiQuery({ name: 'dateCreatedFrom', required: false, description: 'Filter executions created from this date' })
  @ApiQuery({ name: 'dateCreatedTo', required: false, description: 'Filter executions created until this date' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get('flows/:flowSid/executions')
  async listExecutions(
    @Param('flowSid') flowSid: string,
    @Query('dateCreatedFrom') dateCreatedFrom?: string,
    @Query('dateCreatedTo') dateCreatedTo?: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const params = {
        dateCreatedFrom: dateCreatedFrom ? new Date(dateCreatedFrom) : undefined,
        dateCreatedTo: dateCreatedTo ? new Date(dateCreatedTo) : undefined,
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
      };

      const result = await this.studioHelper.listExecutions(flowSid, params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list flow executions',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a flow execution
   * PUT /twilio/studio/flows/:flowSid/executions/:executionSid
   */
  @ApiOperation({ summary: 'Update flow execution', description: 'Update the status of a Studio flow execution' })
  @ApiResponse({ status: 200, description: 'Flow execution updated successfully' })
  @ApiParam({ name: 'flowSid', description: 'Twilio Studio Flow SID', example: 'FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiParam({ name: 'executionSid', description: 'Twilio Execution SID', example: 'FNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Put('flows/:flowSid/executions/:executionSid')
  async updateExecution(
    @Param('flowSid') flowSid: string,
    @Param('executionSid') executionSid: string,
    @Body() updateDto: { status: 'ended' },
  ) {
    try {
      const result = await this.studioHelper.updateExecution(flowSid, executionSid, updateDto.status);
      return {
        success: true,
        data: result,
        message: 'Flow execution updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update flow execution',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a Studio flow
   * GET /twilio/studio/flows/:flowSid
   */
  @ApiOperation({ summary: 'Get Studio flow', description: 'Retrieve details of a specific Studio flow' })
  @ApiResponse({ status: 200, description: 'Studio flow retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Studio flow not found' })
  @ApiParam({ name: 'flowSid', description: 'Twilio Studio Flow SID', example: 'FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('flows/:flowSid')
  async getFlow(@Param('flowSid') flowSid: string) {
    try {
      const result = await this.studioHelper.fetchFlow(flowSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch Studio flow',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List Studio flows
   * GET /twilio/studio/flows
   */
  @ApiOperation({ summary: 'List Studio flows', description: 'Retrieve all Studio flows in the account' })
  @ApiResponse({ status: 200, description: 'Studio flows retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get('flows')
  async listFlows(@Query('limit') limit?: number) {
    try {
      const params = {
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
      };

      const result = await this.studioHelper.listFlows(params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list Studio flows',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
