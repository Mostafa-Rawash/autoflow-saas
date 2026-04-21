import React from 'react';

export const Button = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${className}`}>
    {children}
  </button>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 ${props.className || ''}`} />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 ${props.className || ''}`} />
);

export const Card = ({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}>{children}</div>
);

export const Modal = ({ open, children }: React.PropsWithChildren<{ open: boolean }>) => open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">{children}</div> : null;

export const Tabs = ({ items, active, onChange }: { items: string[]; active: string; onChange: (v: string) => void }) => (
  <div className="flex gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">{items.map((item) => <button key={item} onClick={() => onChange(item)} className={`rounded-xl px-3 py-2 text-sm ${active === item ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}>{item}</button>)}</div>
);

export const Table = ({ children }: React.PropsWithChildren) => <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800"><table className="w-full">{children}</table></div>;
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/components/Sidebar.tsx <<'EOF'
import React from 'react';
import { NavLink } from 'react-router-dom';

const items = [
  ['Dashboard', '/'],
  ['Conversations', '/conversations'],
  ['AI Agents', '/agents'],
  ['Knowledge Base', '/knowledge'],
  ['Prompt Versions', '/prompts'],
  ['Tool Logs', '/tools'],
  ['Analytics', '/analytics'],
  ['Settings', '/settings'],
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-8 text-xl font-bold">AutoFlow</div>
      <nav className="space-y-1">
        {items.map(([label, to]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `block rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900'}`}>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/components/Navbar.tsx <<'EOF'
import React from 'react';
import { Button } from './UI';
import { useUIStore } from '../store/uiStore';

export default function Navbar() {
  const { toggleTheme } = useUIStore();
  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
      <div>
        <div className="text-sm text-slate-500">Multi-tenant AI SaaS</div>
        <div className="text-lg font-semibold">Control Center</div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={toggleTheme} className="border border-slate-200 bg-white text-slate-700 dark:bg-slate-900">Theme</Button>
      </div>
    </header>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/components/ChatMessage.tsx <<'EOF'
import React from 'react';
import type { Message } from '../types';

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isUser ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'}`}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className={`mt-2 text-[11px] ${isUser ? 'text-sky-100' : 'text-slate-500'}`}>{new Date(message.created_at).toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
EOF

cat > /home/eDariba/autoflow-saas/frontend/src/components/ChatInput.tsx <<'EOF'
import React, { useState } from 'react';
import { Button, Input } from './UI';

export default function ChatInput({ onSend, loading }: { onSend: (value: string) => void; loading?: boolean }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Type a message..." />
      <Button disabled={loading || !value.trim()} onClick={() => { onSend(value); setValue(''); }} className="bg-sky-500 text-white disabled:opacity-50">Send</Button>
    </div>
  );
}
EOF
