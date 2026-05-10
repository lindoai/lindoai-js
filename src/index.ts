/**
 * @lindo/sdk
 *
 * TypeScript SDK for the Lindo API.
 * Provides typed methods and interfaces for interacting with the Lindo API.
 *
 * @example
 * ```typescript
 * import { LindoClient } from '@lindo/sdk';
 *
 * const client = new LindoClient({
 *   apiKey: 'your-api-key'
 * });
 *
 * // Run an agent
 * const result = await client.agents.run({
 *   agent_id: 'my-agent',
 *   input: { prompt: 'Hello!' }
 * });
 *
 * // Start a workflow
 * const workflow = await client.workflows.start({
 *   workflow_name: 'publish-page',
 *   params: { page_id: 'page-123' }
 * });
 *
 * // Get workspace credits
 * const credits = await client.workspace.getCredits();
 *
 * // Get analytics
 * const analytics = await client.analytics.getWorkspace();
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { LindoClient, type LindoClientConfig } from './client';

// HTTP client (for advanced usage)
export { HttpClient, type HttpClientConfig, type RequestOptions, type HttpResponse } from './http';

// Error classes
export {
  LindoError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
  createErrorFromStatus,
} from './errors';

// Resource classes
export { AgentsResource } from './resources/agents';
export { WorkflowsResource } from './resources/workflows';
export { WorkspaceResource } from './resources/workspace';
export { AnalyticsResource } from './resources/analytics';
export { ClientsResource } from './resources/clients';
export { WebsitesResource } from './resources/websites';
export { MediaResource } from './resources/media';

// Types
export type {
  // Agent types
  AgentRunRequest,
  AgentRunResponse,

  // Workflow types
  WorkflowStartRequest,
  WorkflowStartResponse,
  WorkflowBatchStartRequest,
  WorkflowBatchStartResponse,
  WorkflowStatusType,
  WorkflowStatus,
  WorkflowActionResponse,

  // Workspace types
  WorkspaceCredits,

  // Analytics types
  AnalyticsQuery,
  WorkspaceAnalytics,
  WebsiteAnalytics,

  // Client management types
  ClientInfo,
  ClientCreateRequest,
  ClientCreateResponse,
  ClientListResponse,
  ClientUpdateRequest,
  ClientUpdateResponse,
  ClientDeleteResponse,
  MagicLinkCreateRequest,
  MagicLinkCreateResponse,

  // Website management types
  WebsiteInfo,
  WebsiteListResponse,
  WebsiteUpdateRequest,
  WebsiteUpdateResponse,
  WebsiteDeleteResponse,
  WebsiteAssignRequest,
  WebsiteAssignResponse,

  // Common types
  ErrorResponse,
  SuccessResponse,
  PaginationParams,
  PaginatedResponse,
} from './types';

// Media types
export type {
  MediaUploadRequest,
  MediaUploadResult,
  MediaBatchUploadResultItem,
  MediaBatchUploadResult,
} from './resources/media';
