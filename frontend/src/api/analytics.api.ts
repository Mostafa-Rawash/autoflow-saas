import { api } from './client';
import type { AnalyticsSummary } from '../types';

export const analyticsApi = {
  summary: async (): Promise<AnalyticsSummary> => (await api.get('/analytics/summary')).data,
};
