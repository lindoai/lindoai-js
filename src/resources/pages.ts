/**
 * Pages resource for the Lindo SDK
 *
 * Provides methods for managing website pages (API key authentication).
 *
 * @satisfies Requirements 25.1
 */

import { HttpClient } from '../http';
import type {
  PageListResponse,
  PageDetailsResponse,
  PageUnpublishResponse,
} from '../types';

/**
 * Resource class for page management operations.
 *
 * These endpoints require API key authentication.
 *
 * @example
 * ```typescript
 * // List all pages for a website
 * const pages = await client.pages.list('website-123');
 *
 * // Get page details
 * const page = await client.pages.get('website-123', 'page-456');
 *
 * // Publish a page
 * await client.pages.publish('website-123', 'page-456');
 *
 * // Unpublish a page
 * await client.pages.unpublish('website-123', 'page-456');
 * ```
 */
export class PagesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all pages for a website.
   *
   * Returns a paginated list of pages (template_type = 'Web Page') for the specified website.
   * Supports optional search filtering by name or path.
   *
   * @param websiteId - The website ID to list pages for
   * @param options - Optional pagination and search parameters
   * @returns The page list response
   *
   * @example
   * ```typescript
   * // List all pages
   * const response = await client.pages.list('website-123');
   * for (const page of response.result.list) {
   *   console.log(page.name, page.path);
   * }
   *
   * // List with pagination and search
   * const response = await client.pages.list('website-123', {
   *   page: 2,
   *   search: 'about'
   * });
   * ```
   */
  async list(
    websiteId: string,
    options?: { page?: number; search?: string }
  ): Promise<PageListResponse> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (options?.page !== undefined) params.page = options.page;
    if (options?.search !== undefined) params.search = options.search;

    return this.http.get<PageListResponse>(
      `/v1/workspace/website/${websiteId}/pages/list`,
      { params }
    );
  }

  /**
   * Get detailed information about a specific page.
   *
   * Returns page details including SEO metadata, settings, and data fields.
   *
   * @param websiteId - The website ID the page belongs to
   * @param pageId - The page ID to retrieve
   * @returns The page details response
   *
   * @example
   * ```typescript
   * const response = await client.pages.get('website-123', 'page-456');
   * console.log(response.result.name);
   * console.log(response.result.seo.title);
   * console.log(response.result.status);
   * ```
   */
  async get(websiteId: string, pageId: string): Promise<PageDetailsResponse> {
    return this.http.get<PageDetailsResponse>(
      `/v1/workspace/website/${websiteId}/pages/${pageId}`
    );
  }

  /**
   * Update a page using PATCH semantics.
   *
   * Updates page metadata including name, path, SEO, settings, data, and language.
   * Uses PATCH semantics: undefined = no change, null = clear field, value = set field.
   *
   * @param websiteId - The website ID the page belongs to
   * @param pageId - The page ID to update
   * @param fields - The fields to update
   * @returns The update response
   *
   * @example
   * ```typescript
   * const response = await client.pages.update('website-123', 'page-456', {
   *   name: 'Updated Page Name',
   *   language: 'en'
   * });
   * console.log(response.result.message);
   * ```
   */
  async update(
    websiteId: string,
    pageId: string,
    fields: {
      name?: string | null;
      path?: string | null;
      seo?: Record<string, unknown> | null;
      settings?: Record<string, unknown> | null;
      data?: Record<string, unknown> | null;
      language?: string | null;
    }
  ): Promise<{ success: true; result: { message: string; page_id: string; name?: string; path?: string; language?: string | null } }> {
    return this.http.patch(
      `/v1/workspace/website/${websiteId}/pages/${pageId}`,
      fields
    );
  }

  /**
   * Unpublish a page.
   *
   * Clears the publish_date, removing the page from public access.
   *
   * @param websiteId - The website ID the page belongs to
   * @param pageId - The page ID to unpublish
   * @returns The unpublish response with page_id
   *
   * @example
   * ```typescript
   * const response = await client.pages.unpublish('website-123', 'page-456');
   * console.log('Unpublished page:', response.result.page_id);
   * ```
   */
  async unpublish(websiteId: string, pageId: string): Promise<PageUnpublishResponse> {
    return this.http.post<PageUnpublishResponse>(
      `/v1/workspace/website/${websiteId}/pages/${pageId}/unpublish`
    );
  }

  /**
   * Delete a page.
   *
   * Permanently deletes a page. If the page was published, also removes
   * the HTML file from storage and purges the cache.
   *
   * @param websiteId - The website ID the page belongs to
   * @param pageId - The page ID to delete
   * @returns The delete response with page_id
   *
   * @example
   * ```typescript
   * const response = await client.pages.delete('website-123', 'page-456');
   * console.log('Deleted page:', response.result.page_id);
   * ```
   */
  async deletePage(websiteId: string, pageId: string): Promise<{ success: true; result: { message: string; page_id: string; warnings?: string[] } }> {
    return this.http.delete(
      `/v1/workspace/website/${websiteId}/pages/${pageId}`
    );
  }

  /**
   * Create a new page with HTML content.
   *
   * Creates a new page and publishes it with full HTML content.
   *
   * @param websiteId - The website ID to create the page in
   * @param data - The create data including html, path, settings
   * @returns The create response with page_id and publish_date
   *
   * @example
   * ```typescript
   * const response = await client.pages.create('website-123', {
   *   html: '<section>...</section>',
   *   path: '/new-page'
   * });
   * console.log('Created page:', response.result.page_id);
   * ```
   */
  async create(
    websiteId: string,
    data: { 
      html: string; 
      path: string; 
      settings?: Record<string, unknown>;
      template_name?: string;
      custom_codes?: { header?: string; footer?: string };
      seo?: Record<string, unknown>;
    }
  ): Promise<{ success: true; result: { message: string; page_id: string; publish_date: number } }> {
    return this.http.post(
      `/v1/workspace/website/${websiteId}/pages/create`,
      data
    );
  }

  /**
   * Publish a page with HTML content.
   *
   * Creates or updates a page with full HTML content and publishes it.
   *
   * @param websiteId - The website ID the page belongs to
   * @param pageId - The page ID to publish
   * @param data - The publish data including html, path, settings, template_name, custom_codes
   * @returns The publish response
   *
   * @example
   * ```typescript
   * const response = await client.pages.publish('website-123', 'page-456', {
   *   html: '<html>...</html>',
   *   path: '/about'
   * });
   * console.log('Published:', response.result.publish_date);
   * ```
   */
  async publish(
    websiteId: string,
    pageId: string,
    data: { 
      html: string; 
      path: string; 
      settings?: Record<string, unknown>;
      template_name?: string;
      custom_codes?: { header?: string; footer?: string };
      seo?: Record<string, unknown>;
      global_header?: string;
      global_footer?: string;
    }
  ): Promise<{ success: true; result: { message: string; page_id: string; publish_date?: number } }> {
    return this.http.post(
      `/v1/workspace/website/${websiteId}/pages/${pageId}/update`,
      data
    );
  }

  /**
   * Get page HTML for editing.
   *
   * Returns the editable HTML content of a page. Used by CLI for live editing.
   *
   * @param websiteId - The website ID the page belongs to
   * @param pageId - The page ID to get HTML for
   * @returns The page HTML response
   *
   * @example
   * ```typescript
   * const response = await client.pages.getHtml('website-123', 'page-456');
   * console.log('HTML:', response.result.html);
   * console.log('Path:', response.result.path);
   * ```
   */
  async getHtml(websiteId: string, pageId: string): Promise<{ 
    success: true; 
    result: { 
      page_id: string; 
      html: string; 
      path: string; 
      name: string;
      seo?: {
        page_title?: string;
        meta_description?: string;
        social_title?: string;
        social_description?: string;
        social_image?: string;
        canonical_url?: string;
        noindex?: boolean;
        nofollow?: boolean;
      };
      settings?: {
        theme?: {
          mode?: string;
          direction?: string;
          main_classes?: string;
          animations_deactivated?: boolean;
        };
      };
      custom_codes?: {
        header?: string;
        footer?: string;
      };
    } 
  }> {
    return this.http.get(
      `/v1/workspace/website/${websiteId}/pages/${pageId}/html`
    );
  }
}
