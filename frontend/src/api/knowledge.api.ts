import { api } from './client';
import type { KnowledgeDocument } from '../types';

export const knowledgeApi = {
  list: async (): Promise<KnowledgeDocument[]> => (await api.get('/knowledge/documents')).data,
  upload: async (formData: FormData) => (await api.post('/knowledge/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data,
};
