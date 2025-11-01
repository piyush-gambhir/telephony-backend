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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsObject,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConversationsHelper } from '../helpers/conversations.helper';

export class CreateConversationDto {
  @ApiPropertyOptional({ description: 'Friendly name for the conversation', example: 'Customer Support Chat' })
  @IsOptional()
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName?: string;

  @ApiPropertyOptional({ description: 'Unique name for the conversation', example: 'support-chat-123' })
  @IsOptional()
  @IsString({ message: 'Unique name must be a string' })
  uniqueName?: string;

  @ApiPropertyOptional({ description: 'JSON string of conversation attributes', example: '{"type":"support"}' })
  @IsOptional()
  @IsString({ message: 'Attributes must be a string' })
  attributes?: string;

  @ApiPropertyOptional({ description: 'Messaging Service SID', example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString({ message: 'Messaging Service SID must be a string' })
  messagingServiceSid?: string;

  @ApiPropertyOptional({ description: 'Date created', type: Date })
  @IsOptional()
  @Type(() => Date)
  dateCreated?: Date;

  @ApiPropertyOptional({ description: 'Date updated', type: Date })
  @IsOptional()
  @Type(() => Date)
  dateUpdated?: Date;

  @ApiPropertyOptional({ description: 'Conversation timers configuration' })
  @IsOptional()
  @IsObject({ message: 'Timers must be an object' })
  timers?: {
    inactive?: string;
    closed?: string;
  };

  @ApiPropertyOptional({ description: 'Conversation state', enum: ['active', 'inactive', 'closed'], example: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'closed'], { message: 'State must be active, inactive, or closed' })
  state?: 'active' | 'inactive' | 'closed';

  @ApiPropertyOptional({ description: 'Conversation bindings' })
  @IsOptional()
  @IsObject({ message: 'Bindings must be an object' })
  bindings?: Record<string, any>;
}

export class ListConversationsDto {
  @ApiPropertyOptional({ description: 'Maximum number of results', example: 20, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  limit?: number;
}

@ApiTags('Twilio - Conversations')
@Controller('twilio/conversations')
export class ConversationsController {
  constructor(private readonly conversationsHelper: ConversationsHelper) {}

  /**
   * Create a new conversation
   * POST /twilio/conversations
   */
  @ApiOperation({ summary: 'Create conversation', description: 'Create a new multi-channel messaging conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  @Post()
  async createConversation(@Body() createDto: CreateConversationDto) {
    try {
      const result = await this.conversationsHelper.createConversation(createDto);
      return {
        success: true,
        data: result,
        message: 'Conversation created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create conversation',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific conversation
   * GET /twilio/conversations/:conversationSid
   */
  @ApiOperation({ summary: 'Get conversation by SID', description: 'Retrieve details of a specific conversation' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiParam({ name: 'conversationSid', description: 'Twilio Conversation SID', example: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get(':conversationSid')
  async getConversation(@Param('conversationSid') conversationSid: string) {
    try {
      const result = await this.conversationsHelper.fetchConversation(conversationSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch conversation',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List conversations
   * GET /twilio/conversations
   */
  @ApiOperation({ summary: 'List conversations', description: 'Retrieve all conversations in the account' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get()
  async listConversations(@Query() query: ListConversationsDto) {
    try {
      const params = {
        limit: query.limit,
      };

      const result = await this.conversationsHelper.listConversations(params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list conversations',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a conversation
   * POST /twilio/conversations/:conversationSid
   */
  @ApiOperation({ summary: 'Update conversation', description: 'Update conversation details' })
  @ApiResponse({ status: 200, description: 'Conversation updated successfully' })
  @ApiParam({ name: 'conversationSid', description: 'Twilio Conversation SID', example: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post(':conversationSid')
  async updateConversation(
    @Param('conversationSid') conversationSid: string,
    @Body() updateDto: Partial<CreateConversationDto>,
  ) {
    try {
      const result = await this.conversationsHelper.updateConversation(conversationSid, updateDto);
      return {
        success: true,
        data: result,
        message: 'Conversation updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update conversation',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a conversation
   * DELETE /twilio/conversations/:conversationSid
   */
  @ApiOperation({ summary: 'Delete conversation', description: 'Permanently delete a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted successfully' })
  @ApiParam({ name: 'conversationSid', description: 'Twilio Conversation SID', example: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Delete(':conversationSid')
  async deleteConversation(@Param('conversationSid') conversationSid: string) {
    try {
      const result = await this.conversationsHelper.deleteConversation(conversationSid);
      return {
        success: true,
        message: 'Conversation deleted successfully',
        data: { deleted: result },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete conversation',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Add a participant to a conversation
   * POST /twilio/conversations/:conversationSid/participants
   */
  @ApiOperation({ summary: 'Add participant', description: 'Add a participant to a conversation' })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  @ApiParam({ name: 'conversationSid', description: 'Twilio Conversation SID', example: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post(':conversationSid/participants')
  async addParticipant(
    @Param('conversationSid') conversationSid: string,
    @Body()
    participantDto: {
      identity?: string;
      messagingBinding?: {
        address?: string;
        proxyAddress?: string;
        type?: 'sms' | 'whatsapp';
      };
      attributes?: string;
      roleSid?: string;
    },
  ) {
    try {
      const result = await this.conversationsHelper.addParticipant(conversationSid, participantDto);
      return {
        success: true,
        data: result,
        message: 'Participant added successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to add participant',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List participants in a conversation
   * GET /twilio/conversations/:conversationSid/participants
   */
  @ApiOperation({ summary: 'List participants', description: 'Retrieve all participants in a conversation' })
  @ApiResponse({ status: 200, description: 'Participants retrieved successfully' })
  @ApiParam({ name: 'conversationSid', description: 'Twilio Conversation SID', example: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get(':conversationSid/participants')
  async listParticipants(@Param('conversationSid') conversationSid: string) {
    try {
      const result = await this.conversationsHelper.listParticipants(conversationSid);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list participants',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send a message in a conversation
   * POST /twilio/conversations/:conversationSid/messages
   */
  @ApiOperation({ summary: 'Send message', description: 'Send a message in a conversation' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiParam({ name: 'conversationSid', description: 'Twilio Conversation SID', example: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post(':conversationSid/messages')
  async sendMessage(
    @Param('conversationSid') conversationSid: string,
    @Body()
    messageDto: {
      author?: string;
      body?: string;
      dateCreated?: Date;
      dateUpdated?: Date;
      attributes?: string;
      mediaSid?: string;
      xTwilioWebhookEnabled?: 'true' | 'false';
    },
  ) {
    try {
      const result = await this.conversationsHelper.sendMessage(conversationSid, messageDto);
      return {
        success: true,
        data: result,
        message: 'Message sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send message',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List messages in a conversation
   * GET /twilio/conversations/:conversationSid/messages
   */
  @ApiOperation({ summary: 'List messages', description: 'Retrieve all messages in a conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiParam({ name: 'conversationSid', description: 'Twilio Conversation SID', example: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get(':conversationSid/messages')
  async listMessages(
    @Param('conversationSid') conversationSid: string,
    @Query() query: { limit?: number },
  ) {
    try {
      const params = {
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.conversationsHelper.listMessages(conversationSid, params);
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
}
