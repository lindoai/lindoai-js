/**
 * Analytics resource for the Lindo SDK
 *
 * Provides methods for analytics operations.
 *
 * @satisfies Requirements 5.2
 */

import type { HttpClient, RequestOptions } from '../http';
import type { AnalyticsQuery, WorkspaceAnalytics, WebsiteAnalytics } from '../types';

/**
 * Extended analytics query with website_id for website analytics.
 */
export interface WebsiteAnalyticsQuery extends AnalyticsQuery {
  /** The website ID to get analytics for */
  website_id: string;
}

/**
 * Resource class for analytics operations.
 */
export class AnalyticsResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Gets analytics data for the current workspace.
   *
   * @param query - Optional query parameters for filtering
   * @returns The workspace analytics data
   *
   * @example
   * ```typescript
   * // Get all-time analytics
   * const analytics = await client.analytics.getWorkspace();
   *
   * // Get analytics for a specific period
   * const periodAnalytics = await client.analytics.getWorkspace({
   *   from: '2024-01-01',
   *   to: '2024-01-31'
   * });
   *
   * console.log('Total views:', analytics.total_views);
   * console.log('Unique visitors:', analytics.unique_visitors);
   * ```
   */
  async getWorkspace(query?: AnalyticsQuery): Promise<WorkspaceAnalytics> {
    const options: RequestOptions = {};

    if (query) {
      options.params = {};
      if (query.from) {
        options.params.from = query.from;
      }
      if (query.to) {
        options.params.to = query.to;
      }
    }

    return this.http.get<WorkspaceAnalytics>('/v1/ai/analytics/workspace', options);
  }

  /**
   * Gets analytics data for a specific website.
   *
   * @param query - Query parameters including website_id
   * @returns The website analytics data
   *
   * @example
   * ```typescript
   * // Get all-time analytics for a website
   * const analytics = await client.analytics.getWebsite({
   *   website_id: 'website-123'
   * });
   *
   * // Get analytics for a specific period
   * const periodAnalytics = await client.analytics.getWebsite({
   *   website_id: 'website-123',
   *   from: '2024-01-01',
   *   to: '2024-01-31'
   * });
   *
   * console.log('Total views:', analytics.total_views);
   * console.log('Top pages:', analytics.top_pages);
   * ```
   */
  async getWebsite(query: WebsiteAnalyticsQuery): Promise<WebsiteAnalytics> {
    const options: RequestOptions = {
      params: {
        website_id: query.website_id,
      },
    };

    if (query.from) {
      options.params!.from = query.from;
    }
    if (query.to) {
      options.params!.to = query.to;
    }

    return this.http.get<WebsiteAnalytics>('/v1/ai/analytics/website', options);
  }
}
