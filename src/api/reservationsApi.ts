import api from './axios';
import type { Reservation, Page } from '../types';

export const getReservations = (params?: { status?: string; page?: number; size?: number }) =>
  api.get<Page<Reservation>>('/api/reservations', { params }).then(r => r.data);

export const createReservation = (bookId: number) =>
  api.post<Reservation>('/api/reservations', { bookId }).then(r => r.data);

export const confirmReservation = (id: number) =>
  api.put<Reservation>(`/api/reservations/${id}/confirm`).then(r => r.data);

export const cancelReservation = (id: number) =>
  api.put<Reservation>(`/api/reservations/${id}/cancel`).then(r => r.data);

export const getMyReservations = (page = 0, size = 10) =>
  api.get<Page<Reservation>>('/api/reservations/my', { params: { page, size } }).then(r => r.data);
