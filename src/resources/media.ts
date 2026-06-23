/**
 * Media resource for the Lindo SDK
 *
 * Provides methods for uploading media files to website CDN storage.
 */

import { HttpClient } from '../http';

/**
 * Media upload request for a single file
 */
export interface MediaUploadRequest {
  /** Base64 encoded file data (with or without data URL prefix) */
  file_base64: string;
  /** Name of the file including extension */
  file_name: string;
  /** Type of media being uploaded */
  media_type?: 'images' | 'videos' | 'documents' | 'fonts';
  /** MIME type of the file */
  content_type?: string;
}

/**
 * Media upload result
 */
export interface MediaUploadResult {
  /** CDN URL of the uploaded file */
  url: string;
  /** Name of the uploaded file */
  file_name: string;
  /** Type of media uploaded */
  media_type: string;
}

/**
 * Batch upload result item
 */
export interface MediaBatchUploadResultItem {
  /** CDN URL of the uploaded file */
  url: string;
  /** Original file name */
  file_name: string;
  /** Type of media uploaded */
  media_type: string;
  /** Whether this file was uploaded successfully */
  success: boolean;
  /** Error message if upload failed */
  error?: string;
}

/**
 * Batch upload result
 */
export interface MediaBatchUploadResult {
  /** Array of upload results for each file */
  uploaded: MediaBatchUploadResultItem[];
  /** Total number of files processed */
  total: number;
  /** Number of files successfully uploaded */
  successful: number;
  /** Number of files that failed to upload */
  failed: number;
}

/**
 * Resource class for media upload operations.
 *
 * @example
 * ```typescript
 * // Upload a single image
 * const result = await client.media.upload('website-123', {
 *   file_base64: 'data:image/png;base64,...',
 *   file_name: 'hero.png'
 * });
 * console.log('Uploaded to:', result.result.url);
 *
 * // Upload multiple files
 * const batchResult = await client.media.uploadBatch('website-123', {
 *   files: [
 *     { file_base64: '...', file_name: 'image1.jpg' },
 *     { file_base64: '...', file_name: 'image2.jpg' }
 *   ]
 * });
 * ```
 */
export class MediaResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Upload a single media file.
   *
   * @param websiteId - The website ID to upload to
   * @param data - The upload data including base64 file content
   * @returns The upload response with CDN URL
   *
   * @example
   * ```typescript
   * const response = await client.media.upload('website-123', {
   *   file_base64: 'data:image/jpeg;base64,/9j/4AAQ...',
   *   file_name: 'hero-image.jpg',
   *   media_type: 'images'
   * });
   * console.log('CDN URL:', response.result.url);
   * ```
   */
  async upload(
    websiteId: string,
    data: MediaUploadRequest
  ): Promise<{ success: true; result: MediaUploadResult }> {
    return this.http.post(
      `/v1/workspace/website/${websiteId}/media/upload`,
      data
    );
  }

  /**
   * Upload multiple media files in a single request.
   *
   * @param websiteId - The website ID to upload to
   * @param data - The batch upload data with array of files (max 20)
   * @returns The batch upload response with results for each file
   *
   * @example
   * ```typescript
   * const response = await client.media.uploadBatch('website-123', {
   *   files: [
   *     { file_base64: '...', file_name: 'image1.jpg' },
   *     { file_base64: '...', file_name: 'image2.jpg' }
   *   ]
   * });
   * console.log(`Uploaded ${response.result.successful} of ${response.result.total} files`);
   * ```
   */
  async uploadBatch(
    websiteId: string,
    data: { files: MediaUploadRequest[] }
  ): Promise<{ success: true; result: MediaBatchUploadResult }> {
    return this.http.post(
      `/v1/workspace/website/${websiteId}/media/upload/batch`,
      data
    );
  }
}
