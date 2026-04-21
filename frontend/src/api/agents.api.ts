import { api } from './client';
import type { Agent } from '../types';

export const agentsApi = {
  list: async (): Promise<Agent[]> => (await api.get('/agents')).data,
  create: async (payload: Partial<Agent>) => (await api.post('/agents', payload)).data,
  update: async (id: string, payload: Partial<Agent>) => (await api.put(`/agents/${id}`, payload)).data,
};
