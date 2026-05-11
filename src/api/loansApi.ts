import api from './axios';
import type { Loan, Page } from '../types';

export const getLoans = (params?: { status?: string; page?: number; size?: number }) =>
  api.get<Page<Loan>>('/api/loans', { params }).then(r => r.data);

export const createLoan = (data: object) =>
  api.post<Loan>('/api/loans', data).then(r => r.data);

export const returnBook = (id: number) =>
  api.put<Loan>(`/api/loans/${id}/return`).then(r => r.data);

export const getMyLoans = (page = 0, size = 10) =>
  api.get<Page<Loan>>('/api/loans/my', { params: { page, size } }).then(r => r.data);
