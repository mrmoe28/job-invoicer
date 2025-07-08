'use client';

import { useState, useCallback } from 'react';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

export interface ApiOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

const DEFAULT_OPTIONS: ApiOptions = {
  baseUrl: '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
};

export function useApi<T = any>(options: ApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Helper to get auth token
  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pulse_auth_token');
  }, []);

  // Enhanced fetch with error handling
  const apiCall = useCallback(
    async <R = T>(
      endpoint: string,
      requestOptions: RequestInit = {}
    ): Promise<R> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const authToken = getAuthToken();
        const url = `${mergedOptions.baseUrl}${endpoint}`;
        
        const headers = {
          ...mergedOptions.headers,
          ...requestOptions.headers,
        };

        // Add auth header if token exists
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);

        const response = await fetch(url, {
          ...requestOptions,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}`;
          let errorCode = response.status.toString();

          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            errorCode = errorData.code || errorCode;
          } catch {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        let data: R;

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = (await response.text()) as unknown as R;
        }

        setState({
          data: data as T,
          isLoading: false,
          error: null,
        });

        return data;

      } catch (error) {
        const apiError: ApiError = {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          status: error instanceof Error && 'status' in error ? (error as any).status : undefined,
        };

        setState({
          data: null,
          isLoading: false,
          error: apiError,
        });

        throw error;
      }
    },
    [mergedOptions, getAuthToken]
  );

  // HTTP method helpers
  const get = useCallback(
    <R = T>(endpoint: string, options?: RequestInit) =>
      apiCall<R>(endpoint, { ...options, method: 'GET' }),
    [apiCall]
  );

  const post = useCallback(
    <R = T>(endpoint: string, data?: any, options?: RequestInit) =>
      apiCall<R>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiCall]
  );

  const put = useCallback(
    <R = T>(endpoint: string, data?: any, options?: RequestInit) =>
      apiCall<R>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiCall]
  );

  const patch = useCallback(
    <R = T>(endpoint: string, data?: any, options?: RequestInit) =>
      apiCall<R>(endpoint, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiCall]
  );

  const del = useCallback(
    <R = T>(endpoint: string, options?: RequestInit) =>
      apiCall<R>(endpoint, { ...options, method: 'DELETE' }),
    [apiCall]
  );

  // Clear state
  const clearState = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    patch,
    delete: del,
    apiCall,
    clearState,
  };
}