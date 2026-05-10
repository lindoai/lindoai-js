/**
 * Clients resource for the Lindo SDK
 *
 * Provides methods for managing workspace clients (API key authentication).
 */

import { HttpClient } from '../http';
import type {
  ClientCreateRequest,
  ClientCreateResponse,
  ClientListResponse,
  ClientUpdateRequest,
  ClientUpdateResponse,
  ClientDeleteResponse,
  MagicLinkCreateRequest,
  MagicLinkCreateResponse,
} from '../types';

/**
 * Resource class for client management operations.
 *
 * These endpoints require API key authentication.
 *
 * @example
 * ```typescript
 * // Create a new client
 * const response = await client.clients.create({
 *   email: 'user@example.com',
 *   website_limit: 5
 * });
 *
 * // List all clients
 * const clients = await client.clients.list();
 *
 * // Update a client
 * await client.clients.update({
 *   client_id: 'client-123',
 *   website_limit: 10
 * });
 *
 * // Delete a client
 * await client.clients.delete('client-123');
 * ```
 */
export class ClientsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new workspace client.
   *
   * @param request - The client creation request
   * @returns The client creation response
   *
   * @example
   * ```typescript
   * const response = await client.clients.create({
   *   email: 'user@example.com',
   *   website_limit: 5
   * });
   * if (response.success) {
   *   console.log('Created client:', response.client?.record_id);
   * }
   * ```
   */
  async create(request: ClientCreateRequest): Promise<ClientCreateResponse> {
    return this.http.post<ClientCreateResponse>('/v1/workspace/client/create', request);
  }

  /**
   * List all workspace clients.
   *
   * @param options - Optional pagination and search parameters
   * @returns The client list response
   *
   * @example
   * ```typescript
   * const response = await client.clients.list({ page: 1, search: 'john' });
   * for (const c of response.clients) {
   *   console.log(c.email);
   * }
   * ```
   */
  async list(options?: { page?: number; search?: string }): Promise<ClientListResponse> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (options?.page !== undefined) params.page = options.page;
    if (options?.search !== undefined) params.search = options.search;

    return this.http.get<ClientListResponse>('/v1/workspace/client/list', { params });
  }

  /**
   * Update a workspace client.
   *
   * @param request - The client update request
   * @returns The client update response
   *
   * @example
   * ```typescript
   * const response = await client.clients.update({
   *   client_id: 'client-123',
   *   website_limit: 10,
   *   suspended: false
   * });
   * ```
   */
  async update(request: ClientUpdateRequest): Promise<ClientUpdateResponse> {
    return this.http.put<ClientUpdateResponse>('/v1/workspace/client/update', request);
  }

  /**
   * Delete a workspace client.
   *
   * @param clientId - The client ID to delete
   * @returns The client deletion response
   *
   * @example
   * ```typescript
   * const response = await client.clients.delete('client-123');
   * if (response.success) {
   *   console.log('Client deleted');
   * }
   * ```
   */
  async delete(clientId: string): Promise<ClientDeleteResponse> {
    return this.http.delete<ClientDeleteResponse>('/v1/workspace/client/delete', { client_id: clientId });
  }

  /**
   * Create a magic link for client authentication.
   *
   * @param email - Email address to send the magic link to
   * @returns The magic link creation response
   *
   * @example
   * ```typescript
   * const response = await client.clients.createMagicLink('user@example.com');
   * if (response.success) {
   *   console.log('Magic link:', response.magic_link);
   * }
   * ```
   */
  async createMagicLink(email: string): Promise<MagicLinkCreateResponse> {
    const request: MagicLinkCreateRequest = { email };
    return this.http.post<MagicLinkCreateResponse>('/v1/workspace/client/magic-link', request);
  }
}
