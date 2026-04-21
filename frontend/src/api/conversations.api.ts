import { api } from './client';
import type { Conversation, Message } from '../types';

export const conversationsApi = {
  list: async (): Promise<Conversation[]> => (await api.get('/conversations')).data,
  messages: async (conversationId: string): Promise<Message[]> => (await api.get(`/conversations/${conversationId}/messages`)).data,
  sendMessage: async (conversationId: string, content: string) => (await api.post(`/conversations/${conversationId}/messages`, { content })).data,
};
