import api from './axios';
import type { DashboardStats } from '../types';

export const getDashboardStats = () =>
  api.get<DashboardStats>('/api/dashboard/stats').then(r => r.data);
