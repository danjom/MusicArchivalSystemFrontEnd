import axios from 'axios';
import type { LoginRequest, RegisterRequest, TokenResponse, UserData } from '../types/auth';
import { authStore } from '../stores/auth';

const API_URL = 'http://localhost:8001/api/v1';

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to add auth token
authApi.interceptors.request.use((config) => {
  const { accessToken } = authStore;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refreshToken } = authStore;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const response = await authApi.post<TokenResponse>('/auth/refresh', {
          refresh_token: refreshToken,
        });
        authStore.setTokens(response.data.access_token, response.data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        authStore.logout();
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await authApi.post<TokenResponse>('/auth/login', data);
    authStore.setTokens(response.data.access_token, response.data.refresh_token);
    // Fetch and set user data after successful login
    await authService.getCurrentUser();
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<UserData> => {
    try {
      console.log('Sending registration request to:', `${API_URL}/users/`);
      const response = await authApi.post<UserData>('/users/', data);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Error response:', error.response.data);
          throw new Error(error.response.data.detail || 'Registration failed');
        } else if (error.request) {
          console.error('No response received:', error.request);
          if (error.message.includes('CORS')) {
            throw new Error('CORS error: Please ensure the backend server has CORS properly configured to allow requests from http://localhost:5173');
          }
          throw new Error('No response from server. Please check if the backend is running and CORS is properly configured.');
        }
      }
      throw error;
    }
  },

  getCurrentUser: async (): Promise<UserData> => {
    const response = await authApi.get<UserData>('/users/me');
    authStore.setUser(response.data);
    return response.data;
  },

  logout: () => {
    authStore.logout();
  },
};