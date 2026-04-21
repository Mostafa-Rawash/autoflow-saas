import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white" dir="auto">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/pages/Dashboard.tsx <<'EOF'
import React from 'react';
import { Card } from '../components/UI';

export default function Dashboard() {
  const stats = [
    ['Conversations', '1,284'],
    ['Cost', '$482.19'],
    ['Tokens', '2.4M'],
    ['Resolved', '78%'],
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-slate-500">Overview of usage, cost, and recent activity.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label}><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></Card>
        ))}
      </div>
      <Card className="min-h-80">
        <div className="text-lg font-semibold">Recent Activity</div>
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <div>AI Agent “Support Bot” answered conversation #1042</div>
          <div>New knowledge document indexed successfully</div>
          <div>Prompt version v12 promoted to active</div>
        </div>
      </Card>
    </div>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/pages/Agents.tsx <<'EOF'
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi } from '../api/agents.api';
import { Button, Card, Input, Select } from '../components/UI';
import type { Agent } from '../types';

export default function Agents() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ['agents'], queryFn: agentsApi.list });
  const [draft, setDraft] = useState<Partial<Agent>>({ name: '', provider: 'openai', model: 'gpt-4o-mini' });
  const create = useMutation({ mutationFn: agentsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }) });

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <h2 className="text-xl font-semibold">Create / Edit Agent</h2>
        <div className="mt-4 space-y-3">
          <Input placeholder="Agent name" value={draft.name || ''} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <Select value={draft.provider} onChange={(e) => setDraft((d) => ({ ...d, provider: e.target.value as Agent['provider'] }))}>
            <option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="gemini">Gemini</option><option value="mock">Mock</option>
          </Select>
          <Input placeholder="Model" value={draft.model || ''} onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))} />
          <textarea className="min-h-40 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder="System prompt" value={draft.system_prompt || ''} onChange={(e) => setDraft((d) => ({ ...d, system_prompt: e.target.value }))} />
          <Button className="bg-sky-500 text-white" onClick={() => create.mutate(draft)}>Save Agent</Button>
        </div>
      </Card>
      <div className="space-y-4">
        <Card><div className="text-lg font-semibold">Agents</div>{isLoading ? <div className="mt-4 text-sm text-slate-500">Loading...</div> : <div className="mt-4 space-y-3">{data.map((agent) => <div key={agent.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="font-medium">{agent.name}</div><div className="text-sm text-slate-500">{agent.provider} • {agent.model}</div></div>)}</div>}</Card>
        <Card><div className="text-lg font-semibold">Test Agent</div><div className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Run prompt tests, memory, tools, and citations here.</div></Card>
      </div>
    </div>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/pages/Conversations.tsx <<'EOF'
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '../api/conversations.api';
import { Card } from '../components/UI';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import type { Message } from '../types';

export default function Conversations() {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: conversations = [] } = useQuery({ queryKey: ['conversations'], queryFn: conversationsApi.list });
  const { data: messages = [] } = useQuery({ queryKey: ['messages', activeId], queryFn: () => conversationsApi.messages(activeId!), enabled: !!activeId });
  const send = useMutation({ mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) => conversationsApi.sendMessage(conversationId, content), onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', activeId] }) });

  const activeConversation = conversations[0];
  if (!activeConversation) return <Card>No conversations yet.</Card>;

  return (
    <div className="grid min-h-[calc(100vh-140px)] gap-4 xl:grid-cols-[360px_1fr]">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 p-4 font-semibold dark:border-slate-800">Conversations</div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {conversations.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)} className={`block w-full p-4 text-left ${activeId === c.id || (!activeId && c.id === activeConversation.id) ? 'bg-slate-100 dark:bg-slate-900' : ''}`}>
              <div className="font-medium">{c.contact_name}</div><div className="text-sm text-slate-500">{c.last_message}</div>
            </button>
          ))}
        </div>
      </Card>
      <Card className="flex min-h-0 flex-col overflow-hidden p-0">
        <div className="border-b border-slate-200 p-4 font-semibold dark:border-slate-800">{activeConversation.contact_name}</div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {(messages as Message[]).map((m) => <ChatMessage key={m.id} message={m} />)}
        </div>
        <ChatInput onSend={(content) => send.mutate({ conversationId: activeConversation.id, content })} loading={send.isPending} />
      </Card>
    </div>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/pages/Knowledge.tsx <<'EOF'
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { knowledgeApi } from '../api/knowledge.api';
import { Button, Card, Input } from '../components/UI';

export default function Knowledge() {
  const { data = [], isLoading } = useQuery({ queryKey: ['knowledge'], queryFn: knowledgeApi.list });
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-slate-500">Upload, process, and preview cited sources.</p>
        </div>
        <Button className="bg-sky-500 text-white">Upload Document</Button>
      </div>
      <Card><Input placeholder="Search knowledge..." /></Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? <Card>Loading...</Card> : data.map((doc: any) => <Card key={doc.id}><div className="font-semibold">{doc.title}</div><div className="mt-1 text-sm text-slate-500">{doc.status} • {doc.chunks ?? 0} chunks</div></Card>)}
      </div>
    </div>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/pages/Analytics.tsx <<'EOF'
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';
import { Card } from '../components/UI';
import { formatCurrency, formatNumber } from '../utils/format';

export default function Analytics() {
  const { data } = useQuery({ queryKey: ['analytics-summary'], queryFn: analyticsApi.summary });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><div className="text-sm text-slate-500">Token Usage</div><div className="mt-2 text-2xl font-semibold">{formatNumber(data?.tokenUsage || 0)}</div></Card>
        <Card><div className="text-sm text-slate-500">Cost</div><div className="mt-2 text-2xl font-semibold">{formatCurrency(data?.totalCost || 0)}</div></Card>
        <Card><div className="text-sm text-slate-500">Conversations</div><div className="mt-2 text-2xl font-semibold">{formatNumber(data?.conversations || 0)}</div></Card>
        <Card><div className="text-sm text-slate-500">Resolved Rate</div><div className="mt-2 text-2xl font-semibold">{Math.round((data?.resolvedRate || 0) * 100)}%</div></Card>
      </div>
      <Card className="h-96">Charts go here.</Card>
    </div>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/pages/Prompts.tsx <<'EOF'
import React from 'react';
import { Card, Button } from '../components/UI';

const versions = [
  { id: '1', version: 'v12', active: true },
  { id: '2', version: 'v11', active: false },
];

export default function Prompts() {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Prompt Versions</h1><Button className="bg-sky-500 text-white">New</Button></div>
        <div className="mt-4 space-y-3">{versions.map((v) => <div key={v.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="font-medium">{v.version} {v.active ? '(active)' : ''}</div></div>)}</div>
      </Card>
      <Card><div className="text-lg font-semibold">Editor</div><textarea className="mt-4 min-h-[500px] w-full rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900" defaultValue="You are a helpful support agent..." /></Card>
    </div>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/pages/Tools.tsx <<'EOF'
import React from 'react';
import { Card } from '../components/UI';

export default function Tools() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tool Execution Logs</h1>
      <Card>
        <div className="space-y-3 text-sm">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">send_email • success</div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">create_ticket • failure</div>
        </div>
      </Card>
    </div>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/pages/Settings.tsx <<'EOF'
import React from 'react';
import { Card, Input } from '../components/UI';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><div className="mb-4 text-lg font-semibold">Organization</div><Input placeholder="Organization name" /></Card>
        <Card><div className="mb-4 text-lg font-semibold">API Keys</div><Input placeholder="sk-••••••••••••••••" /></Card>
      </div>
    </div>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/App.tsx <<'EOF'
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Conversations from './pages/Conversations';
import Knowledge from './pages/Knowledge';
import Analytics from './pages/Analytics';
import Prompts from './pages/Prompts';
import Tools from './pages/Tools';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/prompts" element={<Prompts />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/main.tsx <<'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, refetchOnWindowFocus: false } } });

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
EOF
