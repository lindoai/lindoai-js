/**
 * Main client for the Lindo SDK
 *
 * Provides a unified interface for interacting with the Lindo API.
 *
 * @satisfies Requirements 5.1, 5.6
 */

import { HttpClient, type HttpClientConfig } from './http';
import { AgentsResource, WorkflowsResource, WorkspaceResource, AnalyticsResource, ClientsResource, WebsitesResource, PagesResource, BlogsResource, MediaResource } from './resources';

/**
 * Default base URL for the Lindo API.
 */
const DEFAULT_BASE_URL = 'https://api.lindo.ai';

/**
 * Default request timeout in milliseconds.
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Configuration options for the Lindo client.
 */
export interface LindoClientConfig {
  /**
   * Your Lindo API key.
   * Required for authentication.
   */
  apiKey: string;

  /**
   * Base URL for API requests.
   * Defaults to https://api.lindo.ai
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * Defaults to 30000 (30 seconds).
   */
  timeout?: number;
}

/**
 * The main Lindo SDK client.
 *
 * Provides access to all Lindo API resources through typed methods.
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
 */
export class LindoClient {
  /**
   * Resource for AI agent operations.
   *
   * @example
   * ```typescript
   * const result = await client.agents.run({
   *   agent_id: 'my-agent',
   *   input: { prompt: 'Hello!' }
   * });
   * ```
   */
  readonly agents: AgentsResource;

  /**
   * Resource for workflow operations.
   *
   * @example
   * ```typescript
   * const workflow = await client.workflows.start({
   *   workflow_name: 'publish-page',
   *   params: { page_id: 'page-123' }
   * });
   *
   * const status = await client.workflows.getStatus(workflow.instance_id);
   * ```
   */
  readonly workflows: WorkflowsResource;

  /**
   * Resource for workspace operations.
   *
   * @example
   * ```typescript
   * const credits = await client.workspace.getCredits();
   * console.log('Balance:', credits.balance);
   * ```
   */
  readonly workspace: WorkspaceResource;

  /**
   * Resource for analytics operations.
   *
   * @example
   * ```typescript
   * const analytics = await client.analytics.getWorkspace({
   *   from: '2024-01-01',
   *   to: '2024-01-31'
   * });
   * ```
   */
  readonly analytics: AnalyticsResource;

  /**
   * Resource for client management operations.
   *
   * @example
   * ```typescript
   * const clients = await client.clients.list();
   * const newClient = await client.clients.create({
   *   email: 'user@example.com',
   *   website_limit: 5
   * });
   * ```
   */
  readonly clients: ClientsResource;

  /**
   * Resource for website management operations.
   *
   * @example
   * ```typescript
   * const websites = await client.websites.list();
   * await client.websites.update({
   *   website_id: 'website-123',
   *   business_name: 'My Business'
   * });
   * ```
   */
  readonly websites: WebsitesResource;

  /**
   * Resource for page management operations.
   *
   * @example
   * ```typescript
   * const pages = await client.pages.list('website-123');
   * const page = await client.pages.get('website-123', 'page-456');
   * await client.pages.publish('website-123', 'page-456');
   * ```
   */
  readonly pages: PagesResource;

  /**
   * Resource for blog management operations.
   *
   * @example
   * ```typescript
   * const blogs = await client.blogs.list('website-123');
   * const blog = await client.blogs.get('website-123', 'blog-456');
   * await client.blogs.publish('website-123', 'blog-456');
   * ```
   */
  readonly blogs: BlogsResource;

  /**
   * Resource for media upload operations.
   *
   * @example
   * ```typescript
   * const result = await client.media.upload('website-123', {
   *   file_base64: 'data:image/png;base64,...',
   *   file_name: 'hero.png'
   * });
   * console.log('CDN URL:', result.result.url);
   * ```
   */
  readonly media: MediaResource;

  /**
   * The underlying HTTP client.
   * @internal
   */
  private readonly http: HttpClient;

  /**
   * Creates a new Lindo client.
   *
   * @param config - Client configuration options
   * @throws Error if apiKey is not provided
   *
   * @example
   * ```typescript
   * const client = new LindoClient({
   *   apiKey: 'your-api-key',
   *   baseUrl: 'https://api.lindo.ai',
   *   timeout: 30000
   * });
   * ```
   */
  constructor(config: LindoClientConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required. Please provide an apiKey in the configuration.');
    }

    const httpConfig: HttpClientConfig = {
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      apiKey: config.apiKey,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    };

    this.http = new HttpClient(httpConfig);

    // Initialize resources
    this.agents = new AgentsResource(this.http);
    this.workflows = new WorkflowsResource(this.http);
    this.workspace = new WorkspaceResource(this.http);
    this.analytics = new AnalyticsResource(this.http);
    this.clients = new ClientsResource(this.http);
    this.websites = new WebsitesResource(this.http);
    this.pages = new PagesResource(this.http);
    this.blogs = new BlogsResource(this.http);
    this.media = new MediaResource(this.http);
  }
}
