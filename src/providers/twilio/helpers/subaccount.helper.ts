import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

/**
 * Subaccount management.
 * Handles creating, listing, and managing subaccounts.
 *
 * @docs https://www.twilio.com/docs/usage/api/subaccounts
 */
@Injectable()
export class SubaccountHelper {
  private readonly logger = new Logger(SubaccountHelper.name);

  constructor(private readonly client: Twilio.Twilio) {}

  /**
   * Create a new subaccount.
   *
   * @param friendlyName - Friendly name for the subaccount
   * @returns Created subaccount instance
   */
  async createSubaccount(
    friendlyName: string,
  ): Promise<Awaited<ReturnType<typeof this.client.api.accounts.create>>> {
    this.logger.debug(
      `[SubaccountHelper] Creating subaccount with friendlyName: ${friendlyName}`,
    );
    const params = { friendlyName };
    this.logger.debug(
      `[SubaccountHelper] Preparing API call parameters: ${JSON.stringify(params)}`,
    );

    try {
      const result = await this.client.api.accounts.create(params);
      this.logger.debug(`[SubaccountHelper] Subaccount created successfully: ${result.sid}`);
      this.logger.debug(
        `[SubaccountHelper] Subaccount details: ${JSON.stringify({
          sid: result.sid,
          friendlyName: result.friendlyName,
          status: result.status,
          type: result.type,
        })}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`[SubaccountHelper] Failed to create subaccount: ${error.message}`);
      this.logger.error(`[SubaccountHelper] Error details: ${JSON.stringify(error)}`);
      this.logger.error(`[SubaccountHelper] API parameters used: ${JSON.stringify(params)}`);
      throw error;
    }
  }

  /**
   * Fetch a subaccount by SID.
   *
   * @param accountSid - Subaccount SID
   * @returns Subaccount instance
   */
  async fetchSubaccount(
    accountSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.api.accounts>['fetch']>>> {
    this.logger.debug(`[SubaccountHelper] Fetching subaccount: ${accountSid}`);

    try {
      const result = await this.client.api.accounts(accountSid).fetch();
      this.logger.debug(`[SubaccountHelper] Subaccount fetched successfully: ${result.sid}`);
      this.logger.debug(
        `[SubaccountHelper] Subaccount status: ${result.status}, friendlyName: ${result.friendlyName}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `[SubaccountHelper] Failed to fetch subaccount ${accountSid}: ${error.message}`,
      );
      this.logger.error(`[SubaccountHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * List all subaccounts.
   *
   * @param params - Optional filter parameters
   * @returns List of subaccount instances
   */
  async listSubaccounts(params?: {
    status?: 'active' | 'suspended' | 'closed';
    friendlyName?: string;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof this.client.api.accounts.list>>> {
    this.logger.debug(
      `[SubaccountHelper] Listing subaccounts with params: ${JSON.stringify(params)}`,
    );

    try {
      const result = await this.client.api.accounts.list(params || {});
      this.logger.debug(`[SubaccountHelper] Found ${result.length} subaccounts`);
      result.forEach((account, index) => {
        this.logger.debug(
          `[SubaccountHelper] Subaccount ${index + 1}: ${account.sid} - ${account.friendlyName} (${account.status})`,
        );
      });
      return result;
    } catch (error) {
      this.logger.error(`[SubaccountHelper] Failed to list subaccounts: ${error.message}`);
      this.logger.error(`[SubaccountHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Update a subaccount.
   *
   * @param accountSid - Subaccount SID
   * @param params - Update parameters
   * @returns Updated subaccount instance
   */
  async updateSubaccount(
    accountSid: string,
    params: {
      friendlyName?: string;
      status?: 'active' | 'suspended' | 'closed';
    },
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.api.accounts>['update']>>> {
    this.logger.debug(
      `[SubaccountHelper] Updating subaccount ${accountSid} with: ${JSON.stringify(params)}`,
    );

    try {
      const result = await this.client.api.accounts(accountSid).update(params);
      this.logger.debug(`[SubaccountHelper] Subaccount updated successfully: ${result.sid}`);
      this.logger.debug(
        `[SubaccountHelper] New status: ${result.status}, friendlyName: ${result.friendlyName}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `[SubaccountHelper] Failed to update subaccount ${accountSid}: ${error.message}`,
      );
      this.logger.error(`[SubaccountHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Suspend a subaccount.
   *
   * @param accountSid - Subaccount SID
   * @returns Updated subaccount instance
   */
  async suspendSubaccount(
    accountSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.api.accounts>['update']>>> {
    this.logger.debug(`[SubaccountHelper] Suspending subaccount: ${accountSid}`);

    try {
      const result = await this.client.api.accounts(accountSid).update({ status: 'suspended' });
      this.logger.debug(`[SubaccountHelper] Subaccount suspended successfully: ${result.sid}`);
      return result;
    } catch (error) {
      this.logger.error(
        `[SubaccountHelper] Failed to suspend subaccount ${accountSid}: ${error.message}`,
      );
      this.logger.error(`[SubaccountHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Reactivate a suspended subaccount.
   *
   * @param accountSid - Subaccount SID
   * @returns Updated subaccount instance
   */
  async activateSubaccount(
    accountSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.api.accounts>['update']>>> {
    this.logger.debug(`[SubaccountHelper] Activating subaccount: ${accountSid}`);

    try {
      const result = await this.client.api.accounts(accountSid).update({ status: 'active' });
      this.logger.debug(`[SubaccountHelper] Subaccount activated successfully: ${result.sid}`);
      return result;
    } catch (error) {
      this.logger.error(
        `[SubaccountHelper] Failed to activate subaccount ${accountSid}: ${error.message}`,
      );
      this.logger.error(`[SubaccountHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Close a subaccount.
   *
   * @param accountSid - Subaccount SID
   * @returns Updated subaccount instance
   */
  async closeSubaccount(
    accountSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.api.accounts>['update']>>> {
    this.logger.debug(`[SubaccountHelper] Closing subaccount: ${accountSid}`);

    try {
      const result = await this.client.api.accounts(accountSid).update({ status: 'closed' });
      this.logger.debug(`[SubaccountHelper] Subaccount closed successfully: ${result.sid}`);
      return result;
    } catch (error) {
      this.logger.error(
        `[SubaccountHelper] Failed to close subaccount ${accountSid}: ${error.message}`,
      );
      this.logger.error(`[SubaccountHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Transfer a phone number from one account to another.
   *
   * @param phoneNumberSid - Phone number SID to transfer
   * @param targetAccountSid - Target account SID
   * @returns Updated phone number instance
   */
  async transferPhoneNumber(
    phoneNumberSid: string,
    targetAccountSid: string,
  ): Promise<Awaited<ReturnType<ReturnType<typeof this.client.incomingPhoneNumbers>['update']>>> {
    this.logger.debug(
      `[SubaccountHelper] Transferring phone number ${phoneNumberSid} to account ${targetAccountSid}`,
    );

    try {
      const result = await this.client
        .incomingPhoneNumbers(phoneNumberSid)
        .update({ accountSid: targetAccountSid });
      this.logger.debug(
        `[SubaccountHelper] Phone number transferred successfully: ${result.sid} to account ${result.accountSid}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `[SubaccountHelper] Failed to transfer phone number ${phoneNumberSid}: ${error.message}`,
      );
      this.logger.error(`[SubaccountHelper] Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
