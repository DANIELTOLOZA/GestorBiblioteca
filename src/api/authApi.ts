import api from './axios';
import type { AuthData } from '../types';

export const login = (email: string, password: string) =>
  api.post<AuthData>('/api/auth/login', { email, password }).then(r => r.data);

export const register = (name: string, email: string, password: string) =>
  api.post<AuthData>('/api/auth/register', { name, email, password }).then(r => r.data);
