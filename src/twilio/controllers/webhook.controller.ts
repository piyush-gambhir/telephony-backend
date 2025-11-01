import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WebhookSignatureGuard } from '../helpers/webhook-signature-guard';

@ApiTags('Twilio - Webhooks')
@Controller('twilio/webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookGuard: WebhookSignatureGuard,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Handle SMS status webhooks from Twilio
   * POST /twilio/webhooks/sms/status
   */
  @Post('sms/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SMS Status Webhook',
    description: 'Receive SMS delivery status updates from Twilio',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or malformed request',
  })
  @ApiHeader({
    name: 'x-twilio-signature',
    description: 'Twilio webhook signature for validation',
    required: true,
  })
  async handleSmsStatus(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    try {
      // Validate webhook signature
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      if (!authToken) {
        throw new BadRequestException('Twilio auth token not configured');
      }

      // Create a mock request object for signature validation
      const mockRequest = {
        headers: headers,
        body: body,
        protocol: 'https',
        get: (header: string) => headers[header.toLowerCase()],
        originalUrl: '/twilio/webhooks/sms/status',
        url: '/twilio/webhooks/sms/status',
      };

      this.webhookGuard.validateOrThrow(authToken, mockRequest as any);

      // Process SMS status webhook
      this.logger.log(`SMS Status Webhook: ${JSON.stringify(body)}`);

      // Extract relevant data
      const {
        MessageSid,
        MessageStatus,
        To,
        From,
        SmsSid,
        SmsStatus,
        ErrorCode,
        ErrorMessage,
      } = body;

      // Log status change
      this.logger.log(
        `SMS ${MessageSid || SmsSid} status changed to ${MessageStatus || SmsStatus} for ${To}`,
      );

      // Here you could:
      // - Update database records
      // - Send notifications
      // - Trigger business logic
      // - Queue for processing

      return { success: true, processed: true };
    } catch (error) {
      this.logger.error(`SMS webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle Voice call status webhooks from Twilio
   * POST /twilio/webhooks/voice/status
   */
  @Post('voice/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Voice Status Webhook',
    description: 'Receive voice call status updates from Twilio',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or malformed request',
  })
  @ApiHeader({
    name: 'x-twilio-signature',
    description: 'Twilio webhook signature for validation',
    required: true,
  })
  async handleVoiceStatus(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    try {
      // Validate webhook signature
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      if (!authToken) {
        throw new BadRequestException('Twilio auth token not configured');
      }

      const mockRequest = {
        headers: headers,
        body: body,
        protocol: 'https',
        get: (header: string) => headers[header.toLowerCase()],
        originalUrl: '/twilio/webhooks/voice/status',
        url: '/twilio/webhooks/voice/status',
      };

      this.webhookGuard.validateOrThrow(authToken, mockRequest as any);

      // Process voice status webhook
      this.logger.log(`Voice Status Webhook: ${JSON.stringify(body)}`);

      const {
        CallSid,
        CallStatus,
        From,
        To,
        Direction,
        Duration,
        RecordingUrl,
        RecordingSid,
      } = body;

      this.logger.log(
        `Call ${CallSid} status changed to ${CallStatus} (${Duration || 0}s)`,
      );

      // Here you could:
      // - Update call records
      // - Process recordings
      // - Send notifications
      // - Update billing

      return { success: true, processed: true };
    } catch (error) {
      this.logger.error(`Voice webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle Recording completion webhooks from Twilio
   * POST /twilio/webhooks/recording/status
   */
  @Post('recording/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recording Status Webhook',
    description: 'Receive recording completion notifications from Twilio',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or malformed request',
  })
  @ApiHeader({
    name: 'x-twilio-signature',
    description: 'Twilio webhook signature for validation',
    required: true,
  })
  async handleRecordingStatus(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    try {
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      if (!authToken) {
        throw new BadRequestException('Twilio auth token not configured');
      }

      const mockRequest = {
        headers: headers,
        body: body,
        protocol: 'https',
        get: (header: string) => headers[header.toLowerCase()],
        originalUrl: '/twilio/webhooks/recording/status',
        url: '/twilio/webhooks/recording/status',
      };

      this.webhookGuard.validateOrThrow(authToken, mockRequest as any);

      this.logger.log(`Recording Status Webhook: ${JSON.stringify(body)}`);

      const {
        RecordingSid,
        RecordingStatus,
        CallSid,
        RecordingUrl,
        RecordingDuration,
        RecordingChannels,
      } = body;

      this.logger.log(
        `Recording ${RecordingSid} completed: ${RecordingDuration}s, ${RecordingChannels} channels`,
      );

      // Here you could:
      // - Download/store recordings
      // - Update recording metadata
      // - Trigger transcription
      // - Send notifications

      return { success: true, processed: true };
    } catch (error) {
      this.logger.error(`Recording webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle Verification completion webhooks from Twilio
   * POST /twilio/webhooks/verification/status
   */
  @Post('verification/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verification Status Webhook',
    description: 'Receive verification completion notifications from Twilio',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or malformed request',
  })
  @ApiHeader({
    name: 'x-twilio-signature',
    description: 'Twilio webhook signature for validation',
    required: true,
  })
  async handleVerificationStatus(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    try {
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      if (!authToken) {
        throw new BadRequestException('Twilio auth token not configured');
      }

      const mockRequest = {
        headers: headers,
        body: body,
        protocol: 'https',
        get: (header: string) => headers[header.toLowerCase()],
        originalUrl: '/twilio/webhooks/verification/status',
        url: '/twilio/webhooks/verification/status',
      };

      this.webhookGuard.validateOrThrow(authToken, mockRequest as any);

      this.logger.log(`Verification Status Webhook: ${JSON.stringify(body)}`);

      const {
        VerificationSid,
        VerificationStatus,
        To,
        Channel,
      } = body;

      this.logger.log(
        `Verification ${VerificationSid} completed with status: ${VerificationStatus}`,
      );

      // Here you could:
      // - Update user verification status
      // - Send confirmation emails
      // - Trigger account activation
      // - Log verification events

      return { success: true, processed: true };
    } catch (error) {
      this.logger.error(`Verification webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unified webhook handler for all Twilio webhooks
   * POST /twilio/webhooks
   * 
   * This is the RECOMMENDED endpoint to use - it intelligently routes
   * webhooks based on the payload content to the appropriate handler.
   * 
   * Simply configure this single URL in all your Twilio services:
   * https://yourserver.com/twilio/webhooks
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unified Twilio Webhook Endpoint (RECOMMENDED)',
    description: `Single endpoint to handle all Twilio webhooks with automatic signature validation and intelligent routing.
    
    Supports:
    - SMS status callbacks
    - Voice call status callbacks  
    - Recording completion callbacks
    - Verification status callbacks
    - And more...
    
    Configure this URL in your Twilio console for all webhook callbacks.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      example: {
        success: true,
        processed: true,
        webhookType: 'sms',
        message: 'Webhook processed successfully'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or malformed request',
  })
  @ApiHeader({
    name: 'x-twilio-signature',
    description: 'Twilio webhook signature for validation',
    required: true,
  })
  async handleUnifiedWebhook(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    try {
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      if (!authToken) {
        throw new BadRequestException('Twilio auth token not configured');
      }

      const mockRequest = {
        headers: headers,
        body: body,
        protocol: 'https',
        get: (header: string) => headers[header.toLowerCase()],
        originalUrl: '/twilio/webhooks',
        url: '/twilio/webhooks',
      };

      // Validate webhook signature
      this.webhookGuard.validateOrThrow(authToken, mockRequest as any);

      // Detect webhook type from payload
      const webhookType = this.detectWebhookType(body);
      
      this.logger.log(`Unified Webhook received - Type: ${webhookType}`);
      this.logger.debug(`Webhook payload: ${JSON.stringify(body, null, 2)}`);

      // Route to appropriate handler based on webhook type
      let result;
      switch (webhookType) {
        case 'sms':
          result = await this.processSmsWebhook(body);
          break;
        case 'voice':
          result = await this.processVoiceWebhook(body);
          break;
        case 'recording':
          result = await this.processRecordingWebhook(body);
          break;
        case 'verification':
          result = await this.processVerificationWebhook(body);
          break;
        case 'taskrouter':
          result = await this.processTaskRouterWebhook(body);
          break;
        case 'studio':
          result = await this.processStudioWebhook(body);
          break;
        default:
          this.logger.warn(`Unknown webhook type: ${webhookType}`);
          result = await this.processUnknownWebhook(body);
      }

      return {
        success: true,
        processed: true,
        webhookType: webhookType,
        message: 'Webhook processed successfully',
        ...result,
      };
    } catch (error) {
      this.logger.error(`Unified webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detect webhook type based on body properties
   */
  private detectWebhookType(body: any): string {
    if (body.MessageSid || body.SmsSid) return 'sms';
    if (body.RecordingSid) return 'recording';
    if (body.CallSid) return 'voice';
    if (body.VerificationSid) return 'verification';
    if (body.TaskSid) return 'taskrouter';
    if (body.FlowSid) return 'studio';
    return 'unknown';
  }

  /**
   * Process SMS webhook
   */
  private async processSmsWebhook(body: any): Promise<any> {
    const {
      MessageSid,
      MessageStatus,
      To,
      From,
      SmsSid,
      SmsStatus,
      ErrorCode,
      ErrorMessage,
    } = body;

    this.logger.log(
      `SMS ${MessageSid || SmsSid} status: ${MessageStatus || SmsStatus} (To: ${To})`,
    );

    if (ErrorCode) {
      this.logger.error(`SMS Error ${ErrorCode}: ${ErrorMessage}`);
    }

    // Add your business logic here:
    // - Update database
    // - Send notifications
    // - Trigger workflows

    return { 
      type: 'sms',
      messageSid: MessageSid || SmsSid,
      status: MessageStatus || SmsStatus 
    };
  }

  /**
   * Process Voice webhook
   */
  private async processVoiceWebhook(body: any): Promise<any> {
    const {
      CallSid,
      CallStatus,
      From,
      To,
      Direction,
      Duration,
      RecordingUrl,
    } = body;

    this.logger.log(
      `Call ${CallSid} status: ${CallStatus} (Duration: ${Duration || 0}s)`,
    );

    // Add your business logic here:
    // - Update call records
    // - Process recordings
    // - Update billing

    return { 
      type: 'voice',
      callSid: CallSid,
      status: CallStatus,
      duration: Duration 
    };
  }

  /**
   * Process Recording webhook
   */
  private async processRecordingWebhook(body: any): Promise<any> {
    const {
      RecordingSid,
      RecordingStatus,
      CallSid,
      RecordingUrl,
      RecordingDuration,
      RecordingChannels,
    } = body;

    this.logger.log(
      `Recording ${RecordingSid} completed: ${RecordingDuration}s, ${RecordingChannels} channels`,
    );

    // Add your business logic here:
    // - Download recordings
    // - Trigger transcription
    // - Update metadata

    return { 
      type: 'recording',
      recordingSid: RecordingSid,
      status: RecordingStatus,
      url: RecordingUrl 
    };
  }

  /**
   * Process Verification webhook
   */
  private async processVerificationWebhook(body: any): Promise<any> {
    const {
      VerificationSid,
      VerificationStatus,
      To,
      Channel,
    } = body;

    this.logger.log(
      `Verification ${VerificationSid} status: ${VerificationStatus} (To: ${To}, Channel: ${Channel})`,
    );

    // Add your business logic here:
    // - Update user verification status
    // - Send confirmation
    // - Trigger account activation

    return { 
      type: 'verification',
      verificationSid: VerificationSid,
      status: VerificationStatus 
    };
  }

  /**
   * Process TaskRouter webhook
   */
  private async processTaskRouterWebhook(body: any): Promise<any> {
    const { TaskSid, TaskStatus, WorkspaceSid } = body;

    this.logger.log(
      `TaskRouter Task ${TaskSid} status: ${TaskStatus}`,
    );

    // Add your business logic here:
    // - Update task status
    // - Notify workers
    // - Update queue metrics

    return { 
      type: 'taskrouter',
      taskSid: TaskSid,
      status: TaskStatus 
    };
  }

  /**
   * Process Studio webhook
   */
  private async processStudioWebhook(body: any): Promise<any> {
    const { FlowSid, ExecutionSid, Status } = body;

    this.logger.log(
      `Studio Flow ${FlowSid} execution ${ExecutionSid} status: ${Status}`,
    );

    // Add your business logic here:
    // - Track flow execution
    // - Update analytics
    // - Trigger follow-up actions

    return { 
      type: 'studio',
      flowSid: FlowSid,
      executionSid: ExecutionSid,
      status: Status 
    };
  }

  /**
   * Process unknown webhook types
   */
  private async processUnknownWebhook(body: any): Promise<any> {
    this.logger.warn(`Unknown webhook type received: ${JSON.stringify(body, null, 2)}`);

    // Log for debugging
    // You can add custom detection logic here

    return { 
      type: 'unknown',
      raw: body 
    };
  }
}
