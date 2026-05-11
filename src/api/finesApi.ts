import api from './axios';
import type { Fine, Page } from '../types';

export const getFines = (params?: { paid?: boolean; page?: number; size?: number }) =>
  api.get<Page<Fine>>('/api/fines', { params }).then(r => r.data);

export const markFinePaid = (id: number) =>
  api.put<Fine>(`/api/fines/${id}/pay`).then(r => r.data);

export const getMyFines = (page = 0, size = 10) =>
  api.get<Page<Fine>>('/api/fines/my', { params: { page, size } }).then(r => r.data);
