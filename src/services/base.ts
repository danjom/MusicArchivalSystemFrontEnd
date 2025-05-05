import { ApiError } from '../models/types';
import { authStore } from '../stores/auth';

export class BaseService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
  }

  protected async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const { accessToken, refreshToken } = authStore;
    if (!accessToken) {
      console.error('No access token found in auth store');
      throw new ApiError({
        message: 'Authentication required',
        status: 401,
        errors: {},
      });
    }

    headers['Authorization'] = `Bearer ${accessToken}`;

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      // If we get a 401, try to refresh the token
      if (response.status === 401 && refreshToken) {
        try {
          const refreshResponse = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (!refreshResponse.ok) {
            throw new Error('Failed to refresh token');
          }

          const { access_token, refresh_token } = await refreshResponse.json();
          authStore.setTokens(access_token, refresh_token);

          // Retry the original request with the new token
          headers['Authorization'] = `Bearer ${access_token}`;
          const retryResponse = await fetch(url.toString(), {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
          });

          if (!retryResponse.ok) {
            const error = await retryResponse.json();
            throw new ApiError({
              message: error.detail || 'An error occurred',
              status: retryResponse.status,
              errors: error.errors || {},
            });
          }

          if (method === 'DELETE') {
            return {} as T;
          }

          const text = await retryResponse.text();
          return text ? JSON.parse(text) : ({} as T);
        } catch (refreshError) {
          // If refresh fails, logout the user
          authStore.logout();
          throw new ApiError({
            message: 'Session expired. Please login again.',
            status: 401,
            errors: {},
          });
        }
      }

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError({
          message: error.detail || 'An error occurred',
          status: response.status,
          errors: error.errors || {},
        });
      }

      if (method === 'DELETE') {
        return {} as T;
      }

      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  protected async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, params);
  }

  protected async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}