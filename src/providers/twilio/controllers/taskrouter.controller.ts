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
import { TaskRouterHelper } from '../helpers/task-router.helper';

export class CreateWorkspaceDto {
  @ApiProperty({ description: 'Friendly name for the workspace', example: 'My TaskRouter Workspace' })
  @IsNotEmpty({ message: 'Friendly name is required' })
  @IsString({ message: 'Friendly name must be a string' })
  friendlyName: string;

  @ApiPropertyOptional({ description: 'Event callback URL', example: 'https://example.com/events' })
  @IsOptional()
  @IsUrl({}, { message: 'Event callback URL must be a valid URL' })
  eventCallbackUrl?: string;

  @ApiPropertyOptional({ description: 'Events filter', example: 'task.created,task.completed' })
  @IsOptional()
  @IsString({ message: 'Events filter must be a string' })
  eventsFilter?: string;

  @ApiPropertyOptional({ description: 'Enable multi-task support', example: true, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Multi task enabled must be a boolean' })
  multiTaskEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Workspace template', example: 'FIFO' })
  @IsOptional()
  @IsString({ message: 'Template must be a string' })
  template?: string;

  @ApiPropertyOptional({ description: 'Queue priority order', enum: ['FIFO', 'LIFO'], example: 'FIFO' })
  @IsOptional()
  @IsEnum(['FIFO', 'LIFO'], { message: 'Queue priority order must be FIFO or LIFO' })
  prioritizeQueueOrder?: 'FIFO' | 'LIFO';
}

@ApiTags('Twilio - TaskRouter')
@Controller('twilio/taskrouter')
export class TaskRouterController {
  constructor(private readonly taskRouterHelper: TaskRouterHelper) {}

  /**
   * Create a workspace
   * POST /twilio/taskrouter/workspaces
   */
  @ApiOperation({ summary: 'Create workspace', description: 'Create a new TaskRouter workspace for intelligent call routing' })
  @ApiResponse({ status: 201, description: 'Workspace created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - friendlyName is required' })
  @Post('workspaces')
  async createWorkspace(@Body() createDto: CreateWorkspaceDto) {
    try {
      const result = await this.taskRouterHelper.createWorkspace(createDto.friendlyName, {
        eventCallbackUrl: createDto.eventCallbackUrl,
        eventsFilter: createDto.eventsFilter,
        multiTaskEnabled: createDto.multiTaskEnabled,
        prioritizeQueueOrder: createDto.prioritizeQueueOrder,
      });
      return {
        success: true,
        data: result,
        message: 'Workspace created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create workspace',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a workspace
   * GET /twilio/taskrouter/workspaces/:workspaceSid
   */
  @ApiOperation({ summary: 'Get workspace by SID', description: 'Retrieve details of a specific TaskRouter workspace' })
  @ApiResponse({ status: 200, description: 'Workspace retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('workspaces/:workspaceSid')
  async getWorkspace(@Param('workspaceSid') workspaceSid: string) {
    try {
      const result = await this.taskRouterHelper.fetchWorkspace(workspaceSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch workspace',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List workspaces
   * GET /twilio/taskrouter/workspaces
   */
  @ApiOperation({ summary: 'List workspaces', description: 'Retrieve all TaskRouter workspaces' })
  @ApiResponse({ status: 200, description: 'Workspaces retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get('workspaces')
  async listWorkspaces(@Query() query: { limit?: number }) {
    try {
      const params = {
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.taskRouterHelper.listWorkspaces(params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list workspaces',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  /**
   * Create a task
   * POST /twilio/taskrouter/workspaces/:workspaceSid/tasks
   */
  @ApiOperation({ summary: 'Create task', description: 'Create a new task in a TaskRouter workspace' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - workflowSid is required' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post('workspaces/:workspaceSid/tasks')
  async createTask(
    @Param('workspaceSid') workspaceSid: string,
    @Body() taskDto: {
      workflowSid: string;
      attributes?: Record<string, any>;
      priority?: number;
      timeout?: number;
      taskChannel?: string;
    },
  ) {
    if (!taskDto.workflowSid) {
      throw new HttpException(
        {
          success: false,
          message: 'workflowSid is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.taskRouterHelper.createTask(workspaceSid, {
        workflowSid: taskDto.workflowSid,
        attributes: taskDto.attributes ? JSON.stringify(taskDto.attributes) : undefined,
        priority: taskDto.priority,
        timeout: taskDto.timeout,
        taskChannel: taskDto.taskChannel,
      });
      return {
        success: true,
        data: result,
        message: 'Task created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create task',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a task
   * GET /twilio/taskrouter/workspaces/:workspaceSid/tasks/:taskSid
   */
  @ApiOperation({ summary: 'Get task by SID', description: 'Retrieve details of a specific task' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiParam({ name: 'taskSid', description: 'Twilio Task SID', example: 'WTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('workspaces/:workspaceSid/tasks/:taskSid')
  async getTask(@Param('workspaceSid') workspaceSid: string, @Param('taskSid') taskSid: string) {
    try {
      const result = await this.taskRouterHelper.fetchTask(workspaceSid, taskSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch task',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List tasks
   * GET /twilio/taskrouter/workspaces/:workspaceSid/tasks
   */
  @ApiOperation({ summary: 'List tasks', description: 'Retrieve all tasks in a workspace' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiQuery({ name: 'assignmentStatus', required: false, description: 'Filter by assignment status' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get('workspaces/:workspaceSid/tasks')
  async listTasks(
    @Param('workspaceSid') workspaceSid: string,
    @Query() query: { assignmentStatus?: string; limit?: number },
  ) {
    try {
      const params = {
        assignmentStatus: query.assignmentStatus as any,
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.taskRouterHelper.listTasks(workspaceSid, params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list tasks',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a task
   * POST /twilio/taskrouter/workspaces/:workspaceSid/tasks/:taskSid
   */
  @ApiOperation({ summary: 'Update task', description: 'Update task attributes or status' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiParam({ name: 'taskSid', description: 'Twilio Task SID', example: 'WTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post('workspaces/:workspaceSid/tasks/:taskSid')
  async updateTask(
    @Param('workspaceSid') workspaceSid: string,
    @Param('taskSid') taskSid: string,
    @Body() updateDto: {
      attributes?: Record<string, any>;
      assignmentStatus?: 'pending' | 'reserved' | 'assigned' | 'canceled' | 'wrapping' | 'completed';
      reason?: string;
      priority?: number;
      taskChannel?: string;
    },
  ) {
    try {
      const result = await this.taskRouterHelper.updateTask(workspaceSid, taskSid, {
        ...updateDto,
        attributes: updateDto.attributes ? JSON.stringify(updateDto.attributes) : undefined,
      });
      return {
        success: true,
        data: result,
        message: 'Task updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update task',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a worker
   * POST /twilio/taskrouter/workspaces/:workspaceSid/workers
   */
  @ApiOperation({ summary: 'Create worker', description: 'Create a new worker in a TaskRouter workspace' })
  @ApiResponse({ status: 201, description: 'Worker created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - friendlyName is required' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post('workspaces/:workspaceSid/workers')
  async createWorker(
    @Param('workspaceSid') workspaceSid: string,
    @Body() workerDto: {
      friendlyName: string;
      attributes?: Record<string, any>;
    },
  ) {
    if (!workerDto.friendlyName) {
      throw new HttpException(
        {
          success: false,
          message: 'friendlyName is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.taskRouterHelper.createWorker(workspaceSid, workerDto.friendlyName, {
        attributes: workerDto.attributes ? JSON.stringify(workerDto.attributes) : undefined,
      });
      return {
        success: true,
        data: result,
        message: 'Worker created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create worker',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a worker
   * GET /twilio/taskrouter/workspaces/:workspaceSid/workers/:workerSid
   */
  @ApiOperation({ summary: 'Get worker by SID', description: 'Retrieve details of a specific worker' })
  @ApiResponse({ status: 200, description: 'Worker retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiParam({ name: 'workerSid', description: 'Twilio Worker SID', example: 'WKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('workspaces/:workspaceSid/workers/:workerSid')
  async getWorker(@Param('workspaceSid') workspaceSid: string, @Param('workerSid') workerSid: string) {
    try {
      const result = await this.taskRouterHelper.fetchWorker(workspaceSid, workerSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch worker',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List workers
   * GET /twilio/taskrouter/workspaces/:workspaceSid/workers
   */
  @ApiOperation({ summary: 'List workers', description: 'Retrieve all workers in a workspace' })
  @ApiResponse({ status: 200, description: 'Workers retrieved successfully' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get('workspaces/:workspaceSid/workers')
  async listWorkers(@Param('workspaceSid') workspaceSid: string, @Query() query: { limit?: number }) {
    try {
      const params = {
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.taskRouterHelper.listWorkers(workspaceSid, params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list workers',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a workflow
   * POST /twilio/taskrouter/workspaces/:workspaceSid/workflows
   */
  @ApiOperation({ summary: 'Create workflow', description: 'Create a new workflow for task routing' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - friendlyName and configuration are required' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Post('workspaces/:workspaceSid/workflows')
  async createWorkflow(
    @Param('workspaceSid') workspaceSid: string,
    @Body() workflowDto: {
      friendlyName: string;
      configuration: string;
      assignmentCallbackUrl?: string;
      fallbackAssignmentCallbackUrl?: string;
      taskReservationTimeout?: number;
    },
  ) {
    if (!workflowDto.friendlyName || !workflowDto.configuration) {
      throw new HttpException(
        {
          success: false,
          message: 'friendlyName and configuration are required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.taskRouterHelper.createWorkflow(
        workspaceSid,
        workflowDto.friendlyName,
        workflowDto.configuration,
        {
          assignmentCallbackUrl: workflowDto.assignmentCallbackUrl,
          fallbackAssignmentCallbackUrl: workflowDto.fallbackAssignmentCallbackUrl,
          taskReservationTimeout: workflowDto.taskReservationTimeout,
        }
      );
      return {
        success: true,
        data: result,
        message: 'Workflow created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create workflow',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a workflow
   * GET /twilio/taskrouter/workspaces/:workspaceSid/workflows/:workflowSid
   */
  @ApiOperation({ summary: 'Get workflow by SID', description: 'Retrieve details of a specific workflow' })
  @ApiResponse({ status: 200, description: 'Workflow retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiParam({ name: 'workflowSid', description: 'Twilio Workflow SID', example: 'WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @Get('workspaces/:workspaceSid/workflows/:workflowSid')
  async getWorkflow(@Param('workspaceSid') workspaceSid: string, @Param('workflowSid') workflowSid: string) {
    try {
      const result = await this.taskRouterHelper.fetchWorkflow(workspaceSid, workflowSid);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch workflow',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * List workflows
   * GET /twilio/taskrouter/workspaces/:workspaceSid/workflows
   */
  @ApiOperation({ summary: 'List workflows', description: 'Retrieve all workflows in a workspace' })
  @ApiResponse({ status: 200, description: 'Workflows retrieved successfully' })
  @ApiParam({ name: 'workspaceSid', description: 'Twilio Workspace SID', example: 'WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
  @Get('workspaces/:workspaceSid/workflows')
  async listWorkflows(@Param('workspaceSid') workspaceSid: string, @Query() query: { limit?: number }) {
    try {
      const params = {
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
      };

      const result = await this.taskRouterHelper.listWorkflows(workspaceSid, params);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to list workflows',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
