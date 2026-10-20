/**
 * Workspace resource for the Lindo SDK
 *
 * Provides methods for workspace operations.
 *
 * @satisfies Requirements 5.2, 25.4
 */

import type { HttpClient, RequestOptions } from '../http';
import type {
  WorkspaceCreditsResponse,
  ClientCreditsResponse,
  AllocateClientCreditsRequest,
  AllocateClientCreditsResponse,
  WorkspaceDetailsResponse,
  WorkspaceUpdateRequest,
  WorkspaceUpdateResponse,
  WorkspaceTeamMemberAddResponse,
  WorkspaceTeamMemberRemoveResponse,
  WorkspaceIntegrationAddRequest,
  WorkspaceIntegrationAddResponse,
  WorkspaceIntegrationRemoveResponse,
  WorkspaceWhitelabelRequest,
  WorkspaceWhitelabelResponse,
  WorkspaceAppearanceRequest,
  WorkspaceAppearanceResponse,
} from '../types';

/**
 * Resource class for workspace operations.
 *
 * Provides methods for managing workspace settings, team members, integrations,
 * whitelabel configuration, and appearance settings.
 *
 * @example
 * ```typescript
 * // Get workspace details
 * const details = await client.workspace.get();
 * console.log(details.result.workspace_name);
 *
 * // Update workspace settings
 * await client.workspace.update({
 *   workspace_name: 'My Workspace',
 *   webhook_url: 'https://example.com/webhook'
 * });
 *
 * // Add a team member
 * await client.workspace.addTeamMember('user@example.com', 'Team');
 *
 * // Setup whitelabel
 * await client.workspace.setupWhitelabel({
 *   domain: 'app.example.com',
 *   email_sender: 'noreply@example.com'
 * });
 * ```
 */
export class WorkspaceResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Gets the workspace's credit balance (monthly, purchased, daily).
   *
   * @example
   * ```typescript
   * const credits = await client.workspace.getCredits();
   * if (credits.result) {
   *   console.log('Available:', credits.result.balance.current_balance.total_available);
   * }
   * ```
   */
  async getCredits(): Promise<WorkspaceCreditsResponse> {
    return this.http.get<WorkspaceCreditsResponse>('/v1/ai/credits');
  }

  /**
   * Gets a client's credit balance.
   *
   * @param clientId - The client ID to get credits for
   * @returns The client credits information
   *
   * @example
   * ```typescript
   * const credits = await client.workspace.getClientCredits('client-123');
   * if (credits.result) {
   *   console.log('Client balance:', credits.result.balance.current_balance.total_available);
   * }
   * ```
   */
  async getClientCredits(clientId: string): Promise<ClientCreditsResponse> {
    const options: RequestOptions = { params: { client_id: clientId } };
    return this.http.get<ClientCreditsResponse>('/v1/ai/credits/client', options);
  }

  /**
   * Allocates credits from the workspace to a client.
   *
   * @example
   * ```typescript
   * const result = await client.workspace.allocateClientCredits({
   *   client_id: 'client-123',
   *   credit_type: 'purchased',
   *   amount: 100,
   * });
   * ```
   */
  async allocateClientCredits(
    request: AllocateClientCreditsRequest
  ): Promise<AllocateClientCreditsResponse> {
    return this.http.post<AllocateClientCreditsResponse>(
      '/v1/ai/credits/client/allocate',
      request,
    );
  }

  // ==========================================================================
  // Extended Workspace Management Methods
  // Requirements: 25.4
  // ==========================================================================

  /**
   * Get detailed information about the current workspace.
   *
   * Returns workspace details including name, email, plan, integrations,
   * whitelabel settings, and appearance configuration.
   * Sensitive fields like stripe_id and subscription_id are filtered from the response.
   *
   * @returns The workspace details response
   *
   * @example
   * ```typescript
   * const response = await client.workspace.get();
   * console.log('Workspace:', response.result.workspace_name);
   * console.log('Plan:', response.result.plan);
   * console.log('Whitelabel enabled:', response.result.whitelabel.enabled);
   * console.log('Primary color:', response.result.appearance.primary_color);
   * ```
   */
  async get(): Promise<WorkspaceDetailsResponse> {
    return this.http.get<WorkspaceDetailsResponse>('/v1/workspace');
  }

  /**
   * Update workspace settings.
   *
   * Allows updating workspace_name, workspace_language, and webhook_url.
   *
   * @param fields - The fields to update
   * @returns The workspace update response
   *
   * @example
   * ```typescript
   * const response = await client.workspace.update({
   *   workspace_name: 'My Updated Workspace',
   *   workspace_language: 'en',
   *   webhook_url: 'https://example.com/webhook'
   * });
   * console.log(response.result.message);
   * console.log('Updated name:', response.result.workspace_name);
   * ```
   */
  async update(fields: WorkspaceUpdateRequest): Promise<WorkspaceUpdateResponse> {
    return this.http.put<WorkspaceUpdateResponse>('/v1/workspace', fields);
  }

  /**
   * Add a team member to the workspace.
   *
   * Grants workspace-level access to a user with the 'Team' role.
   *
   * @param email - The email address of the team member to add
   * @param role - The role to assign (must be 'Team' for workspace-level access)
   * @returns The team member add response with member details
   *
   * @example
   * ```typescript
   * const response = await client.workspace.addTeamMember('user@example.com', 'Team');
   * console.log('Added member:', response.result.member_id);
   * console.log('Email:', response.result.email);
   * console.log('Role:', response.result.role);
   * ```
   */
  async addTeamMember(email: string, role: 'Team'): Promise<WorkspaceTeamMemberAddResponse> {
    return this.http.post<WorkspaceTeamMemberAddResponse>('/v1/workspace/team', { email, role });
  }

  /**
   * Remove a team member from the workspace.
   *
   * Revokes workspace-level access for the specified team member.
   *
   * @param memberId - The member ID to remove
   * @returns The team member remove response
   *
   * @example
   * ```typescript
   * const response = await client.workspace.removeTeamMember('member-456');
   * console.log(response.result.message);
   * ```
   */
  async removeTeamMember(memberId: string): Promise<WorkspaceTeamMemberRemoveResponse> {
    return this.http.delete<WorkspaceTeamMemberRemoveResponse>(`/v1/workspace/team/${memberId}`);
  }

  /**
   * Get the list of team members in the workspace.
   *
   * Returns all team members with their roles and creation dates.
   *
   * @returns The team list response
   *
   * @example
   * ```typescript
   * const response = await client.workspace.getTeam();
   * for (const member of response.result.list) {
   *   console.log(member.email, member.role);
   * }
   * ```
   */
  async getTeam(): Promise<{ success: true; result: { list: Array<{ member_id: string; email: string; role: string; created_date: string }>; total: number } }> {
    return this.http.get('/v1/workspace/team');
  }

  /**
   * Get analytics data for the workspace.
   *
   * Returns workspace-level analytics including traffic, visitors, and performance metrics.
   *
   * @param options - Optional date range parameters
   * @returns The workspace analytics response
   *
   * @example
   * ```typescript
   * const response = await client.workspace.getAnalytics();
   * console.log('Total requests:', response.result.total_requests);
   * console.log('Total visitors:', response.result.total_visitors);
   * ```
   */
  async getAnalytics(options?: { from?: string; to?: string }): Promise<{ success: true; result: Record<string, unknown> }> {
    const params: Record<string, string> = {};
    if (options?.from) params.from = options.from;
    if (options?.to) params.to = options.to;
    return this.http.get('/v1/workspace/analytics', { params: Object.keys(params).length > 0 ? params : undefined });
  }

  /**
   * Add an integration to the workspace.
   *
   * Adds an external service integration (e.g., Matomo analytics) at the workspace level.
   *
   * @param integration - The integration configuration
   * @returns The integration add response with updated integrations
   *
   * @example
   * ```typescript
   * const response = await client.workspace.addIntegration({
   *   integration_type: 'matomo',
   *   config: {
   *     site_id: '12345',
   *     url: 'https://analytics.example.com'
   *   }
   * });
   * console.log(response.result.message);
   * console.log(response.result.integrations);
   * ```
   */
  async addIntegration(
    integration: WorkspaceIntegrationAddRequest
  ): Promise<WorkspaceIntegrationAddResponse> {
    return this.http.post<WorkspaceIntegrationAddResponse>('/v1/workspace/integration', integration);
  }

  /**
   * Remove an integration from the workspace.
   *
   * Removes the specified integration type from the workspace.
   *
   * @param integrationType - The type of integration to remove (e.g., 'matomo')
   * @returns The integration remove response
   *
   * @example
   * ```typescript
   * const response = await client.workspace.removeIntegration('matomo');
   * console.log(response.result.message);
   * ```
   */
  async removeIntegration(integrationType: string): Promise<WorkspaceIntegrationRemoveResponse> {
    return this.http.delete<WorkspaceIntegrationRemoveResponse>(
      `/v1/workspace/integration/${integrationType}`
    );
  }

  /**
   * Setup or update workspace whitelabel settings.
   *
   * Configures whitelabel branding including custom domain, subdomain domain,
   * email sender, and client registration settings.
   * Requires a plan that supports whitelabel features.
   *
   * @param config - The whitelabel configuration
   * @returns The whitelabel update response
   *
   * @example
   * ```typescript
   * const response = await client.workspace.setupWhitelabel({
   *   domain: 'app.example.com',
   *   subdomain_domain: 'clients.example.com',
   *   email_sender: 'noreply@example.com',
   *   wl_client_register: true
   * });
   * console.log(response.result.message);
   * console.log('Domain:', response.result.whitelabel.domain);
   * ```
   */
  async setupWhitelabel(config: WorkspaceWhitelabelRequest): Promise<WorkspaceWhitelabelResponse> {
    return this.http.put<WorkspaceWhitelabelResponse>('/v1/workspace/whitelabel', config);
  }

  /**
   * Update workspace appearance settings.
   *
   * Configures visual branding including primary and secondary colors,
   * theme mode, and custom code for header and footer.
   *
   * @param config - The appearance configuration
   * @returns The appearance update response
   *
   * @example
   * ```typescript
   * const response = await client.workspace.updateAppearance({
   *   primary_color: '#007bff',
   *   secondary_color: '#6c757d',
   *   theme_mode: 'light',
   *   custom_code_header: '<script>console.log("header")</script>',
   *   custom_code_footer: '<script>console.log("footer")</script>'
   * });
   * console.log(response.result.message);
   * console.log('Primary color:', response.result.appearance.primary_color);
   * ```
   */
  async updateAppearance(config: WorkspaceAppearanceRequest): Promise<WorkspaceAppearanceResponse> {
    return this.http.put<WorkspaceAppearanceResponse>('/v1/workspace/appearance', config);
  }
}
