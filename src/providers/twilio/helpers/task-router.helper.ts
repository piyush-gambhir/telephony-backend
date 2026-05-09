import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * TaskRouter for intelligent call routing.
 * Handles workspaces, tasks, workers, and workflows.
 *
 * @docs https://www.twilio.com/docs/taskrouter
 */
@Injectable()
export class TaskRouterHelper {
  private readonly logger = new Logger(TaskRouterHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Create a workspace.
   *
   * @param friendlyName - Friendly name for the workspace
   * @param params - Optional workspace parameters
   * @returns Created workspace instance
   */
  async createWorkspace(
    friendlyName: string,
    params?: {
      eventCallbackUrl?: string;
      eventsFilter?: string;
      multiTaskEnabled?: boolean;
      timeoutActivitySid?: string;
      prioritizeQueueOrder?: 'FIFO' | 'LIFO';
    },
  ): Promise<Awaited<ReturnType<typeof this.client.taskrouter.v1.workspaces.create>>> {
    return this.client.taskrouter.v1.workspaces.create({
      friendlyName,
      ...params,
    });
  }

  /**
   * Fetch a workspace by SID.
   *
   * @param workspaceSid - Workspace SID
   * @returns Workspace instance
   */
  async fetchWorkspace(
    workspaceSid: string,
  ): Promise<
    Awaited<ReturnType<ReturnType<typeof this.client.taskrouter.v1.workspaces>['fetch']>>
  > {
    return this.client.taskrouter.v1.workspaces(workspaceSid).fetch();
  }

  /**
   * List workspaces.
   *
   * @param params - Optional filter parameters
   * @returns List of workspace instances
   */
  async listWorkspaces(params?: {
    friendlyName?: string;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.taskrouter.v1.workspaces.list>>> {
    return this.client.taskrouter.v1.workspaces.list(params || {});
  }

  /**
   * Create a task.
   *
   * @param workspaceSid - Workspace SID
   * @param params - Task parameters
   * @returns Created task instance
   */
  async createTask(
    workspaceSid: string,
    params: {
      workflowSid: string;
      attributes?: string;
      priority?: number;
      timeout?: number;
      taskChannel?: string;
    },
  ): Promise<any> {
    const workspace = this.client.taskrouter.v1.workspaces(workspaceSid);
    return (workspace.tasks as any).create(params);
  }

  /**
   * Fetch a task by SID.
   *
   * @param workspaceSid - Workspace SID
   * @param taskSid - Task SID
   * @returns Task instance
   */
  async fetchTask(workspaceSid: string, taskSid: string): Promise<any> {
    return this.client.taskrouter.v1.workspaces(workspaceSid).tasks(taskSid).fetch();
  }

  /**
   * List tasks.
   *
   * @param workspaceSid - Workspace SID
   * @param params - Optional filter parameters
   * @returns List of task instances
   */
  async listTasks(
    workspaceSid: string,
    params?: {
      priority?: number;
      assignmentStatus?: string[];
      workflowSid?: string;
      workflowName?: string;
      taskQueueSid?: string;
      taskQueueName?: string;
      evaluateTaskAttributes?: string;
      ordering?: string;
      hasAddons?: boolean;
      limit?: number;
    },
  ): Promise<any[]> {
    return this.client.taskrouter.v1.workspaces(workspaceSid).tasks.list(params || {});
  }

  /**
   * Update a task.
   *
   * @param workspaceSid - Workspace SID
   * @param taskSid - Task SID
   * @param params - Update parameters
   * @returns Updated task instance
   */
  async updateTask(
    workspaceSid: string,
    taskSid: string,
    params: {
      attributes?: string;
      assignmentStatus?:
        | 'pending'
        | 'reserved'
        | 'assigned'
        | 'canceled'
        | 'wrapping'
        | 'completed';
      reason?: string;
      priority?: number;
      taskChannel?: string;
    },
  ): Promise<any> {
    return this.client.taskrouter.v1.workspaces(workspaceSid).tasks(taskSid).update(params);
  }

  /**
   * Create a worker.
   *
   * @param workspaceSid - Workspace SID
   * @param friendlyName - Friendly name for the worker
   * @param params - Optional worker parameters
   * @returns Created worker instance
   */
  async createWorker(
    workspaceSid: string,
    friendlyName: string,
    params?: {
      activitySid?: string;
      attributes?: string;
    },
  ): Promise<any> {
    const workspace = this.client.taskrouter.v1.workspaces(workspaceSid);
    return (workspace.workers as any).create({
      friendlyName,
      ...params,
    });
  }

  /**
   * Fetch a worker by SID.
   *
   * @param workspaceSid - Workspace SID
   * @param workerSid - Worker SID
   * @returns Worker instance
   */
  async fetchWorker(workspaceSid: string, workerSid: string): Promise<any> {
    return this.client.taskrouter.v1.workspaces(workspaceSid).workers(workerSid).fetch();
  }

  /**
   * List workers.
   *
   * @param workspaceSid - Workspace SID
   * @param params - Optional filter parameters
   * @returns List of worker instances
   */
  async listWorkers(
    workspaceSid: string,
    params?: {
      activityName?: string;
      activitySid?: string;
      available?: string;
      friendlyName?: string;
      targetWorkersExpression?: string;
      taskQueueName?: string;
      taskQueueSid?: string;
      limit?: number;
    },
  ): Promise<any[]> {
    const workspace = this.client.taskrouter.v1.workspaces(workspaceSid);
    return (workspace.workers as any).list(params || {});
  }

  /**
   * Create a workflow.
   *
   * @param workspaceSid - Workspace SID
   * @param friendlyName - Friendly name for the workflow
   * @param configuration - Workflow configuration JSON
   * @param params - Optional workflow parameters
   * @returns Created workflow instance
   */
  async createWorkflow(
    workspaceSid: string,
    friendlyName: string,
    configuration: string,
    params?: {
      assignmentCallbackUrl?: string;
      fallbackAssignmentCallbackUrl?: string;
      taskReservationTimeout?: number;
    },
  ): Promise<any> {
    const workspace = this.client.taskrouter.v1.workspaces(workspaceSid);
    return (workspace.workflows as any).create({
      friendlyName,
      configuration,
      ...params,
    });
  }

  /**
   * Fetch a workflow by SID.
   *
   * @param workspaceSid - Workspace SID
   * @param workflowSid - Workflow SID
   * @returns Workflow instance
   */
  async fetchWorkflow(workspaceSid: string, workflowSid: string): Promise<any> {
    return this.client.taskrouter.v1.workspaces(workspaceSid).workflows(workflowSid).fetch();
  }

  /**
   * List workflows.
   *
   * @param workspaceSid - Workspace SID
   * @param params - Optional filter parameters
   * @returns List of workflow instances
   */
  async listWorkflows(
    workspaceSid: string,
    params?: {
      friendlyName?: string;
      limit?: number;
    },
  ): Promise<any[]> {
    const workspace = this.client.taskrouter.v1.workspaces(workspaceSid);
    return (workspace.workflows as any).list(params || {});
  }
}
