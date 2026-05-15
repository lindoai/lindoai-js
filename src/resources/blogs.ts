/**
 * Blogs resource for the Lindo SDK
 *
 * Provides methods for managing website blog posts (API key authentication).
 *
 * @satisfies Requirements 25.2
 */

import { HttpClient } from '../http';
import type {
  BlogListResponse,
  BlogDetailsResponse,
  BlogUnpublishResponse,
} from '../types';

/**
 * Resource class for blog management operations.
 *
 * These endpoints require API key authentication.
 *
 * @example
 * ```typescript
 * // List all blogs for a website
 * const blogs = await client.blogs.list('website-123');
 *
 * // Get blog details
 * const blog = await client.blogs.get('website-123', 'blog-456');
 *
 * // Publish a blog
 * await client.blogs.publish('website-123', 'blog-456');
 *
 * // Unpublish a blog
 * await client.blogs.unpublish('website-123', 'blog-456');
 * ```
 */
export class BlogsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all blog posts for a website.
   *
   * Returns a paginated list of blogs (template_type = 'Blog Post') for the specified website.
   * Supports optional search filtering by name or path.
   *
   * @param websiteId - The website ID to list blogs for
   * @param options - Optional pagination and search parameters
   * @returns The blog list response
   *
   * @example
   * ```typescript
   * // List all blogs
   * const response = await client.blogs.list('website-123');
   * for (const blog of response.result.list) {
   *   console.log(blog.name, blog.path);
   * }
   *
   * // List with pagination and search
   * const response = await client.blogs.list('website-123', {
   *   page: 2,
   *   search: 'tutorial'
   * });
   * ```
   */
  async list(
    websiteId: string,
    options?: { page?: number; search?: string }
  ): Promise<BlogListResponse> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (options?.page !== undefined) params.page = options.page;
    if (options?.search !== undefined) params.search = options.search;

    return this.http.get<BlogListResponse>(
      `/v1/workspace/website/${websiteId}/blogs/list`,
      { params }
    );
  }

  /**
   * Get detailed information about a specific blog post.
   *
   * Returns blog details including SEO metadata, blog_settings, and data fields.
   *
   * @param websiteId - The website ID the blog belongs to
   * @param blogId - The blog ID to retrieve
   * @returns The blog details response
   *
   * @example
   * ```typescript
   * const response = await client.blogs.get('website-123', 'blog-456');
   * console.log(response.result.name);
   * console.log(response.result.seo);
   * console.log(response.result.blog_settings);
   * ```
   */
  async get(websiteId: string, blogId: string): Promise<BlogDetailsResponse> {
    return this.http.get<BlogDetailsResponse>(
      `/v1/workspace/website/${websiteId}/blogs/${blogId}`
    );
  }

  /**
   * Update a blog using PATCH semantics.
   *
   * Updates blog metadata including name, path, SEO, blog_settings, data, and language.
   * Uses PATCH semantics: undefined = no change, null = clear field, value = set field.
   *
   * @param websiteId - The website ID the blog belongs to
   * @param blogId - The blog ID to update
   * @param fields - The fields to update
   * @returns The update response
   *
   * @example
   * ```typescript
   * const response = await client.blogs.update('website-123', 'blog-456', {
   *   name: 'Updated Blog Title',
   *   language: 'en'
   * });
   * console.log(response.result.message);
   * ```
   */
  async update(
    websiteId: string,
    blogId: string,
    fields: {
      name?: string | null;
      path?: string | null;
      seo?: Record<string, unknown> | null;
      blog_settings?: Record<string, unknown> | null;
      data?: Record<string, unknown> | null;
      language?: string | null;
    }
  ): Promise<{ success: true; result: { message: string; blog_id: string; name?: string; path?: string; language?: string | null } }> {
    return this.http.patch(
      `/v1/workspace/website/${websiteId}/blogs/${blogId}`,
      fields
    );
  }

  /**
   * Unpublish a blog post.
   *
   * Clears the publish_date, removing the blog from public access.
   *
   * @param websiteId - The website ID the blog belongs to
   * @param blogId - The blog ID to unpublish
   * @returns The unpublish response with blog_id
   *
   * @example
   * ```typescript
   * const response = await client.blogs.unpublish('website-123', 'blog-456');
   * console.log('Unpublished blog:', response.result.blog_id);
   * ```
   */
  async unpublish(websiteId: string, blogId: string): Promise<BlogUnpublishResponse> {
    return this.http.post<BlogUnpublishResponse>(
      `/v1/workspace/website/${websiteId}/blogs/${blogId}/unpublish`
    );
  }
  /**
   * Get blog content for editing.
   *
   * Returns the editable content of a blog including blog_content, SEO, and blog_settings.
   * Used by CLI for live editing.
   *
   * @param websiteId - The website ID the blog belongs to
   * @param blogId - The blog ID to retrieve content for
   * @returns The blog content response
   *
   * @example
   * ```typescript
   * const response = await client.blogs.getHtml('website-123', 'blog-456');
   * console.log(response.result.blog_content);
   * console.log(response.result.seo);
   * console.log(response.result.blog_settings);
   * ```
   */
  async getHtml(websiteId: string, blogId: string): Promise<{
    success: true;
    result: {
      blog_id: string;
      blog_content: string;
      path: string;
      name: string;
      seo?: Record<string, unknown>;
      blog_settings?: Record<string, unknown>;
    };
  }> {
    return this.http.get(
      `/v1/workspace/website/${websiteId}/blogs/${blogId}/html`
    );
  }



  /**
   * Delete a blog post.
   *
   * Permanently deletes a blog. If the blog was published, also removes
   * the HTML file from storage and purges the cache.
   *
   * @param websiteId - The website ID the blog belongs to
   * @param blogId - The blog ID to delete
   * @returns The delete response with blog_id
   *
   * @example
   * ```typescript
   * const response = await client.blogs.delete('website-123', 'blog-456');
   * console.log('Deleted blog:', response.result.blog_id);
   * ```
   */
  async delete(websiteId: string, blogId: string): Promise<{ success: true; result: { message: string; blog_id: string; warnings?: string[] } }> {
    return this.http.delete(
      `/v1/workspace/website/${websiteId}/blogs/${blogId}`
    );
  }

  /**
   * Create a new blog post with content.
   *
   * Creates a new blog and publishes it with markdown/HTML content.
   *
   * @param websiteId - The website ID to create the blog in
   * @param data - The blog data including content, SEO, and blog_settings
   * @returns The create response with blog_id and publish_date
   *
   * @example
   * ```typescript
   * const response = await client.blogs.create('website-123', {
   *   path: '/blog/my-post',
   *   blog_content: '<p>Blog content here...</p>',
   *   seo: { page_title: 'My Post', meta_description: 'A great post' },
   *   blog_settings: { author: 'John Doe', excerpt: 'Summary...' }
   * });
   * console.log('Created blog:', response.result.blog_id);
   * ```
   */
  async create(
    websiteId: string,
    data: {
      path: string;
      blog_content: string;
      seo: {
        page_title: string;
        meta_description?: string;
        social_title?: string;
        social_description?: string;
        social_image?: string;
      };
      blog_settings: {
        author: string;
        excerpt?: string;
        category?: string;
        publish_date?: string;
        read_time?: string;
        author_image?: string;
      };
      settings?: Record<string, unknown>;
    }
  ): Promise<{ success: true; result: { message: string; blog_id: string; publish_date: number } }> {
    return this.http.post(
      `/v1/workspace/website/${websiteId}/blogs/create`,
      data
    );
  }

  /**
   * Publish/update a blog post with content.
   *
   * Updates and publishes a blog with markdown/HTML content.
   *
   * @param websiteId - The website ID the blog belongs to
   * @param blogId - The blog ID to publish
   * @param data - The blog data including content, SEO, and blog_settings
   * @returns The publish response with blog_id and publish_date
   *
   * @example
   * ```typescript
   * const response = await client.blogs.publish('website-123', 'blog-456', {
   *   path: '/blog/my-post',
   *   blog_content: '<p>Updated content...</p>',
   *   seo: { page_title: 'My Post' },
   *   blog_settings: { author: 'John Doe' }
   * });
   * console.log('Published:', response.result.publish_date);
   * ```
   */
  async publish(
    websiteId: string,
    blogId: string,
    data: {
      path: string;
      blog_content: string;
      seo: {
        page_title: string;
        meta_description?: string;
        social_title?: string;
        social_description?: string;
        social_image?: string;
      };
      blog_settings: {
        author: string;
        excerpt?: string;
        category?: string;
        publish_date?: string;
        read_time?: string;
        author_image?: string;
      };
      settings?: Record<string, unknown>;
    }
  ): Promise<{ success: true; result: { message: string; blog_id: string; publish_date: number } }> {
    return this.http.post(
      `/v1/workspace/website/${websiteId}/blogs/${blogId}/update`,
      data
    );
  }
}
