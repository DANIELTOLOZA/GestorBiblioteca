import api from './axios';
import type { Category } from '../types';

export const getCategories = () =>
  api.get<Category[]>('/api/categories').then(r => r.data);

export const createCategory = (data: object) =>
  api.post<Category>('/api/categories', data).then(r => r.data);

export const updateCategory = (id: number, data: object) =>
  api.put<Category>(`/api/categories/${id}`, data).then(r => r.data);

export const deleteCategory = (id: number) =>
  api.delete(`/api/categories/${id}`);
