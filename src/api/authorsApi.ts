import api from './axios';
import type { Author } from '../types';

export const getAuthors = () =>
  api.get<Author[]>('/api/authors').then(r => r.data);

export const createAuthor = (data: object) =>
  api.post<Author>('/api/authors', data).then(r => r.data);

export const updateAuthor = (id: number, data: object) =>
  api.put<Author>(`/api/authors/${id}`, data).then(r => r.data);

export const deleteAuthor = (id: number) =>
  api.delete(`/api/authors/${id}`);
