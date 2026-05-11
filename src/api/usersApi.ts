import api from './axios';
import type { User, Page } from '../types';

export const getUsers = (page = 0, size = 10) =>
  api.get<Page<User>>('/api/users', { params: { page, size } }).then(r => r.data);

export const createUser = (data: object) =>
  api.post<User>('/api/users', data).then(r => r.data);

export const updateUser = (id: number, data: object) =>
  api.put<User>(`/api/users/${id}`, data).then(r => r.data);

export const toggleUserActive = (id: number) =>
  api.patch(`/api/users/${id}/toggle-active`);

export const deleteUser = (id: number) =>
  api.delete(`/api/users/${id}`);
