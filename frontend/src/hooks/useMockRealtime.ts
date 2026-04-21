import { useEffect, useState } from 'react';
import type { Message } from '../types';

export function useMockRealtime(conversationId?: string) {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!conversationId) return;
    const timer = window.setInterval(() => setTyping((v) => !v), 5000);
    return () => window.clearInterval(timer);
  }, [conversationId]);

  return { typing, messages, setMessages };
}
