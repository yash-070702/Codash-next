export interface SendOtpRequest {
  email: string;
  checkUserPresent: boolean;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  originalError?: Error;
}

export interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties
}

export interface AuthState {
  loading: boolean;
  user: User | null;
  isAuthenticated: boolean;
}