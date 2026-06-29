/**
 * HTTP client for the Lindo SDK
 *
 * Provides a typed HTTP client wrapper with authentication,
 * error handling, and request/response serialization.
 *
 * @satisfies Requirements 5.4, 5.7, 5.8
 */

import {
  LindoError,
  NetworkError,
  TimeoutError,
  createErrorFromStatus,
} from './errors';

/**
 * Configuration options for the HTTP client.
 */
export interface HttpClientConfig {
  /** Base URL for API requests */
  baseUrl: string;

  /** API key for authentication */
  apiKey: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Custom headers to include in all requests */
  headers?: Record<string, string>;
}

/**
 * Options for individual HTTP requests.
 */
export interface RequestOptions {
  /** Query parameters to append to the URL */
  params?: Record<string, string | number | boolean | undefined>;

  /** Additional headers for this request */
  headers?: Record<string, string>;

  /** Request timeout override in milliseconds */
  timeout?: number;

  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
}

/**
 * Response from an HTTP request.
 */
export interface HttpResponse<T> {
  /** Response data */
  data: T;

  /** HTTP status code */
  status: number;

  /** Response headers */
  headers: Headers;
}

/**
 * HTTP client for making authenticated API requests.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers,
    };
  }

  /**
   * Makes a GET request.
   *
   * @param path - The API path (relative to base URL)
   * @param options - Request options
   * @returns The response data
   */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * Makes a POST request.
   *
   * @param path - The API path (relative to base URL)
   * @param body - The request body
   * @param options - Request options
   * @returns The response data
   */
  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  /**
   * Makes a PUT request.
   *
   * @param path - The API path (relative to base URL)
   * @param body - The request body
   * @param options - Request options
   * @returns The response data
   */
  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  /**
   * Makes a PATCH request.
   *
   * @param path - The API path (relative to base URL)
   * @param body - The request body
   * @param options - Request options
   * @returns The response data
   */
  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  /**
   * Makes a DELETE request.
   *
   * @param path - The API path (relative to base URL)
   * @param body - The request body (optional)
   * @param options - Request options
   * @returns The response data
   */
  async delete<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, body, options);
  }

  /**
   * Makes an HTTP request with full response details.
   *
   * @param method - The HTTP method
   * @param path - The API path (relative to base URL)
   * @param body - The request body
   * @param options - Request options
   * @returns The full HTTP response
   */
  async requestWithResponse<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    const url = this.buildUrl(path, options?.params);
    const headers = this.buildHeaders(options?.headers);
    const timeout = options?.timeout ?? this.timeout;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combine with user-provided signal if present
    const signal = options?.signal
      ? this.combineSignals(options.signal, controller.signal)
      : controller.signal;

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      });

      clearTimeout(timeoutId);

      // Parse response body
      const data = await this.parseResponse<T>(response);

      // Check for error status codes
      if (!response.ok) {
        throw this.createError(response.status, data);
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof LindoError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TimeoutError('Request timed out');
        }
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new NetworkError('Network request failed');
        }
      }

      throw new NetworkError('An unexpected error occurred');
    }
  }

  /**
   * Makes an HTTP request and returns just the data.
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const response = await this.requestWithResponse<T>(method, path, body, options);
    return response.data;
  }

  /**
   * Builds the full URL with query parameters.
   */
  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, this.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Builds the request headers with authentication.
   */
  private buildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    return {
      ...this.defaultHeaders,
      Authorization: `Bearer ${this.apiKey}`,
      ...additionalHeaders,
    };
  }

  /**
   * Parses the response body as JSON.
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      try {
        return (await response.json()) as T;
      } catch {
        // If JSON parsing fails, return empty object
        return {} as T;
      }
    }

    // For non-JSON responses, try to get text
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      // Return text wrapped in an object if it can't be parsed
      return { message: text } as T;
    }
  }

  /**
   * Creates an appropriate error from the response.
   */
  private createError(statusCode: number, data: unknown): LindoError {
    let message = 'An error occurred';
    let retryAfter: number | undefined;

    if (data && typeof data === 'object') {
      const errorData = data as Record<string, unknown>;
      if (typeof errorData.message === 'string') {
        message = errorData.message;
      } else if (typeof errorData.error === 'string') {
        message = errorData.error;
      }
      if (typeof errorData.retry_after === 'number') {
        retryAfter = errorData.retry_after;
      }
    }

    return createErrorFromStatus(statusCode, message, retryAfter);
  }

  /**
   * Combines multiple abort signals into one.
   */
  private combineSignals(signal1: AbortSignal, signal2: AbortSignal): AbortSignal {
    const controller = new AbortController();

    const abort = () => controller.abort();

    signal1.addEventListener('abort', abort);
    signal2.addEventListener('abort', abort);

    if (signal1.aborted || signal2.aborted) {
      controller.abort();
    }

    return controller.signal;
  }
}
