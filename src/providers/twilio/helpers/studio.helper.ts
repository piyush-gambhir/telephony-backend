import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Studio flow management.
 * Handles executing Studio flows.
 *
 * @docs https://www.twilio.com/docs/studio
 */
@Injectable()
export class StudioHelper {
  private readonly logger = new Logger(StudioHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Execute a Studio flow.
   *
   * @param flowSid - Flow SID
   * @param params - Execution parameters
   * @returns Created execution instance
   */
  async executeFlow(
    flowSid: string,
    params: {
      to: string;
      from: string;
      parameters?: Record<string, any>;
    },
  ): Promise<any> {
    const flow = this.client.studio.v2.flows(flowSid);
    return (flow.executions as any).create({
      to: params.to,
      from: params.from,
      parameters: params.parameters ? JSON.stringify(params.parameters) : undefined,
    });
  }

  /**
   * Fetch a flow execution by SID.
   *
   * @param flowSid - Flow SID
   * @param executionSid - Execution SID
   * @returns Execution instance
   */
  async fetchExecution(flowSid: string, executionSid: string): Promise<any> {
    return this.client.studio.v2
      .flows(flowSid)
      .executions(executionSid)
      .fetch();
  }

  /**
   * List flow executions.
   *
   * @param flowSid - Flow SID
   * @param params - Optional filter parameters
   * @returns List of execution instances
   */
  async listExecutions(
    flowSid: string,
    params?: {
      dateCreatedFrom?: Date;
      dateCreatedTo?: Date;
      limit?: number;
    },
  ): Promise<any[]> {
    const flow = this.client.studio.v2.flows(flowSid);
    return (flow.executions as any).list(params || {});
  }

  /**
   * Update a flow execution.
   *
   * @param flowSid - Flow SID
   * @param executionSid - Execution SID
   * @param status - Status to update to ('ended')
   * @returns Updated execution instance
   */
  async updateExecution(flowSid: string, executionSid: string, status: 'ended'): Promise<any> {
    return this.client.studio.v2
      .flows(flowSid)
      .executions(executionSid)
      .update({ status });
  }

  /**
   * Fetch a flow by SID.
   *
   * @param flowSid - Flow SID
   * @returns Flow instance
   */
  async fetchFlow(flowSid: string): Promise<any> {
    return this.client.studio.v2.flows(flowSid).fetch();
  }

  /**
   * List all flows.
   *
   * @param params - Optional filter parameters
   * @returns List of flow instances
   */
  async listFlows(params?: {
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.studio.v2.flows.list>>> {
    return this.client.studio.v2.flows.list(params || {});
  }
}

