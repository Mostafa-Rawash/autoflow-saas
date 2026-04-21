export type ID = string;

export type Role = 'owner' | 'admin' | 'manager' | 'agent' | 'viewer';
export type Provider = 'openai' | 'anthropic' | 'gemini' | 'mock';
export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'escalated';
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool' | 'note';
export type DocumentStatus = 'processing' | 'ready' | 'failed';
export type ExecutionStatus = 'success' | 'failure' | 'running' | 'queued';

export interface Organization {
  id: ID;
  name: string;
  slug?: string;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: Role;
}

export interface Agent {
  id: ID;
  organization_id?: ID;
  name: string;
  provider: Provider;
  model: string;
  description?: string;
  system_prompt?: string;
  enabled?: boolean;
  capabilities?: {
    knowledge?: boolean;
    memory?: boolean;
    tools?: boolean;
    human_handoff?: boolean;
  };
}

export interface Conversation {
  id: ID;
  contact_name: string;
  channel: string;
  status: ConversationStatus;
  last_message?: string;
  unread_count?: number;
  assigned_agent_id?: ID | null;
  updated_at?: string;
}

export interface Message {
  id: ID;
  conversation_id: ID;
  role: MessageRole;
  content: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isTyping?: boolean;
}

export interface KnowledgeDocument {
  id: ID;
  title: string;
  source?: string;
  status: DocumentStatus;
  chunks?: number;
  created_at?: string;
}

export interface PromptVersion {
  id: ID;
  name: string;
  version: string;
  prompt: string;
  is_active?: boolean;
  created_at?: string;
}

export interface ToolExecution {
  id: ID;
  tool_name: string;
  status: ExecutionStatus;
  input?: string;
  output?: string;
  created_at?: string;
}

export interface AnalyticsSummary {
  tokenUsage: number;
  totalCost: number;
  conversations: number;
  resolvedRate: number;
}
