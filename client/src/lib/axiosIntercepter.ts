import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// 1. Define custom error and response interfaces for better type safety
export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: any;
  code?: string;
}

// Because the response interceptor unwraps `response.data`, all api.post/get/etc.
// calls return the body type T directly — not AxiosResponse<T>.
// This augmentation keeps TypeScript aware of that.
declare module 'axios' {
  export interface AxiosInstance {
    get<T = any>(url: string, config?: import('axios').AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: import('axios').AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, config?: import('axios').AxiosRequestConfig): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: import('axios').AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: import('axios').AxiosRequestConfig): Promise<T>;
  }
}

// 2. Create the Axios Instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://example.com',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Necessary if backend sets HttpOnly cookies
});

// 3. Request Interceptor: Attach headers or authorization tokens dynamically
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Client-side: Read token from cookies (if manually managed via JS)
    if (typeof window !== 'undefined') {
      const token = Cookies.get('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Server-side (Next.js SSR/Server Components): Dynamically fetch headers to prevent build crashes
      try {
        const { headers } = await import('next/headers');
        const cookieStore = await headers();
        const token = cookieStore.get('access_token')?.valueOf;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        // Fail silently or handle fallback if next/headers is called outside server runtime context
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 4. Response Interceptor: Flatten successful payloads and cleanly categorize error statuses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwraps the backend data directly, eliminating the repetitive 'response.data' layer in calls
    return response.data;
  },
  (error: AxiosError) => {
    const customError: ApiErrorResponse = {
      status: error.response?.status || 500,
      message: 'An unexpected error occurred.',
      errors: (error.response?.data as any)?.errors || null,
      code: (error.response?.data as any)?.code || 'UNKNOWN_ERROR',
    };

    if (error.response) {
      // The server responded with a status code outside the 2xx range
      const serverData = error.response.data as any;
      customError.message = serverData?.message || serverData?.error || customError.message;

      // Handle specific HTTP Status Codes cleanly
      switch (error.response.status) {
        case 400:
          console.error('[API Error 400] Bad Request:', customError.message);
          break;
        case 401:
          console.error('[API Error 401] Unauthorized. Clearing UI session…');
          if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            const isAdminArea = path.startsWith('/admin');

            // The HttpOnly cookies (cus_token / adm_token) can only be cleared
            // by the backend via POST /auth/logout.  We clear only the UI state
            // here and redirect so the user can log in again.
            if (isAdminArea) {
              import('../store/authStore').then(({ useAuthStore }) => {
                useAuthStore.getState().clearAuth();
              });
              if (!path.includes('/admin/login')) {
                window.location.href = '/admin/login';
              }
            } else {
              import('../store/customerAuthStore').then(({ useCustomerAuthStore }) => {
                useCustomerAuthStore.getState().clearAuth();
              });
              if (!path.includes('/customer/login')) {
                window.location.href = '/customer/login';
              }
            }
          }
          break;
        case 403:
          console.error('[API Error 403] Forbidden. You do not have permission.');
          break;
        case 404:
          console.error('[API Error 404] Resource Not Found:', error.config?.url);
          break;
        case 422:
          console.error('[API Error 422] Validation Failed:', customError.errors);
          break;
        case 500:
          console.error('[API Error 500] Internal Server Error.');
          break;
        default:
          console.error(`[API Error ${error.response.status}]:`, customError.message);
      }
    } else if (error.request) {
      // The request was made but no response was received (Network Down / Timeout)
      customError.status = 0;
      customError.code = 'NETWORK_ERROR';
      customError.message = 'Network error. Please check your internet connection.';
      console.error('[API Network Error]: No response received from server.');
    } else {
      // Something went wrong while setting up the request
      customError.message = error.message;
      console.error('[API Setup Error]:', error.message);
    }

    // Always return a rejected promise with your standardized error format
    return Promise.reject(customError);
  }
);

export default api;
