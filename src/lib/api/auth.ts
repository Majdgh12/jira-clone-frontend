// src/lib/api/auth.ts
import { apiClient } from './client';

export interface LoginResponse {
  user: any;
  token: string;
  role: 'admin' | 'manager' | 'member';
  name: string;
  email: string;
}

export const AuthApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/register', { name, email, password }),
};
