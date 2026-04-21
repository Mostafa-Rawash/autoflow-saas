import { create } from 'zustand';
import type { Agent } from '../types';

type AgentState = {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
};

export const useAgentStore = create<AgentState>((set) => ({
  selectedAgent: null,
  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
}));
