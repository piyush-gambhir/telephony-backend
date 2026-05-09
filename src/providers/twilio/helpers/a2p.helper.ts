import { Injectable, Logger } from '@nestjs/common';
import { TwilioHttpHelper } from './twilio-http.helper';

/**
 * Manage A2P 10DLC (Application-to-Person) compliance for US messaging.
 * Handles Brand registration, Campaign creation, and linking to Messaging Services.
 *
 * @docs https://www.twilio.com/docs/a2p-10dlc
 * @docs https://www.twilio.com/docs/a2p-brand-registration/api
 * @docs https://www.twilio.com/docs/a2p-campaign-management/api
 */
@Injectable()
export class A2pHelper {
  private readonly logger = new Logger(A2pHelper.name);
  private readonly baseUrl = 'https://messaging.twilio.com/v1';

  constructor(private readonly httpHelper: TwilioHttpHelper) {}

  /**
   * Create an A2P Brand (business identity).
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param params - Brand parameters
   * @returns Created Brand
   */
  async createBrand(
    accountSid: string,
    authToken: string,
    params: {
      customerProfileBundleSid: string;
      brandType?: 'STANDARD' | 'STARTER';
      mock?: boolean;
      skipAutomaticSecVet?: boolean;
    },
  ): Promise<any> {
    const formData = this.httpHelper.toFormData({
      CustomerProfileBundleSid: params.customerProfileBundleSid,
      BrandType: params.brandType || 'STANDARD',
      Mock: params.mock ? 'true' : 'false',
      SkipAutomaticSecVet: params.skipAutomaticSecVet ? 'true' : 'false',
    });

    return this.httpHelper.post(
      this.baseUrl,
      'A2P/BrandRegistrations',
      accountSid,
      authToken,
      formData,
    );
  }

  /**
   * Fetch a Brand by SID.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param brandSid - Brand SID
   * @returns Brand
   */
  async fetchBrand(
    accountSid: string,
    authToken: string,
    brandSid: string,
  ): Promise<any> {
    return this.httpHelper.get(
      this.baseUrl,
      `A2P/BrandRegistrations/${brandSid}`,
      accountSid,
      authToken,
    );
  }

  /**
   * List Brands.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param params - Optional filter parameters
   * @returns List of Brands
   */
  async listBrands(
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
      `A2P/BrandRegistrations${queryParams}`,
      accountSid,
      authToken,
    );
  }

  /**
   * Create an A2P Campaign.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param params - Campaign parameters
   * @returns Created Campaign
   */
  async createCampaign(
    accountSid: string,
    authToken: string,
    params: {
      brandRegistrationSid: string;
      campaignName: string;
      campaignUseCase: string;
      messagingServiceSid: string;
      description?: string;
      sampleMessages?: string[];
      hasEmbeddedLinks?: boolean;
      hasEmbeddedPhone?: boolean;
      optInKeywords?: string[];
      optInMessage?: string;
      optOutKeywords?: string[];
      optOutMessage?: string;
      helpKeywords?: string[];
      helpMessage?: string;
    },
  ): Promise<any> {
    const formData = this.httpHelper.toFormData({
      BrandRegistrationSid: params.brandRegistrationSid,
      CampaignName: params.campaignName,
      CampaignUseCase: params.campaignUseCase,
      MessagingServiceSid: params.messagingServiceSid,
      Description: params.description,
      SampleMessages: params.sampleMessages?.join(','),
      HasEmbeddedLinks: params.hasEmbeddedLinks ? 'true' : 'false',
      HasEmbeddedPhone: params.hasEmbeddedPhone ? 'true' : 'false',
      OptInKeywords: params.optInKeywords?.join(','),
      OptInMessage: params.optInMessage,
      OptOutKeywords: params.optOutKeywords?.join(','),
      OptOutMessage: params.optOutMessage,
      HelpKeywords: params.helpKeywords?.join(','),
      HelpMessage: params.helpMessage,
    });

    return this.httpHelper.post(
      this.baseUrl,
      'A2P/BrandRegistrations/Campaigns',
      accountSid,
      authToken,
      formData,
    );
  }

  /**
   * Fetch a Campaign by SID.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param campaignSid - Campaign SID
   * @returns Campaign
   */
  async fetchCampaign(
    accountSid: string,
    authToken: string,
    campaignSid: string,
  ): Promise<any> {
    return this.httpHelper.get(
      this.baseUrl,
      `A2P/BrandRegistrations/Campaigns/${campaignSid}`,
      accountSid,
      authToken,
    );
  }

  /**
   * List Campaigns for a Brand.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param brandSid - Brand SID
   * @param params - Optional filter parameters
   * @returns List of Campaigns
   */
  async listCampaigns(
    accountSid: string,
    authToken: string,
    brandSid: string,
    params?: {
      limit?: number;
    },
  ): Promise<any> {
    const queryParams = params
      ? `?${this.httpHelper.toFormData(params)}`
      : '';
    return this.httpHelper.get(
      this.baseUrl,
      `A2P/BrandRegistrations/${brandSid}/Campaigns${queryParams}`,
      accountSid,
      authToken,
    );
  }

  /**
   * Get campaign verification status and throughput information.
   *
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param campaignSid - Campaign SID
   * @returns Campaign with verification info
   */
  async getCampaignVerification(
    accountSid: string,
    authToken: string,
    campaignSid: string,
  ): Promise<any> {
    const campaign = await this.fetchCampaign(
      accountSid,
      authToken,
      campaignSid,
    );
    return {
      sid: campaign.sid,
      status: campaign.campaign_status,
      campaignName: campaign.campaign_name,
      brandRegistrationSid: campaign.brand_registration_sid,
      messagingServiceSid: campaign.messaging_service_sid,
      usAppToPersonUsecase: campaign.us_app_to_person_usecase,
      dateCreated: campaign.date_created,
      dateUpdated: campaign.date_updated,
    };
  }
}

