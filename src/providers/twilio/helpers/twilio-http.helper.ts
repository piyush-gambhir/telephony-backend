import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Simple Axios-based HTTP helper for unsupported or evolving endpoints.
 * Used internally by TrustHubHelper & A2pHelper.
 *
 * Base URL routing:
 * - https://api.twilio.com/2010-04-01/ (core)
 * - https://messaging.twilio.com/v1/ (A2P / MS)
 * - https://trusthub.twilio.com/v1/ (Business profiles)
 *
 * @docs https://www.twilio.com/docs/usage/api
 */
@Injectable()
export class TwilioHttpHelper {
  private readonly logger = new Logger(TwilioHttpHelper.name);
  private readonly clients: Map<string, AxiosInstance> = new Map();

  /**
   * Get or create an Axios instance for a specific base URL.
   *
   * @param baseUrl - Base URL (e.g., 'https://api.twilio.com/2010-04-01/')
   * @param accountSid - Account SID for authentication
   * @param authToken - Auth Token for authentication
   * @returns Axios instance
   */
  private getClient(
    baseUrl: string,
    accountSid: string,
    authToken: string,
  ): AxiosInstance {
    const cacheKey = `${baseUrl}:${accountSid}`;

    if (this.clients.has(cacheKey)) {
      return this.clients.get(cacheKey)!;
    }

    const client = axios.create({
      baseURL: baseUrl,
      auth: {
        username: accountSid,
        password: authToken,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    this.clients.set(cacheKey, client);
    return client;
  }

  /**
   * Make a GET request to Twilio API.
   *
   * @param baseUrl - Base URL
   * @param endpoint - API endpoint (relative to base URL)
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param config - Optional Axios config
   * @returns Response data
   */
  async get<T = any>(
    baseUrl: string,
    endpoint: string,
    accountSid: string,
    authToken: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const client = this.getClient(baseUrl, accountSid, authToken);
    const response = await client.get<T>(endpoint, config);
    return response.data;
  }

  /**
   * Make a POST request to Twilio API.
   *
   * @param baseUrl - Base URL
   * @param endpoint - API endpoint (relative to base URL)
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param data - Request body data
   * @param config - Optional Axios config
   * @returns Response data
   */
  async post<T = any>(
    baseUrl: string,
    endpoint: string,
    accountSid: string,
    authToken: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const client = this.getClient(baseUrl, accountSid, authToken);
    const response = await client.post<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a PUT request to Twilio API.
   *
   * @param baseUrl - Base URL
   * @param endpoint - API endpoint (relative to base URL)
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param data - Request body data
   * @param config - Optional Axios config
   * @returns Response data
   */
  async put<T = any>(
    baseUrl: string,
    endpoint: string,
    accountSid: string,
    authToken: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const client = this.getClient(baseUrl, accountSid, authToken);
    const response = await client.put<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request to Twilio API.
   *
   * @param baseUrl - Base URL
   * @param endpoint - API endpoint (relative to base URL)
   * @param accountSid - Account SID
   * @param authToken - Auth Token
   * @param config - Optional Axios config
   * @returns Response data
   */
  async delete<T = any>(
    baseUrl: string,
    endpoint: string,
    accountSid: string,
    authToken: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const client = this.getClient(baseUrl, accountSid, authToken);
    const response = await client.delete<T>(endpoint, config);
    return response.data;
  }

  /**
   * Convert object to URL-encoded form data string.
   *
   * @param data - Object to encode
   * @returns URL-encoded string
   */
  toFormData(data: Record<string, any>): string {
    return Object.keys(data)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(
            data[key]?.toString() || '',
          )}`,
      )
      .join('&');
  }
}

