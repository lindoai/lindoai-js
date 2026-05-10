/**
 * TypeScript interfaces for the Lindo SDK
 *
 * Defines all request and response types for the Lindo API.
 * These types are generated from the unified OpenAPI specification.
 *
 * @satisfies Requirements 5.3
 */

// ============================================================================
// Agent Types
// ============================================================================

/**
 * Request to run an AI agent.
 */
export interface AgentRunRequest {
  /** The unique identifier of the agent to run */
  agent_id: string;

  /** Input data for the agent */
  input: Record<string, unknown>;

  /** Whether to stream the response (default: false) */
  stream?: boolean;
}

/**
 * Response from running an AI agent.
 */
export interface AgentRunResponse {
  /** Whether the agent run was successful */
  success: boolean;

  /** Output data from the agent */
  output?: Record<string, unknown>;

  /** Number of credits used for this run */
  credits_used?: number;

  /** Error message if the run failed */
  error?: string;
}

// ============================================================================
// Workflow Types
// ============================================================================

/**
 * Request to start a workflow.
 */
export interface WorkflowStartRequest {
  /** The name of the workflow to start */
  workflow_name: string;

  /** Parameters for the workflow */
  params?: Record<string, unknown>;
}

/**
 * Response from starting a workflow.
 */
export interface WorkflowStartResponse {
  /** Whether the workflow was started successfully */
  success: boolean;

  /** The unique identifier of the workflow instance */
  instance_id: string;

  /** Current status of the workflow */
  status: WorkflowStatusType;
}

/**
 * Request to start multiple workflows in a batch.
 */
export interface WorkflowBatchStartRequest {
  /** Array of workflows to start */
  workflows: Array<{
    /** The name of the workflow to start */
    workflow_name: string;

    /** Parameters for the workflow */
    [key: string]: unknown;
  }>;
}

/**
 * Response from starting a batch of workflows.
 */
export interface WorkflowBatchStartResponse {
  /** Whether the batch was started successfully */
  success: boolean;

  /** Total number of workflows in the batch */
  total: number;

  /** Results for each workflow */
  results: WorkflowStartResponse[];
}

/**
 * Possible workflow status values.
 */
export type WorkflowStatusType =
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'terminated';

/**
 * Status information for a workflow instance.
 */
export interface WorkflowStatus {
  /** The unique identifier of the workflow instance */
  instance_id: string;

  /** The name of the workflow */
  workflow_name: string;

  /** Current status of the workflow */
  status: WorkflowStatusType;

  /** ISO timestamp when the workflow was created */
  created_at: string;

  /** ISO timestamp when the workflow was last updated */
  updated_at: string;

  /** Output data from the workflow (if completed) */
  output?: Record<string, unknown>;

  /** Error message (if failed) */
  error?: string;
}

/**
 * Response from a workflow action (pause, resume, terminate).
 */
export interface WorkflowActionResponse {
  /** Whether the action was successful */
  success: boolean;

  /** Message describing the result */
  message: string;
}

// ============================================================================
// AI Workflow Creation & Status Types
// ----------------------------------------------------------------------------
// Used by `client.workflows.createWebsite/createPage/createBlog` and the
// matching `getWebsiteStatus/getPageStatus/getBlogStatus` poll helpers.
// All three create endpoints return the same shape; the three status endpoints
// share an envelope but differ in the shape of `result`.
// ============================================================================

/**
 * Response returned by `createWebsite`, `createPage`, `createBlog`.
 * Use `record_id` to poll the matching status endpoint.
 */
export interface CreateWorkflowResponse {
  /** True when the workflow was accepted. */
  success: true;

  /** Workflow record ID. Pass this to the matching status endpoint to poll. */
  record_id: string;

  /**
   * Underlying Cloudflare Workflow instance id. May be absent for scheduled
   * workflows that haven't executed yet.
   */
  instance_id?: string;

  /** Target website ID (for website/page/blog workflows). */
  website_id?: string;

  /** Page ID once the page has been published (page workflows). */
  page_id?: string;

  /** Blog ID once the blog has been published (blog workflows). */
  blog_id?: string;

  /** Status URL to poll. */
  status_url?: string;
}

/**
 * Normalized status used across all three status endpoints.
 *  - `scheduled`: queued to run in the future
 *  - `running`: currently executing
 *  - `complete`: fully finished with no errors
 *  - `partial`: finished, but some sub-steps failed (e.g. individual website pages)
 *  - `errored`: the workflow itself failed
 */
export type WorkflowEnvelopeStatus =
  | 'scheduled'
  | 'running'
  | 'complete'
  | 'partial'
  | 'errored';

/**
 * Envelope shared by every workflow status response.
 */
export interface WorkflowStatusEnvelope<Result = never> {
  /** The status poll succeeded. Check `status` for the workflow's own outcome. */
  success: true;

  /** True once the workflow has reached a terminal state. */
  done: boolean;

  /** Normalized status. */
  status: WorkflowEnvelopeStatus;

  /** The record_id you polled. */
  record_id: string;

  /** Human-readable status message. Safe to quote to end users. */
  message: string;

  /**
   * Suggested delay (in ms) before the next status check. Present only while
   * `done` is false.
   */
  poll_after_ms?: number;

  /**
   * Type-specific result payload. Website responses include this from the start
   * (it tracks per-page progress); page/blog responses include it once
   * `status` is `complete`.
   */
  result?: Result;

  /** Machine-readable error message when `status` is `errored`. */
  error?: string;
}

/** Result payload for a single-page (non-website) workflow. */
export interface PageWorkflowResult {
  website_id: string;
  page_id: string;
  /** Path without the leading slash, e.g. `"about"`. */
  slug: string;
  /** Full URL path on the website, e.g. `"/about"`. */
  path: string;
}

/** Result payload for a single-blog workflow. */
export interface BlogWorkflowResult {
  website_id: string;
  blog_id: string;
  /** Path without the leading slash, e.g. `"hello-world"`. */
  slug: string;
  /** Full URL path on the website, e.g. `"/blog/hello-world"`. */
  path: string;
}

/** A single page within a website workflow's `result.pages` array. */
export interface WebsitePageEntry {
  /** Page ID once published. Absent while running or if it errored before publish. */
  page_id?: string;
  /** Slug. Empty string for the home page. */
  slug: string;
  /** URL path. `"/"` for the home page. */
  path: string;
  /** Status of this individual page. */
  status: 'running' | 'complete' | 'errored';
  /** Error message when `status` is `errored`. */
  error_message?: string;
}

/**
 * Result payload for a website-creation workflow. Includes aggregate progress
 * plus per-page details for the home page and every additional page.
 */
export interface WebsiteWorkflowResult {
  website_id: string;
  /** Home page ID once published. */
  home_page_id?: string;
  pages_summary: {
    total: number;
    complete: number;
    running: number;
    errored: number;
  };
  pages: WebsitePageEntry[];
}

/** Response shape for GET /v1/ai/workspace/website/status/{record_id}. */
export type WebsiteWorkflowStatusResponse = WorkflowStatusEnvelope<WebsiteWorkflowResult>;

/** Response shape for GET /v1/ai/workspace/page/status/{record_id}. */
export type PageWorkflowStatusResponse = WorkflowStatusEnvelope<PageWorkflowResult>;

/** Response shape for GET /v1/ai/workspace/blog/status/{record_id}. */
export type BlogWorkflowStatusResponse = WorkflowStatusEnvelope<BlogWorkflowResult>;

// ============================================================================
// Batch Create & Batch Status Types
// ----------------------------------------------------------------------------
// Used by `client.workflows.batchCreateWebsites/batchCreatePages/batchCreateBlogs`
// and the matching batchCheckWebsiteStatus/Page/Blog helpers.
// Max 25 items per batch.
// ============================================================================

/** Single item in a batch website-creation request. */
export interface BatchCreateWebsiteItem {
  prompt: string;
  schedule_at?: string;
  client?: {
    client_id?: string;
    email?: string;
    name?: string;
  };
}

/** Single item in a batch page or blog creation request (same shape for both). */
export interface BatchCreatePageOrBlogItem {
  prompt: string;
  schedule_at?: string;
}

/** Per-item result in a batch-create response. */
export interface BatchCreateItemResult {
  /** True if this item was accepted. */
  success: boolean;
  /** Workflow record_id (when success). */
  record_id?: string;
  /** Underlying Cloudflare Workflow instance id (when already started). */
  instance_id?: string;
  /** URL to poll for this item's status. */
  status_url?: string;
  /** Error message (when not success). */
  error?: string;
}

/** Response shape shared by all three batch-create endpoints. */
export interface BatchCreateResponse {
  success: true;
  total: number;
  succeeded: number;
  failed: number;
  items: BatchCreateItemResult[];
}

/**
 * Rollup status for a batch:
 *   - `scheduled`: every item is scheduled
 *   - `running`: at least one item is still running or scheduled
 *   - `complete`: every item finished cleanly
 *   - `partial`: every item is terminal, but some errored
 *   - `errored`: every item errored (none completed)
 */
export type BatchRollupStatus =
  | 'scheduled'
  | 'running'
  | 'complete'
  | 'partial'
  | 'errored';

/** Summary counts returned with every batch-status response. */
export interface BatchStatusSummary {
  total: number;
  complete: number;
  /** Includes both `running` and `scheduled` per-item statuses. */
  running: number;
  /** Items with partial outcome (website-only). */
  partial: number;
  errored: number;
  /** record_ids that could not be found (or were the wrong workflow type). */
  not_found: number;
}

/**
 * Per-record entry in a batch status response. Same shape as the singular
 * status envelope but the top-level `success` boolean also signals whether the
 * record was found (`false` for not-found / wrong-type records).
 */
export interface BatchStatusItem<Result> {
  success: boolean;
  record_id: string;
  done?: boolean;
  status?: WorkflowEnvelopeStatus;
  message?: string;
  result?: Result;
  error?: string;
}

/** Envelope for a batch status response. */
export interface BatchStatusResponse<Result> {
  success: true;
  done: boolean;
  status: BatchRollupStatus;
  message: string;
  summary: BatchStatusSummary;
  poll_after_ms?: number;
  items: Array<BatchStatusItem<Result>>;
}

/** Batch status response for website workflows. */
export type BatchWebsiteStatusResponse = BatchStatusResponse<WebsiteWorkflowResult>;

/** Batch status response for page workflows. */
export type BatchPageStatusResponse = BatchStatusResponse<PageWorkflowResult>;

/** Batch status response for blog workflows. */
export type BatchBlogStatusResponse = BatchStatusResponse<BlogWorkflowResult>;

// ============================================================================
// Workspace Types
// ============================================================================

/**
 * Credit balance information for a workspace.
 */
export interface WorkspaceCredits {
  /** The unique identifier of the workspace */
  workspace_id: string;

  /** Current credit balance */
  balance: number;

  /** Total credits allocated */
  allocated: number;

  /** Total credits used */
  used: number;

  /** ISO timestamp when credits reset (if applicable) */
  reset_date?: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

/**
 * Query parameters for analytics requests.
 */
export interface AnalyticsQuery {
  /** Start date for the analytics period (ISO format) */
  from?: string;

  /** End date for the analytics period (ISO format) */
  to?: string;
}

/**
 * Analytics data for a workspace.
 */
export interface WorkspaceAnalytics {
  /** Total API requests */
  total_requests: number;

  /** Total unique visitors */
  total_visitors: number;

  /** Average response time in ms */
  avg_response_time: number;

  /** Total pages count */
  total_pages: number;

  /** Total blogs count */
  total_blogs: number;

  /** Additional analytics data */
  [key: string]: unknown;
}

/**
 * Analytics data for a website.
 */
export interface WebsiteAnalytics {
  /** Total API requests */
  total_requests: number;

  /** Total unique visitors */
  total_visitors: number;

  /** Average response time in ms */
  avg_response_time: number;

  /** Total pages count */
  total_pages: number;

  /** Total blogs count */
  total_blogs: number;

  /** Additional analytics data */
  [key: string]: unknown;
}

// ============================================================================
// Common Types
// ============================================================================

/**
 * Standard error response from the API.
 */
export interface ErrorResponse {
  /** Error message */
  error: string;

  /** Error code (optional) */
  code?: string;

  /** Additional error details (optional) */
  details?: string;
}

/**
 * Standard success response from the API.
 */
export interface SuccessResponse {
  /** Whether the operation was successful */
  success: boolean;

  /** Optional message */
  message?: string;
}

/**
 * Pagination parameters for list requests.
 */
export interface PaginationParams {
  /** Number of items to skip */
  offset?: number;

  /** Maximum number of items to return */
  limit?: number;
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];

  /** Total number of items */
  total: number;

  /** Current offset */
  offset: number;

  /** Current limit */
  limit: number;

  /** Whether there are more items */
  has_more: boolean;
}

// ============================================================================
// Client Management Types (API Key Auth)
// ============================================================================

/**
 * Information about a workspace client.
 */
export interface ClientInfo {
  /** The unique identifier of the client */
  client_id: string;

  /** Client email address */
  email: string;

  /** Client full name */
  full_name?: string;

  /** Maximum number of websites the client can have */
  website_limit?: number;

  /** Whether the client is suspended */
  suspended?: boolean;

  /** ISO timestamp when the client was created */
  created_date?: string;
}

/**
 * Request to create a new workspace client.
 */
export interface ClientCreateRequest {
  /** Client email address */
  email: string;

  /** Maximum number of websites the client can have */
  website_limit?: number;
}

/**
 * Response from creating a workspace client.
 */
export interface ClientCreateResponse {
  /** Whether the client was created successfully */
  success: boolean;

  /** The created client information */
  result?: ClientInfo;

  /** Error messages if creation failed */
  errors?: string[];
}

/**
 * Response from listing workspace clients.
 */
export interface ClientListResponse {
  /** Whether the request was successful */
  success: boolean;

  /** Result containing list and total */
  result: {
    /** List of clients */
    list: ClientInfo[];
    /** Total number of clients */
    total: number;
  };
}

/**
 * Request to update a workspace client.
 */
export interface ClientUpdateRequest {
  /** The client ID to update */
  client_id: string;

  /** New website limit */
  website_limit?: number;

  /** Whether to suspend the client */
  suspended?: boolean;
}

/**
 * Response from updating a workspace client.
 */
export interface ClientUpdateResponse {
  /** Whether the update was successful */
  success: boolean;

  /** The updated client information */
  result?: ClientInfo;

  /** Error messages if update failed */
  errors?: string[];
}

/**
 * Response from deleting a workspace client.
 */
export interface ClientDeleteResponse {
  /** Whether the deletion was successful */
  success: boolean;

  /** Error messages if deletion failed */
  errors?: string[];
}

/**
 * Request to create a magic link.
 */
export interface MagicLinkCreateRequest {
  /** Email address to send the magic link to */
  email: string;
}

/**
 * Response from creating a magic link.
 */
export interface MagicLinkCreateResponse {
  /** Whether the magic link was created successfully */
  success: boolean;

  /** The magic link URL */
  magic_link?: string;

  /** Error messages if creation failed */
  errors?: string[];
}

// ============================================================================
// Website Management Types (API Key Auth)
// ============================================================================

/**
 * Information about a website.
 */
export interface WebsiteInfo {
  /** The unique identifier of the website */
  website_id: string;

  /** Website name */
  website_name?: string;

  /** Website domain URL */
  domain?: string;

  /** Whether the website is activated */
  activated?: boolean;

  /** ISO timestamp when the website was created */
  created_date?: string;

  /** Website language */
  language?: string;
}

/**
 * Response from listing workspace websites.
 */
export interface WebsiteListResponse {
  /** Whether the request was successful */
  success: boolean;

  /** Result containing list and total */
  result: {
    /** List of websites */
    list: WebsiteInfo[];
    /** Total number of websites */
    total: number;
  };
}

/**
 * Request to update a website.
 */
export interface WebsiteUpdateRequest {
  /** The website ID to update */
  website_id: string;

  /** New business name */
  business_name?: string;

  /** Whether to activate the website */
  activated?: boolean;
}

/**
 * Response from updating a website.
 */
export interface WebsiteUpdateResponse {
  /** Whether the update was successful */
  success: boolean;

  /** The updated website information */
  result?: WebsiteInfo;

  /** Error messages if update failed */
  errors?: string[];
}

/**
 * Response from deleting a website.
 */
export interface WebsiteDeleteResponse {
  /** Whether the deletion was successful */
  success: boolean;

  /** Error messages if deletion failed */
  errors?: string[];
}

/**
 * Request to assign a website to a client.
 */
export interface WebsiteAssignRequest {
  /** The website ID to assign */
  website_id: string;

  /** The client ID to assign the website to */
  client_id: string;
}

/**
 * Response from assigning a website to a client.
 */
export interface WebsiteAssignResponse {
  /** Whether the assignment was successful */
  success: boolean;

  /** Error messages if assignment failed */
  errors?: string[];
}


// ============================================================================
// Workflow List Types (OpenAPI v1 Routes)
// ============================================================================

/**
 * Request to list workflow logs.
 */
export interface WorkflowListRequest {
  /** Filter by workflow name */
  workflow_name?: string;

  /** Filter by status */
  status?: string;

  /** Filter by website ID */
  website_id?: string;

  /** Filter by client ID */
  client_id?: string;

  /** Maximum number of items to return */
  limit?: number;

  /** Number of items to skip */
  offset?: number;
}

/**
 * Workflow log entry.
 */
export interface WorkflowLogEntry {
  /** The workflow name */
  workflow_name: string;

  /** The workflow instance ID */
  workflow_instance_id: string;

  /** Current status */
  status: string;

  /** ISO timestamp when the workflow started */
  started_at: string;

  /** ISO timestamp when the workflow completed */
  completed_at?: string | null;

  /** Duration in milliseconds */
  duration?: number | null;

  /** Display name from config */
  display_name?: string;

  /** Description from config */
  description?: string;
}

/**
 * Response from listing workflow logs.
 */
export interface WorkflowListResponse {
  /** Whether the request was successful */
  success: boolean;

  /** List of workflow logs */
  data: WorkflowLogEntry[];
}

// ============================================================================
// Page Management Types
// ============================================================================

/**
 * Possible page status values.
 */
export type PageStatusType = 'Active' | 'Archive' | 'Building';

/**
 * A single page item in list responses.
 */
export interface PageListItem {
  /** Unique identifier of the page */
  page_id: string;

  /** Name of the page */
  name: string;

  /** URL path of the page */
  path: string;

  /** Current status of the page */
  status: PageStatusType;

  /** Unix timestamp when the page was published, null if unpublished */
  publish_date: number | null;

  /** Date when the page was created */
  created_date: string;
}

/**
 * Response from listing pages.
 */
export interface PageListResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Result containing list and total */
  result: {
    /** Array of page items */
    list: PageListItem[];
    /** Total number of pages */
    total: number;
  };
}

/**
 * SEO metadata for a page.
 */
export interface PageSeo {
  /** SEO title for the page */
  title?: string;

  /** SEO meta description for the page */
  description?: string;

  /** SEO keywords for the page */
  keywords?: string;
}

/**
 * Response from getting page details.
 */
export interface PageDetailsResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Page details result */
  result: {
    /** Unique identifier of the page */
    page_id: string;

    /** Name of the page */
    name: string;

    /** URL path of the page */
    path: string;

    /** Current status of the page */
    status: string;

    /** SEO metadata for the page */
    seo: PageSeo;

    /** Page settings configuration */
    settings: Record<string, unknown>;

    /** Page data and content */
    data: Record<string, unknown>;

    /** Unix timestamp when the page was published, null if unpublished */
    publish_date: number | null;

    /** Date when the page was created */
    created_date: string;
  };
}

/**
 * Response from publishing a page.
 */
export interface PagePublishResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Publish result */
  result: {
    /** Success message */
    message: string;

    /** Unique identifier of the published page */
    page_id: string;

    /** Unix timestamp when the page was published */
    publish_date: number;
  };
}

/**
 * Response from unpublishing a page.
 */
export interface PageUnpublishResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Unpublish result */
  result: {
    /** Success message */
    message: string;

    /** Unique identifier of the unpublished page */
    page_id: string;
  };
}

// ============================================================================
// Blog Management Types
// ============================================================================

/**
 * Possible blog status values.
 */
export type BlogStatusType = 'Active' | 'Archive' | 'Building';

/**
 * A single blog item in list responses.
 */
export interface BlogListItem {
  /** Unique identifier of the blog */
  blog_id: string;

  /** Name of the blog post */
  name: string;

  /** URL path of the blog post */
  path: string;

  /** Current status of the blog */
  status: BlogStatusType;

  /** Unix timestamp when the blog was published, null if unpublished */
  publish_date: number | null;

  /** Blog-specific settings configuration */
  blog_settings: Record<string, unknown>;

  /** Date when the blog was created */
  created_date: string;
}

/**
 * Response from listing blogs.
 */
export interface BlogListResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Result containing list and total */
  result: {
    /** Array of blog items */
    list: BlogListItem[];
    /** Total number of blogs */
    total: number;
  };
}

/**
 * Response from getting blog details.
 */
export interface BlogDetailsResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Blog details result */
  result: {
    /** Unique identifier of the blog */
    blog_id: string;

    /** Name of the blog post */
    name: string;

    /** URL path of the blog post */
    path: string;

    /** Current status of the blog */
    status: string;

    /** SEO metadata for the blog post */
    seo: Record<string, unknown>;

    /** Blog-specific settings configuration */
    blog_settings: Record<string, unknown>;

    /** Blog data and content */
    data: Record<string, unknown>;

    /** Unix timestamp when the blog was published, null if unpublished */
    publish_date: number | null;

    /** Date when the blog was created */
    created_date: string;
  };
}

/**
 * Response from publishing a blog.
 */
export interface BlogPublishResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Publish result */
  result: {
    /** Success message */
    message: string;

    /** Unique identifier of the published blog */
    blog_id: string;

    /** Unix timestamp when the blog was published */
    publish_date: number;
  };
}

/**
 * Response from unpublishing a blog.
 */
export interface BlogUnpublishResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Unpublish result */
  result: {
    /** Success message */
    message: string;

    /** Unique identifier of the unpublished blog */
    blog_id: string;
  };
}

// ============================================================================
// Extended Website Management Types
// ============================================================================

/**
 * Response from getting website details.
 */
export interface WebsiteDetailsResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Website details result */
  result: {
    /** Unique identifier of the website */
    website_id: string;

    /** Business name for the website */
    business_name: string;

    /** Business description */
    business_description: string;

    /** Preview URL of the website */
    preview_url: string;

    /** Custom domain configured for the website */
    custom_domain: string | null;

    /** Verified domain for the website */
    verified_domain: string | null;

    /** Language of the website */
    language: string;

    /** Whether the website is activated */
    activated: boolean;

    /** Theme configuration for the website including font and title_font */
    theme: Record<string, unknown>;

    /** Integrations configured for the website */
    integrations: Record<string, unknown>;

    /** Social media links for the website */
    socials: Record<string, unknown>;

    /** Font configuration for the website */
    fonts: Record<string, unknown>;

    /** Date when the website was created */
    created_date: string;

    /** Global header HTML shared across all pages */
    global_header: string | null;

    /** Global footer HTML shared across all pages */
    global_footer: string | null;

    /** Custom code snippets for header and footer injection */
    custom_codes: {
      /** Custom code to inject in the header */
      header: string | null;
      /** Custom code to inject in the footer */
      footer: string | null;
    };
  };
}

/**
 * Request to update website settings.
 */
export interface WebsiteSettingsUpdateRequest {
  /** Business name for the website */
  business_name?: string;

  /** Business description */
  business_description?: string;

  /** Language of the website */
  language?: string;

  /** Theme configuration for the website */
  theme?: Record<string, unknown>;

  /** Robots.txt content for the website */
  robots?: string;

  /** Custom code to inject in the header */
  custom_code_header?: string;

  /** Custom code to inject in the footer */
  custom_code_footer?: string;

  /** Social media links for the website */
  socials?: Record<string, unknown>;

  /** Font configuration for the website */
  fonts?: Record<string, unknown>;
}

/**
 * Response from updating website settings.
 */
export interface WebsiteSettingsUpdateResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Settings update result */
  result: {
    /** Success message */
    message: string;

    /** Unique identifier of the updated website */
    website_id: string;

    /** Updated business name */
    business_name?: string;

    /** Updated business description */
    business_description?: string;

    /** Updated language */
    language?: string;

    /** Updated theme configuration */
    theme?: Record<string, unknown>;

    /** Updated robots.txt content */
    robots?: string;

    /** Updated custom header code */
    custom_code_header?: string;

    /** Updated custom footer code */
    custom_code_footer?: string;

    /** Updated social media links */
    socials?: Record<string, unknown>;

    /** Updated font configuration */
    fonts?: Record<string, unknown>;
  };
}

/**
 * DNS record for custom domain setup.
 */
export interface DNSRecord {
  /** Type of DNS record */
  record_type: 'CNAME' | 'TXT' | 'A';

  /** Host/name for the DNS record */
  host: string;

  /** Value for the DNS record */
  value: string;

  /** Purpose of this DNS record */
  purpose: string;

  /** Time to live in seconds */
  ttl: number;
}

/**
 * Request to add a custom domain to a website.
 */
export interface WebsiteDomainAddRequest {
  /** Custom domain to add to the website */
  domain: string;
}

/**
 * Response from adding a custom domain to a website.
 */
export interface WebsiteDomainAddResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Domain add result with agent-ready DNS records */
  result: {
    /** Success message */
    message: string;

    /** The domain being configured */
    domain: string;

    /** DNS records that need to be configured */
    dns_records: DNSRecord[];

    /** Human-readable instructions for DNS setup */
    instructions: string;
  };
}

/**
 * Response from removing a custom domain from a website.
 */
export interface WebsiteDomainRemoveResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Domain remove result */
  result: {
    /** Success message */
    message: string;

    /** Unique identifier of the website */
    website_id: string;
  };
}

/**
 * Matomo integration configuration.
 */
export interface MatomoConfig {
  /** Matomo site ID */
  site_id: string;

  /** Matomo server URL */
  url: string;
}

/**
 * Request to add an integration to a website.
 */
export interface WebsiteIntegrationAddRequest {
  /** Type of integration to add */
  integration_type: 'matomo';

  /** Configuration for the integration */
  config: MatomoConfig;
}

/**
 * Response from adding an integration to a website.
 */
export interface WebsiteIntegrationAddResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Integration add result */
  result: {
    /** Success message */
    message: string;

    /** Type of integration added */
    integration_type: string;

    /** Updated integrations configuration */
    integrations: Record<string, unknown>;
  };
}

/**
 * Response from removing an integration from a website.
 */
export interface WebsiteIntegrationRemoveResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Integration remove result */
  result: {
    /** Success message */
    message: string;

    /** Type of integration removed */
    integration_type: string;
  };
}

/**
 * Request to add a team member to a website.
 */
export interface WebsiteTeamMemberAddRequest {
  /** Email address of the team member to add */
  email: string;

  /** Role for the team member */
  role: 'Editor' | 'Commenter';
}

/**
 * Response from adding a team member to a website.
 */
export interface WebsiteTeamMemberAddResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Team member add result */
  result: {
    /** Unique identifier of the team member */
    member_id: string;

    /** Email address of the team member */
    email: string;

    /** Role assigned to the team member */
    role: string;

    /** Date when the team member was added */
    created_date: string;
  };
}

/**
 * Response from removing a team member from a website.
 */
export interface WebsiteTeamMemberRemoveResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Team member remove result */
  result: {
    /** Success message */
    message: string;

    /** Unique identifier of the removed team member */
    member_id: string;
  };
}

// ============================================================================
// Workspace Management Types
// ============================================================================

/**
 * Workspace whitelabel configuration.
 */
export interface WorkspaceWhitelabel {
  /** Whether whitelabel is enabled for the workspace */
  enabled: boolean;

  /** Custom whitelabel domain */
  domain: string | null;

  /** Custom email sender address */
  email_sender: string | null;

  /** Whether client registration is enabled */
  client_register: boolean;
}

/**
 * Workspace appearance configuration.
 */
export interface WorkspaceAppearance {
  /** Primary brand color */
  primary_color: string | null;

  /** Secondary brand color */
  secondary_color: string | null;

  /** Theme mode (light/dark) */
  theme_mode: string | null;
}

/**
 * Response from getting workspace details.
 */
export interface WorkspaceDetailsResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Workspace details result */
  result: {
    /** Unique identifier of the workspace */
    workspace_id: string;

    /** Name of the workspace */
    workspace_name: string;

    /** Email associated with the workspace */
    email: string;

    /** Current subscription plan */
    plan: string;

    /** Custom domain for the workspace */
    domain: string | null;

    /** Subdomain domain for the workspace */
    subdomain_domain: string | null;

    /** Integrations configured for the workspace */
    integrations: Record<string, unknown>;

    /** Whitelabel configuration */
    whitelabel: WorkspaceWhitelabel;

    /** Appearance configuration */
    appearance: WorkspaceAppearance;

    /** Webhook URL for workspace events */
    webhook_url: string | null;

    /** Date when the workspace was created */
    created_date: string;
  };
}

/**
 * Request to update workspace settings.
 */
export interface WorkspaceUpdateRequest {
  /** Name of the workspace */
  workspace_name?: string;

  /** Default language for the workspace */
  workspace_language?: string;

  /** Webhook URL for workspace events */
  webhook_url?: string;
}

/**
 * Response from updating workspace settings.
 */
export interface WorkspaceUpdateResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Workspace update result */
  result: {
    /** Success message */
    message: string;

    /** Unique identifier of the updated workspace */
    workspace_id: string;

    /** Updated workspace name */
    workspace_name?: string;

    /** Updated workspace language */
    workspace_language?: string;

    /** Updated webhook URL */
    webhook_url?: string | null;
  };
}

/**
 * Request to add a team member to the workspace.
 */
export interface WorkspaceTeamMemberAddRequest {
  /** Email address of the team member to add */
  email: string;

  /** Role for the team member (workspace level) */
  role: 'Team';
}

/**
 * Response from adding a team member to the workspace.
 */
export interface WorkspaceTeamMemberAddResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Team member add result */
  result: {
    /** Unique identifier of the team member */
    member_id: string;

    /** Email address of the team member */
    email: string;

    /** Role assigned to the team member */
    role: string;

    /** Date when the team member was added */
    created_date: string;
  };
}

/**
 * Response from removing a team member from the workspace.
 */
export interface WorkspaceTeamMemberRemoveResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Team member remove result */
  result: {
    /** Success message */
    message: string;

    /** Unique identifier of the removed team member */
    member_id: string;
  };
}

/**
 * Request to add an integration to the workspace.
 */
export interface WorkspaceIntegrationAddRequest {
  /** Type of integration to add */
  integration_type: 'matomo';

  /** Configuration for the integration */
  config: MatomoConfig;
}

/**
 * Response from adding an integration to the workspace.
 */
export interface WorkspaceIntegrationAddResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Integration add result */
  result: {
    /** Success message */
    message: string;

    /** Type of integration added */
    integration_type: string;

    /** Updated integrations configuration */
    integrations: Record<string, unknown>;
  };
}

/**
 * Response from removing an integration from the workspace.
 */
export interface WorkspaceIntegrationRemoveResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Integration remove result */
  result: {
    /** Success message */
    message: string;

    /** Type of integration removed */
    integration_type: string;
  };
}

/**
 * Request to update workspace whitelabel settings.
 */
export interface WorkspaceWhitelabelRequest {
  /** Custom whitelabel domain */
  domain?: string;

  /** Subdomain domain for the workspace */
  subdomain_domain?: string;

  /** Custom email sender address */
  email_sender?: string;

  /** Whether client registration is enabled */
  wl_client_register?: boolean;
}

/**
 * Response from updating workspace whitelabel settings.
 */
export interface WorkspaceWhitelabelResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Whitelabel update result */
  result: {
    /** Success message */
    message: string;

    /** Updated whitelabel configuration */
    whitelabel: {
      /** Custom whitelabel domain */
      domain: string | null;

      /** Subdomain domain for the workspace */
      subdomain_domain: string | null;

      /** Custom email sender address */
      email_sender: string | null;

      /** Whether client registration is enabled */
      client_register: boolean;
    };
  };
}

/**
 * Request to update workspace appearance settings.
 */
export interface WorkspaceAppearanceRequest {
  /** Primary brand color */
  primary_color?: string;

  /** Secondary brand color */
  secondary_color?: string;

  /** Theme mode (light/dark) */
  theme_mode?: string;

  /** Custom code to inject in the header */
  custom_code_header?: string;

  /** Custom code to inject in the footer */
  custom_code_footer?: string;
}

/**
 * Response from updating workspace appearance settings.
 */
export interface WorkspaceAppearanceResponse {
  /** Indicates the operation was successful */
  success: true;

  /** Appearance update result */
  result: {
    /** Success message */
    message: string;

    /** Updated appearance configuration */
    appearance: {
      /** Primary brand color */
      primary_color: string | null;

      /** Secondary brand color */
      secondary_color: string | null;

      /** Theme mode (light/dark) */
      theme_mode: string | null;

      /** Custom code in the header */
      custom_code_header: string | null;

      /** Custom code in the footer */
      custom_code_footer: string | null;
    };
  };
}
