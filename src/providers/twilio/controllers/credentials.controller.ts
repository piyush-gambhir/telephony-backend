import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { CredentialHelper } from '../helpers/credential.helper';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Friendly name for the API key', example: 'My API Key' })
  @IsNotEmpty({ message: 'Friendly name is required' })
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName: string;
}

@ApiTags('Twilio - Credentials')
@Controller('twilio/credentials')
export class CredentialsController {
  constructor(private readonly credentialHelper: CredentialHelper) {}

  /**
   * Create a new API Key
   * POST /twilio/credentials/api-keys
   */
  @ApiOperation({ summary: 'Create API key', description: 'Create a new API key for programmatic access to Twilio' })
  @ApiResponse({ status: 201, description: 'API key created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - friendlyName is required' })
  @Post('api-keys')
  async createApiKey(@Body() body: CreateApiKeyDto) {
    try {
      const result = await this.credentialHelper.createApiKey(body.friendlyName);
      return {
        success: true,
        data: result,
        message: 'API Key created successfully. Save the secret securely!',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create API Key',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List API Keys
   * GET /twilio/credentials/api-keys
   */
  @ApiOperation({ summary: 'List API keys', description: 'Retrieve all API keys for the account' })
  @ApiResponse({ status: 200, description: 'API keys retrieved successfully' })
  @Get('api-keys')
  async listApiKeys() {
    try {
      const result = await this.credentialHelper.listApiKeys();
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list API Keys',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific API Key
   * GET /twilio/credentials/api-keys/:sid
   */
  @ApiOperation({ summary: 'Get API key by SID', description: 'Retrieve details of a specific API key' })
  @ApiResponse({ status: 200, description: 'API key retrieved successfully' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiParam({ name: 'sid', description: 'Twilio API Key SID', example: 'SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('api-keys/:sid')
  async getApiKey(@Param('sid') sid: string) {
    try {
      const result = await this.credentialHelper.fetchApiKey(sid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch API Key',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Update an API Key
   * POST /twilio/credentials/api-keys/:sid
   */
  @ApiOperation({ summary: 'Update API key', description: 'Update the friendly name of an API key' })
  @ApiResponse({ status: 200, description: 'API key updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - friendlyName is required' })
  @ApiParam({ name: 'sid', description: 'Twilio API Key SID', example: 'SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post('api-keys/:sid')
  async updateApiKey(@Param('sid') sid: string, @Body() body: CreateApiKeyDto) {
    try {
      const result = await this.credentialHelper.updateApiKey(sid, body.friendlyName);
      return {
        success: true,
        data: result,
        message: 'API Key updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update API Key',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete an API Key
   * DELETE /twilio/credentials/api-keys/:sid
   */
  @ApiOperation({ summary: 'Delete API key', description: 'Permanently delete an API key' })
  @ApiResponse({ status: 200, description: 'API key deleted successfully' })
  @ApiParam({ name: 'sid', description: 'Twilio API Key SID', example: 'SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Delete('api-keys/:sid')
  async deleteApiKey(@Param('sid') sid: string) {
    try {
      const result = await this.credentialHelper.deleteApiKey(sid);
      return {
        success: true,
        message: 'API Key deleted successfully',
        data: { deleted: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete API Key',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
