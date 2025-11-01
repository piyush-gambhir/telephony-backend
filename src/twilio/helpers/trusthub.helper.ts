import { Injectable, Logger } from '@nestjs/common';
import { TwilioHttpHelper } from './twilio-http.helper';

/**
 * Manage Customer (Business) Profiles for regulatory compliance.
 * Handles TrustHub Customer Profiles, documents, and verification status.
 *
 * @docs https://www.twilio.com/docs/trusthub
 * @docs https://www.twilio.com/docs/trusthub/customer-profiles
 */
@Injectable()
export class TrustHubHelper {
  private readonly logger = new Logger(TrustHubHelper.name);
  private readonly baseUrl = 'https://trusthub.twilio.com/v1';

  constructor(private readonly httpHelper: TwilioHttpHelper) {}

  /**
   * Create a Customer Profile (Business Profile).
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param params - Customer Profile parameters
   * @returns Created Customer Profile
   */
  async createCustomerProfile(
    accountSid: string,
    authToken: string,
    params: {
      friendlyName: string;
      email: string;
      policySid?: string;
      statusCallback?: string;
    },
  ): Promise<any> {
    const formData = this.httpHelper.toFormData({
      FriendlyName: params.friendlyName,
      Email: params.email,
      PolicySid: params.policySid,
      StatusCallback: params.statusCallback,
    });

    return this.httpHelper.post(
      this.baseUrl,
      'CustomerProfiles',
      accountSid,
      authToken,
      formData,
    );
  }

  /**
   * Fetch a Customer Profile by SID.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param customerProfileSid - Customer Profile SID
   * @returns Customer Profile
   */
  async fetchCustomerProfile(
    accountSid: string,
    authToken: string,
    customerProfileSid: string,
  ): Promise<any> {
    return this.httpHelper.get(
      this.baseUrl,
      `CustomerProfiles/${customerProfileSid}`,
      accountSid,
      authToken,
    );
  }

  /**
   * List Customer Profiles.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param params - Optional filter parameters
   * @returns List of Customer Profiles
   */
  async listCustomerProfiles(
    accountSid: string,
    authToken: string,
    params?: {
      status?: 'draft' | 'pending-review' | 'twilio-rejected' | 'twilio-approved';
      friendlyName?: string;
      limit?: number;
    },
  ): Promise<any> {
    const queryParams = params
      ? `?${this.httpHelper.toFormData(params)}`
      : '';
    return this.httpHelper.get(
      this.baseUrl,
      `CustomerProfiles${queryParams}`,
      accountSid,
      authToken,
    );
  }

  /**
   * Update a Customer Profile.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param customerProfileSid - Customer Profile SID
   * @param params - Update parameters
   * @returns Updated Customer Profile
   */
  async updateCustomerProfile(
    accountSid: string,
    authToken: string,
    customerProfileSid: string,
    params: {
      friendlyName?: string;
      email?: string;
      statusCallback?: string;
    },
  ): Promise<any> {
    const formData = this.httpHelper.toFormData({
      FriendlyName: params.friendlyName,
      Email: params.email,
      StatusCallback: params.statusCallback,
    });

    return this.httpHelper.post(
      this.baseUrl,
      `CustomerProfiles/${customerProfileSid}`,
      accountSid,
      authToken,
      formData,
    );
  }

  /**
   * Delete a Customer Profile.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param customerProfileSid - Customer Profile SID
   * @returns True if deleted successfully
   */
  async deleteCustomerProfile(
    accountSid: string,
    authToken: string,
    customerProfileSid: string,
  ): Promise<boolean> {
    await this.httpHelper.delete(
      this.baseUrl,
      `CustomerProfiles/${customerProfileSid}`,
      accountSid,
      authToken,
    );
    return true;
  }

  /**
   * Fetch Customer Profile's verification status.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param customerProfileSid - Customer Profile SID
   * @returns Customer Profile with status
   */
  async getCustomerProfileStatus(
    accountSid: string,
    authToken: string,
    customerProfileSid: string,
  ): Promise<any> {
    const profile = await this.fetchCustomerProfile(
      accountSid,
      authToken,
      customerProfileSid,
    );
    return {
      sid: profile.sid,
      status: profile.status,
      friendlyName: profile.friendlyName,
      email: profile.email,
      dateCreated: profile.date_created,
      dateUpdated: profile.date_updated,
    };
  }

  /**
   * List all available Policies.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param params - Optional filter parameters
   * @returns List of Policies
   */
  async listPolicies(
    accountSid: string,
    authToken: string,
    params?: {
      limit?: number;
    },
  ): Promise<any> {
    const queryParams = params
      ? `?${this.httpHelper.toFormData(params)}`
      : '';
    return this.httpHelper.get(
      this.baseUrl,
      `Policies${queryParams}`,
      accountSid,
      authToken,
    );
  }

  /**
   * Fetch a Policy by SID.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param policySid - Policy SID
   * @returns Policy
   */
  async fetchPolicy(
    accountSid: string,
    authToken: string,
    policySid: string,
  ): Promise<any> {
    return this.httpHelper.get(
      this.baseUrl,
      `Policies/${policySid}`,
      accountSid,
      authToken,
    );
  }
}

