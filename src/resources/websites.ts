/**
 * Websites resource for the Lindo SDK
 *
 * Provides methods for managing workspace websites (API key authentication).
 *
 * @satisfies Requirements 25.3
 */

import { HttpClient } from '../http';
import type {
  WebsiteListResponse,
  WebsiteUpdateRequest,
  WebsiteUpdateResponse,
  WebsiteDeleteResponse,
  WebsiteAssignRequest,
  WebsiteAssignResponse,
  // Extended website types
  WebsiteDetailsResponse,
  WebsiteSettingsUpdateRequest,
  WebsiteSettingsUpdateResponse,
  WebsiteDomainAddResponse,
  WebsiteDomainRemoveResponse,
  WebsiteIntegrationAddRequest,
  WebsiteIntegrationAddResponse,
  WebsiteIntegrationRemoveResponse,
  WebsiteTeamMemberAddResponse,
  WebsiteTeamMemberRemoveResponse,
} from '../types';

/**
 * Resource class for website management operations.
 *
 * These endpoints require API key authentication.
 *
 * @example
 * ```typescript
 * // List all websites
 * const websites = await client.websites.list();
 *
 * // Get website details
 * const details = await client.websites.getDetails('website-123');
 *
 * // Update website settings
 * await client.websites.updateSettings('website-123', {
 *   business_name: 'My Business',
 *   language: 'en'
 * });
 *
 * // Add a custom domain
 * const domainResult = await client.websites.addDomain('website-123', 'example.com');
 * console.log(domainResult.result.dns_records);
 *
 * // Add an integration
 * await client.websites.addIntegration('website-123', {
 *   integration_type: 'matomo',
 *   config: { site_id: '123', url: 'https://analytics.example.com' }
 * });
 *
 * // Add a team member
 * await client.websites.addTeamMember('website-123', 'user@example.com', 'Editor');
 * ```
 */
export class WebsitesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all workspace websites.
   *
   * @param options - Optional pagination and search parameters
   * @returns The website list response
   *
   * @example
   * ```typescript
   * const response = await client.websites.list({ page: 1, search: 'example' });
   * for (const w of response.websites) {
   *   console.log(w.business_name);
   * }
   * ```
   */
  async list(options?: { page?: number; search?: string }): Promise<WebsiteListResponse> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (options?.page !== undefined) params.page = options.page;
    if (options?.search !== undefined) params.search = options.search;

    return this.http.get<WebsiteListResponse>('/v1/workspace/website/list', { params });
  }

  /**
   * Update a website.
   *
   * @param request - The website update request
   * @returns The website update response
   *
   * @example
   * ```typescript
   * const response = await client.websites.update({
   *   website_id: 'website-123',
   *   business_name: 'My Business',
   *   activated: true
   * });
   * ```
   */
  async update(request: WebsiteUpdateRequest): Promise<WebsiteUpdateResponse> {
    return this.http.put<WebsiteUpdateResponse>('/v1/workspace/website/update', request);
  }

  /**
   * Delete a website.
   *
   * @param websiteId - The website ID to delete
   * @returns The website deletion response
   *
   * @example
   * ```typescript
   * const response = await client.websites.delete('website-123');
   * if (response.success) {
   *   console.log('Website deleted');
   * }
   * ```
   */
  async delete(websiteId: string): Promise<WebsiteDeleteResponse> {
    return this.http.delete<WebsiteDeleteResponse>('/v1/workspace/website/delete', { website_id: websiteId });
  }

  /**
   * Assign a website to a client.
   *
   * @param request - The website assignment request
   * @returns The website assignment response
   *
   * @example
   * ```typescript
   * const response = await client.websites.assign({
   *   website_id: 'website-123',
   *   client_id: 'client-456'
   * });
   * ```
   */
  async assign(request: WebsiteAssignRequest): Promise<WebsiteAssignResponse> {
    return this.http.post<WebsiteAssignResponse>('/v1/workspace/website/assign', request);
  }

  // ==========================================================================
  // Extended Website Management Methods
  // Requirements: 25.3
  // ==========================================================================

  /**
   * Get detailed information about a specific website.
   *
   * Returns website details including business name, domain, integrations, theme, and settings.
   * Sensitive fields like cf_domain_id and account_id are filtered from the response.
   *
   * @param websiteId - The website ID to retrieve details for
   * @returns The website details response
   *
   * @example
   * ```typescript
   * const response = await client.websites.getDetails('website-123');
   * console.log(response.result.business_name);
   * console.log(response.result.custom_domain);
   * console.log(response.result.integrations);
   * ```
   */
  async getDetails(websiteId: string): Promise<WebsiteDetailsResponse> {
    return this.http.get<WebsiteDetailsResponse>(`/v1/workspace/website/${websiteId}`);
  }

  /**
   * Update website settings.
   *
   * Allows updating business name, description, language, theme, robots.txt,
   * custom code, social links, and fonts.
   *
   * @param websiteId - The website ID to update
   * @param settings - The settings to update
   * @returns The settings update response
   *
   * @example
   * ```typescript
   * const response = await client.websites.updateSettings('website-123', {
   *   business_name: 'My Updated Business',
   *   language: 'en',
   *   theme: { primary_color: '#007bff' },
   *   socials: { twitter: 'https://twitter.com/mybusiness' }
   * });
   * console.log(response.result.message);
   * ```
   */
  async updateSettings(
    websiteId: string,
    settings: WebsiteSettingsUpdateRequest
  ): Promise<WebsiteSettingsUpdateResponse> {
    return this.http.put<WebsiteSettingsUpdateResponse>(
      `/v1/workspace/website/${websiteId}/settings`,
      settings
    );
  }

  /**
   * Add a custom domain to a website.
   *
   * Initiates custom domain setup and returns agent-ready DNS records
   * that need to be configured at the domain registrar.
   *
   * @param websiteId - The website ID to add the domain to
   * @param domain - The custom domain to add
   * @returns The domain add response with DNS records and instructions
   *
   * @example
   * ```typescript
   * const response = await client.websites.addDomain('website-123', 'example.com');
   * console.log('Domain:', response.result.domain);
   * console.log('Instructions:', response.result.instructions);
   * for (const record of response.result.dns_records) {
   *   console.log(`${record.record_type} ${record.host} -> ${record.value}`);
   * }
   * ```
   */
  async addDomain(websiteId: string, domain: string): Promise<WebsiteDomainAddResponse> {
    return this.http.post<WebsiteDomainAddResponse>(
      `/v1/workspace/website/${websiteId}/domain`,
      { domain }
    );
  }

  /**
   * Remove a custom domain from a website.
   *
   * Removes the custom domain configuration, reverting to the default domain.
   *
   * @param websiteId - The website ID to remove the domain from
   * @returns The domain remove response
   *
   * @example
   * ```typescript
   * const response = await client.websites.removeDomain('website-123');
   * console.log(response.result.message);
   * ```
   */
  async removeDomain(websiteId: string): Promise<WebsiteDomainRemoveResponse> {
    return this.http.delete<WebsiteDomainRemoveResponse>(
      `/v1/workspace/website/${websiteId}/domain`
    );
  }

  /**
   * Add an integration to a website.
   *
   * Adds an external service integration (e.g., Matomo analytics) to the website.
   *
   * @param websiteId - The website ID to add the integration to
   * @param integration - The integration configuration
   * @returns The integration add response with updated integrations
   *
   * @example
   * ```typescript
   * const response = await client.websites.addIntegration('website-123', {
   *   integration_type: 'matomo',
   *   config: {
   *     site_id: '12345',
   *     url: 'https://analytics.example.com'
   *   }
   * });
   * console.log(response.result.integrations);
   * ```
   */
  async addIntegration(
    websiteId: string,
    integration: WebsiteIntegrationAddRequest
  ): Promise<WebsiteIntegrationAddResponse> {
    return this.http.post<WebsiteIntegrationAddResponse>(
      `/v1/workspace/website/${websiteId}/integration`,
      integration
    );
  }

  /**
   * Remove an integration from a website.
   *
   * Removes the specified integration type from the website.
   *
   * @param websiteId - The website ID to remove the integration from
   * @param integrationType - The type of integration to remove (e.g., 'matomo')
   * @returns The integration remove response
   *
   * @example
   * ```typescript
   * const response = await client.websites.removeIntegration('website-123', 'matomo');
   * console.log(response.result.message);
   * ```
   */
  async removeIntegration(
    websiteId: string,
    integrationType: string
  ): Promise<WebsiteIntegrationRemoveResponse> {
    return this.http.delete<WebsiteIntegrationRemoveResponse>(
      `/v1/workspace/website/${websiteId}/integration/${integrationType}`
    );
  }

  /**
   * Add a team member to a website.
   *
   * Grants access to a user with the specified role (Editor or Commenter).
   *
   * @param websiteId - The website ID to add the team member to
   * @param email - The email address of the team member to add
   * @param role - The role to assign ('Editor' or 'Commenter')
   * @returns The team member add response with member details
   *
   * @example
   * ```typescript
   * const response = await client.websites.addTeamMember(
   *   'website-123',
   *   'user@example.com',
   *   'Editor'
   * );
   * console.log('Added member:', response.result.member_id);
   * console.log('Role:', response.result.role);
   * ```
   */
  async addTeamMember(
    websiteId: string,
    email: string,
    role: 'Editor' | 'Commenter'
  ): Promise<WebsiteTeamMemberAddResponse> {
    return this.http.post<WebsiteTeamMemberAddResponse>(
      `/v1/workspace/website/${websiteId}/team`,
      { email, role }
    );
  }

  /**
   * Remove a team member from a website.
   *
   * Revokes access for the specified team member.
   *
   * @param websiteId - The website ID to remove the team member from
   * @param memberId - The member ID to remove
   * @returns The team member remove response
   *
   * @example
   * ```typescript
   * const response = await client.websites.removeTeamMember('website-123', 'member-456');
   * console.log(response.result.message);
   * ```
   */
  async removeTeamMember(
    websiteId: string,
    memberId: string
  ): Promise<WebsiteTeamMemberRemoveResponse> {
    return this.http.delete<WebsiteTeamMemberRemoveResponse>(
      `/v1/workspace/website/${websiteId}/team/${memberId}`
    );
  }

  /**
   * Get the list of team members for a website.
   *
   * Returns all team members with their roles and creation dates.
   *
   * @param websiteId - The website ID to get team members for
   * @returns The team list response
   *
   * @example
   * ```typescript
   * const response = await client.websites.getTeam('website-123');
   * for (const member of response.result.list) {
   *   console.log(member.email, member.role);
   * }
   * ```
   */
  async getTeam(websiteId: string): Promise<{ success: true; result: { list: Array<{ member_id: string; email: string; role: string; created_date: string }>; total: number } }> {
    return this.http.get(`/v1/workspace/website/${websiteId}/team`);
  }

  /**
   * Get analytics data for a website.
   *
   * Returns website-level analytics including traffic, visitors, and performance metrics.
   *
   * @param websiteId - The website ID to get analytics for
   * @param options - Optional date range parameters
   * @returns The website analytics response
   *
   * @example
   * ```typescript
   * const response = await client.websites.getAnalytics('website-123');
   * console.log('Total requests:', response.result.total_requests);
   * console.log('Total visitors:', response.result.total_visitors);
   * ```
   */
  async getAnalytics(websiteId: string, options?: { from?: string; to?: string }): Promise<{ success: true; result: Record<string, unknown> }> {
    const params: Record<string, string> = {};
    if (options?.from) params.from = options.from;
    if (options?.to) params.to = options.to;
    return this.http.get(`/v1/workspace/website/${websiteId}/analytics`, { params: Object.keys(params).length > 0 ? params : undefined });
  }
}
