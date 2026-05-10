/**
 * Workflows resource for the Lindo SDK
 *
 * Provides methods for managing workflows.
 *
 * @satisfies Requirements 5.2
 */

import type { HttpClient } from '../http';
import type {
  WorkflowStartRequest,
  WorkflowStartResponse,
  WorkflowBatchStartRequest,
  WorkflowBatchStartResponse,
  WorkflowStatus,
  WorkflowActionResponse,
  WorkflowListRequest,
  WorkflowListResponse,
  CreateWorkflowResponse,
  WebsiteWorkflowStatusResponse,
  PageWorkflowStatusResponse,
  BlogWorkflowStatusResponse,
  BatchCreateWebsiteItem,
  BatchCreatePageOrBlogItem,
  BatchCreateResponse,
  BatchWebsiteStatusResponse,
  BatchPageStatusResponse,
  BatchBlogStatusResponse,
} from '../types';

/**
 * Resource class for workflow operations.
 */
export class WorkflowsResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Starts a new workflow instance.
   *
   * @param request - The workflow start request
   * @returns The workflow start response with instance ID
   *
   * @example
   * ```typescript
   * const response = await client.workflows.start({
   *   workflow_name: 'publish-page',
   *   params: { page_id: 'page-123' }
   * });
   *
   * console.log('Workflow started:', response.instance_id);
   * ```
   */
  async start(request: WorkflowStartRequest): Promise<WorkflowStartResponse> {
    return this.http.post<WorkflowStartResponse>('/v1/ai/workflows/start', {
      workflow_name: request.workflow_name,
      ...request.params,
    });
  }

  /**
   * Starts multiple workflow instances in a batch.
   *
   * @param request - The batch start request
   * @returns The batch start response with results for each workflow
   *
   * @example
   * ```typescript
   * const response = await client.workflows.batchStart({
   *   workflows: [
   *     { workflow_name: 'publish-page', page_id: 'page-1' },
   *     { workflow_name: 'publish-page', page_id: 'page-2' }
   *   ]
   * });
   *
   * console.log('Started', response.total, 'workflows');
   * ```
   */
  async batchStart(request: WorkflowBatchStartRequest): Promise<WorkflowBatchStartResponse> {
    return this.http.post<WorkflowBatchStartResponse>('/v1/ai/workflows/batch', request);
  }

  /**
   * Lists workflow logs with optional filters.
   *
   * @param request - Optional filters for the list
   * @returns The list of workflow logs
   *
   * @example
   * ```typescript
   * const workflows = await client.workflows.list({
   *   status: 'completed',
   *   limit: 10
   * });
   * ```
   */
  async list(request?: WorkflowListRequest): Promise<WorkflowListResponse> {
    const params = new URLSearchParams();
    if (request?.workflow_name) params.set('workflow_name', request.workflow_name);
    if (request?.status) params.set('status', request.status);
    if (request?.website_id) params.set('website_id', request.website_id);
    if (request?.client_id) params.set('client_id', request.client_id);
    if (request?.limit) params.set('limit', request.limit.toString());
    if (request?.offset) params.set('offset', request.offset.toString());
    
    const query = params.toString();
    return this.http.get<WorkflowListResponse>(`/v1/ai/workflows${query ? `?${query}` : ''}`);
  }

  /**
   * Gets the status of a workflow instance.
   *
   * @param instanceId - The workflow instance ID
   * @returns The workflow status
   *
   * @example
   * ```typescript
   * const status = await client.workflows.getStatus('instance-123');
   *
   * if (status.status === 'completed') {
   *   console.log('Output:', status.output);
   * }
   * ```
   */
  async getStatus(instanceId: string): Promise<WorkflowStatus> {
    return this.http.get<WorkflowStatus>(`/v1/ai/workflows/${instanceId}`);
  }

  /**
   * Pauses a running workflow instance.
   *
   * @param instanceId - The workflow instance ID
   * @returns The action response
   *
   * @example
   * ```typescript
   * await client.workflows.pause('instance-123');
   * console.log('Workflow paused');
   * ```
   */
  async pause(instanceId: string): Promise<WorkflowActionResponse> {
    return this.http.post<WorkflowActionResponse>(`/ai/workflows/pause/${instanceId}`);
  }

  /**
   * Resumes a paused workflow instance.
   *
   * @param instanceId - The workflow instance ID
   * @returns The action response
   *
   * @example
   * ```typescript
   * await client.workflows.resume('instance-123');
   * console.log('Workflow resumed');
   * ```
   */
  async resume(instanceId: string): Promise<WorkflowActionResponse> {
    return this.http.post<WorkflowActionResponse>(`/ai/workflows/resume/${instanceId}`);
  }

  /**
   * Terminates a workflow instance.
   *
   * @param instanceId - The workflow instance ID
   * @returns The action response
   *
   * @example
   * ```typescript
   * await client.workflows.terminate('instance-123');
   * console.log('Workflow terminated');
   * ```
   */
  async terminate(instanceId: string): Promise<WorkflowActionResponse> {
    return this.http.post<WorkflowActionResponse>(`/ai/workflows/terminate/${instanceId}`);
  }

  /**
   * Creates a website using AI.
   *
   * Starts an asynchronous workflow that generates a website from the provided prompt.
   * Returns a `record_id` immediately — poll {@link getWebsiteStatus} with that id
   * to track progress and get the final result.
   *
   * @param request - The website creation request
   * @returns The workflow response with `record_id` for status polling
   *
   * @example
   * ```typescript
   * const { record_id } = await client.workflows.createWebsite({
   *   prompt: 'Create a website for a coffee shop with about, menu, and contact pages',
   *   client: { email: 'hello@beanthere.coffee', name: 'Bean There Coffee' },
   * });
   *
   * // Poll until done
   * while (true) {
   *   const status = await client.workflows.getWebsiteStatus(record_id);
   *   if (status.done) {
   *     console.log(status.message);
   *     console.log(status.result);
   *     break;
   *   }
   *   await new Promise(r => setTimeout(r, status.poll_after_ms ?? 5000));
   * }
   * ```
   */
  async createWebsite(request: {
    prompt: string;
    schedule_at?: string;
    client?: {
      client_id?: string;
      email?: string;
      name?: string;
    };
  }): Promise<CreateWorkflowResponse> {
    return this.http.post<CreateWorkflowResponse>('/v1/ai/workspace/website', request);
  }

  /**
   * Creates a page on an existing website using AI.
   *
   * Starts an asynchronous workflow. Returns a `record_id` immediately — poll
   * {@link getPageStatus} with that id to track progress and get the published page.
   *
   * @param websiteId - The website the page will be added to
   * @param request - The page creation request
   * @returns The workflow response with `record_id` for status polling
   *
   * @example
   * ```typescript
   * const { record_id } = await client.workflows.createPage('website-123', {
   *   prompt: 'Create an about-us page that highlights our team and company history',
   * });
   * ```
   */
  async createPage(
    websiteId: string,
    request: {
      prompt: string;
      schedule_at?: string;
    }
  ): Promise<CreateWorkflowResponse> {
    return this.http.post<CreateWorkflowResponse>(
      `/v1/ai/workspace/website/${websiteId}/page`,
      request
    );
  }

  /**
   * Creates a blog post on an existing website using AI.
   *
   * Starts an asynchronous workflow. Returns a `record_id` immediately — poll
   * {@link getBlogStatus} with that id to track progress and get the published post.
   *
   * @param websiteId - The website the blog post will be added to
   * @param request - The blog creation request
   * @returns The workflow response with `record_id` for status polling
   *
   * @example
   * ```typescript
   * const { record_id } = await client.workflows.createBlog('website-123', {
   *   prompt: 'Write a blog post about the benefits of organic coffee beans',
   * });
   * ```
   */
  async createBlog(
    websiteId: string,
    request: {
      prompt: string;
      schedule_at?: string;
    }
  ): Promise<CreateWorkflowResponse> {
    return this.http.post<CreateWorkflowResponse>(
      `/v1/ai/workspace/website/${websiteId}/blog`,
      request
    );
  }

  /**
   * Polls the status of a website-creation workflow started via {@link createWebsite}.
   *
   * Returns an agent-friendly envelope:
   *  - `done` is true once the workflow and every child page workflow have finished
   *  - `status` is `complete` only when every page succeeded, `partial` if some failed
   *  - `result.pages` lists every page (home + additional) with its individual status
   *
   * @param recordId - The `record_id` returned by {@link createWebsite}
   * @returns The website workflow status envelope
   *
   * @example
   * ```typescript
   * const status = await client.workflows.getWebsiteStatus('rec_abc123');
   * if (!status.done) {
   *   console.log(status.message); // "Creating your website. 2 of 5 pages complete."
   *   await new Promise(r => setTimeout(r, status.poll_after_ms ?? 5000));
   * }
   * ```
   */
  async getWebsiteStatus(recordId: string): Promise<WebsiteWorkflowStatusResponse> {
    return this.http.get<WebsiteWorkflowStatusResponse>(
      `/v1/ai/workspace/website/status/${recordId}`
    );
  }

  /**
   * Polls the status of a page-creation workflow started via {@link createPage}.
   *
   * Returns an agent-friendly envelope. `result` is populated once `status` is `complete`.
   *
   * @param recordId - The `record_id` returned by {@link createPage}
   * @returns The page workflow status envelope
   *
   * @example
   * ```typescript
   * const status = await client.workflows.getPageStatus('rec_abc123');
   * if (status.done && status.result) {
   *   console.log(`Published at ${status.result.path}`);
   * }
   * ```
   */
  async getPageStatus(recordId: string): Promise<PageWorkflowStatusResponse> {
    return this.http.get<PageWorkflowStatusResponse>(
      `/v1/ai/workspace/page/status/${recordId}`
    );
  }

  /**
   * Polls the status of a blog-creation workflow started via {@link createBlog}.
   *
   * Returns an agent-friendly envelope. `result` is populated once `status` is `complete`.
   *
   * @param recordId - The `record_id` returned by {@link createBlog}
   * @returns The blog workflow status envelope
   *
   * @example
   * ```typescript
   * const status = await client.workflows.getBlogStatus('rec_abc123');
   * if (status.done && status.result) {
   *   console.log(`Blog published at ${status.result.path}`);
   * }
   * ```
   */
  async getBlogStatus(recordId: string): Promise<BlogWorkflowStatusResponse> {
    return this.http.get<BlogWorkflowStatusResponse>(
      `/v1/ai/workspace/blog/status/${recordId}`
    );
  }

  // ==========================================================================
  // Batch Create
  // --------------------------------------------------------------------------
  // Start up to 25 workflows in a single request. Each response item carries
  // its own `record_id` and `status_url`. Credits are deducted upfront in
  // bulk; failures are refunded per-item.
  // ==========================================================================

  /**
   * Starts up to 25 website-creation workflows in one request.
   *
   * @param items - Between 1 and 25 website creation requests.
   *
   * @example
   * ```typescript
   * const batch = await client.workflows.batchCreateWebsites([
   *   { prompt: 'Website for a coffee shop called Bean There' },
   *   { prompt: 'Photography portfolio site for Maria Chen' },
   * ]);
   * // Poll the whole batch at once
   * const status = await client.workflows.batchCheckWebsiteStatus(
   *   batch.items.filter(i => i.success).map(i => i.record_id!),
   * );
   * ```
   */
  async batchCreateWebsites(
    items: BatchCreateWebsiteItem[]
  ): Promise<BatchCreateResponse> {
    return this.http.post<BatchCreateResponse>(
      '/v1/ai/workspace/website/batch',
      { items }
    );
  }

  /**
   * Starts up to 25 page-creation workflows on a single website.
   *
   * @param websiteId - The website to add the pages to.
   * @param items - Between 1 and 25 page creation requests.
   */
  async batchCreatePages(
    websiteId: string,
    items: BatchCreatePageOrBlogItem[]
  ): Promise<BatchCreateResponse> {
    return this.http.post<BatchCreateResponse>(
      `/v1/ai/workspace/website/${websiteId}/page/batch`,
      { items }
    );
  }

  /**
   * Starts up to 25 blog-creation workflows on a single website.
   *
   * @param websiteId - The website to add the blog posts to.
   * @param items - Between 1 and 25 blog creation requests.
   */
  async batchCreateBlogs(
    websiteId: string,
    items: BatchCreatePageOrBlogItem[]
  ): Promise<BatchCreateResponse> {
    return this.http.post<BatchCreateResponse>(
      `/v1/ai/workspace/website/${websiteId}/blog/batch`,
      { items }
    );
  }

  // ==========================================================================
  // Batch Status
  // --------------------------------------------------------------------------
  // Poll up to 25 workflows at once. The response carries a rollup `status`
  // (scheduled | running | complete | partial | errored), a summary, and
  // per-item details with the same shape as the singular status endpoints.
  // Not-found / wrong-type records appear as `{ success: false, error }`
  // entries in `items` and contribute to `summary.not_found`.
  // ==========================================================================

  /**
   * Checks the status of up to 25 website-creation workflows in one request.
   *
   * @param recordIds - Record IDs returned by {@link createWebsite} / {@link batchCreateWebsites}.
   *
   * @example
   * ```typescript
   * const batch = await client.workflows.batchCheckWebsiteStatus([
   *   'rec_abc', 'rec_def', 'rec_ghi',
   * ]);
   * if (!batch.done) {
   *   await new Promise(r => setTimeout(r, batch.poll_after_ms ?? 5000));
   * }
   * console.log(batch.status, batch.summary); // 'running', { total: 3, complete: 1, ... }
   * ```
   */
  async batchCheckWebsiteStatus(
    recordIds: string[]
  ): Promise<BatchWebsiteStatusResponse> {
    return this.http.post<BatchWebsiteStatusResponse>(
      '/v1/ai/workspace/website/status/batch',
      { record_ids: recordIds }
    );
  }

  /**
   * Checks the status of up to 25 page-creation workflows in one request.
   *
   * @param recordIds - Record IDs returned by {@link createPage} / {@link batchCreatePages}.
   */
  async batchCheckPageStatus(
    recordIds: string[]
  ): Promise<BatchPageStatusResponse> {
    return this.http.post<BatchPageStatusResponse>(
      '/v1/ai/workspace/page/status/batch',
      { record_ids: recordIds }
    );
  }

  /**
   * Checks the status of up to 25 blog-creation workflows in one request.
   *
   * @param recordIds - Record IDs returned by {@link createBlog} / {@link batchCreateBlogs}.
   */
  async batchCheckBlogStatus(
    recordIds: string[]
  ): Promise<BatchBlogStatusResponse> {
    return this.http.post<BatchBlogStatusResponse>(
      '/v1/ai/workspace/blog/status/batch',
      { record_ids: recordIds }
    );
  }
}
