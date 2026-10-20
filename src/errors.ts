/**
 * Error classes for the Lindo SDK
 *
 * Provides custom error classes for common HTTP error codes and API errors.
 * These errors include status codes and descriptive messages for debugging.
 *
 * @satisfies Requirements 5.4
 */

/**
 * Base error class for all Lindo SDK errors.
 * Contains the HTTP status code and error message.
 */
export class LindoError extends Error {
  /** HTTP status code of the error response */
  readonly statusCode: number;

  /** Error code for programmatic handling */
  readonly code: string;

  constructor(message: string, statusCode: number, code: string = 'LINDO_ERROR') {
    super(message);
    this.name = 'LindoError';
    this.statusCode = statusCode;
    this.code = code;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when authentication fails (HTTP 401).
 * This typically occurs when the API key is invalid or expired.
 */
export class AuthenticationError extends LindoError {
  constructor(message: string = 'Authentication failed. Please check your API key.') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when the request is forbidden (HTTP 403).
 * This typically occurs when the user doesn't have permission to access the resource.
 */
export class ForbiddenError extends LindoError {
  constructor(message: string = 'Access forbidden. You do not have permission to access this resource.') {
    super(message, 403, 'FORBIDDEN_ERROR');
    this.name = 'ForbiddenError';
  }
}

/**
 * Error thrown when a resource is not found (HTTP 404).
 * This typically occurs when the requested resource doesn't exist.
 */
export class NotFoundError extends LindoError {
  constructor(message: string = 'Resource not found.') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when the request is invalid (HTTP 400).
 * This typically occurs when the request body or parameters are malformed.
 */
export class ValidationError extends LindoError {
  /** Validation errors for specific fields */
  readonly errors?: Record<string, string[]>;

  constructor(message: string = 'Validation failed.', errors?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Error thrown when rate limit is exceeded (HTTP 429).
 * This typically occurs when too many requests are made in a short period.
 */
export class RateLimitError extends LindoError {
  /** Time in seconds until the rate limit resets */
  readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded. Please try again later.', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when the server encounters an internal error (HTTP 500).
 * This typically indicates a problem on the server side.
 */
export class ServerError extends LindoError {
  constructor(message: string = 'Internal server error. Please try again later.') {
    super(message, 500, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

/**
 * Error thrown when a network error occurs.
 * This typically occurs when the request cannot be completed due to network issues.
 */
export class NetworkError extends LindoError {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Error thrown when a request times out.
 * This typically occurs when the server takes too long to respond.
 */
export class TimeoutError extends LindoError {
  constructor(message: string = 'Request timed out. Please try again.') {
    super(message, 0, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

/**
 * Maps an HTTP status code to the appropriate error class.
 *
 * @param statusCode - The HTTP status code
 * @param message - The error message
 * @param retryAfter - Optional retry-after value for rate limit errors
 * @returns The appropriate error instance
 */
export function createErrorFromStatus(
  statusCode: number,
  message: string,
  retryAfter?: number
): LindoError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 429:
      return new RateLimitError(message, retryAfter);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message);
    default:
      return new LindoError(message, statusCode);
  }
}
