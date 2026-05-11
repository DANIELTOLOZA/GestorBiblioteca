import api from './axios';
import type { Book, Page } from '../types';

export const getBooks = (params?: { search?: string; categoryId?: number; page?: number; size?: number }) =>
  api.get<Page<Book>>('/api/books', { params }).then(r => r.data);

export const getBook = (id: number) =>
  api.get<Book>(`/api/books/${id}`).then(r => r.data);

export const createBook = (data: object) =>
  api.post<Book>('/api/books', data).then(r => r.data);

export const updateBook = (id: number, data: object) =>
  api.put<Book>(`/api/books/${id}`, data).then(r => r.data);

export const deleteBook = (id: number) =>
  api.delete(`/api/books/${id}`);
