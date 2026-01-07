/**
 * API Client - AMU Platform
 *
 * Base HTTP client with authentication, error handling, and retry logic.
 *
 * "Ubuntu - I am because we are"
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  retry?: boolean;
  retryCount?: number;
  timeout?: number;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// =============================================================================
// ERROR CLASS
// =============================================================================

export class ApiRequestError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create abort controller with timeout
 */
function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

// =============================================================================
// API CLIENT CLASS
// =============================================================================

export class ApiClient {
  private getToken: (() => Promise<string | null>) | null = null;

  /**
   * Set the token provider function
   */
  setTokenProvider(getToken: () => Promise<string | null>): void {
    this.getToken = getToken;
  }

  /**
   * Make an authenticated API request
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      retry = true,
      retryCount = 0,
      timeout = DEFAULT_TIMEOUT,
    } = options;

    // Build URL
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Get auth token
    let authHeader: string | undefined;
    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (authHeader) {
      requestHeaders['Authorization'] = authHeader;
    }

    // Create timeout controller
    const controller = createTimeoutController(timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      // Parse response
      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        // Check for retryable errors
        if (retry && retryCount < MAX_RETRIES && response.status >= 500) {
          await sleep(RETRY_DELAY * (retryCount + 1));
          return this.request<T>(endpoint, {
            ...options,
            retryCount: retryCount + 1,
          });
        }

        throw new ApiRequestError(
          data.error || 'Request failed',
          data.code || 'REQUEST_ERROR',
          response.status
        );
      }

      return data as ApiResponse<T>;
    } catch (error) {
      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiRequestError('Request timed out', 'TIMEOUT', 408);
      }

      // Handle network errors with retry
      if (
        retry &&
        retryCount < MAX_RETRIES &&
        error instanceof TypeError &&
        error.message === 'Failed to fetch'
      ) {
        await sleep(RETRY_DELAY * (retryCount + 1));
        return this.request<T>(endpoint, {
          ...options,
          retryCount: retryCount + 1,
        });
      }

      // Re-throw ApiRequestError
      if (error instanceof ApiRequestError) {
        throw error;
      }

      // Wrap other errors
      throw new ApiRequestError(
        error instanceof Error ? error.message : 'Unknown error',
        'NETWORK_ERROR',
        0
      );
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const apiClient = new ApiClient();

// =============================================================================
// REACT HOOK HELPERS
// =============================================================================

/**
 * Initialize API client with auth context
 * Call this from a component that has access to useAuth
 */
export function initializeApiClient(getIdToken: () => Promise<string | null>): void {
  apiClient.setTokenProvider(getIdToken);
}
