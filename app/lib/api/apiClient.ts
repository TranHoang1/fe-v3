/**
 * API Client - Centralized API configuration and methods
 * This file contains all API endpoints and methods for making requests
 */

// Base API configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8094',
  timeout: 30000,
  defaultHeaders: {
    'Content-Type': 'application/json',
    Accept: "*/*",
  }
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refreshToken: '/api/auth/refresh-token',
  },
  
  // Entity endpoints
  events: '/api/events',
  participants: '/api/participants',
  regions: '/api/regions',
  provinces: '/api/provinces',
  rewards: '/api/rewards',
  goldenHours: '/api/golden-hours',
  spinHistory: '/api/spin-history',
  auditLog: '/api/audit-log',
  users: '/api/users',
  roles: '/api/roles',
  
  // Wheel specific endpoints
  wheel: {
    spin: '/api/wheel/spin',
    segments: '/api/wheel/segments',
    history: '/api/wheel/history',
  }
};

// API request options interface - Add this interface definition
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  includeAuth?: boolean;
}

// Helper to get full URL for an endpoint
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.baseUrl.endsWith('/') 
    ? API_CONFIG.baseUrl.slice(0, -1) 
    : API_CONFIG.baseUrl;
  
  const formattedEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
  
  return `${baseUrl}${formattedEndpoint}`;
};

// Get auth token from localStorage
import { getAuthToken } from '@/app/lib/auth/authUtils';

// Main API request function
export const apiRequest = async <T>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T> => {
  const { 
    method = 'GET', 
    headers = {}, 
    body = null, 
    includeAuth = true 
  } = options;
  
  const url = getApiUrl(endpoint);
  
  const requestHeaders: Record<string, string> = {
    ...API_CONFIG.defaultHeaders,
    ...headers,
  };
  
  // Add auth token if needed
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        const redirectPath = window.location.pathname.replace(/^\/admin/, '');
        window.location.href = `/login?redirectTo=${encodeURIComponent(redirectPath)}`;
      }
      throw new Error('Authentication required');
    }
  }
  
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: includeAuth ? 'include' : 'same-origin', // Only include credentials when auth is required
  };
  
  if (body && method !== 'GET') {
    requestOptions.body = typeof body === 'object' ? JSON.stringify(body) : body;
  }
  
  try {
    // Make the request
    const response = await fetch(url, requestOptions);
    
    // Parse response
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        data
      };
    }
    
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Convenience methods for different HTTP methods
export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body: any, options?: Omit<ApiRequestOptions, 'method'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),
    
  put: <T>(endpoint: string, body: any, options?: Omit<ApiRequestOptions, 'method'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),
    
  patch: <T>(endpoint: string, body: any, options?: Omit<ApiRequestOptions, 'method'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
    
  delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
    
  // Auth specific methods
  auth: {
    login: (username: string, password: string) => 
      apiClient.post(API_ENDPOINTS.auth.login, { username, password }, { includeAuth: false }),
      
    logout: () => apiClient.post(API_ENDPOINTS.auth.logout, {}),
  }
};

export default apiClient;