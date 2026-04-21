import React, { useEffect, useMemo, useState } from 'react';
import { Bot, SlidersHorizontal, PlayCircle, Brain, Database, Wrench, MessageSquare, Sparkles, History } from 'lucide-react';
import { aiAgentAPI } from '../api';

const Agents = () => {
  const [query, setQuery] = useState('');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    aiAgentAPI.getAll()
      .then((res) => {
        if (!mounted) return;
        setAgents(res.data?.agents || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.response?.data?.error || err?.message || 'Failed to load agents');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const visibleAgents = useMemo(() => agents.filter((agent) => (agent.name || '').toLowerCase().includes(query.toLowerCase())), [agents, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-sm font-medium mb-3">
            <Bot className="w-4 h-4" /> AI Agents
          </div>
          <h1 className="text-3xl font-bold">Configuration hub</h1>
          <p className="text-slate-500 mt-1">Manage provider, model, system prompt, memory, tools, and testing in one place.</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 w-fit">
          <Sparkles className="w-4 h-4" /> New agent
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-3">
          <Brain className="w-5 h-5 text-sky-600" />
          <div>
            <p className="font-semibold">AI product direction</p>
            <p className="text-sm text-slate-500">Prompt, memory, tools, and traces should be visible to users — not hidden behind backend assumptions.</p>
          </div>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search agents..." className="bg-white border border-slate-300 rounded-2xl py-3 px-4 outline-none focus:border-sky-500" />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
      ) : null}

      <div className="grid xl:grid-cols-2 gap-4">
        {loading ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm text-slate-500">Loading agents…</div>
        ) : null}
        {visibleAgents.map((agent) => (
          <div key={agent._id || agent.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{agent.name}</h3>
                  <p className="text-sm text-slate-500">{agent.provider} · {agent.model}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${agent.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {agent.status}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">Memory</p><p className="font-semibold">{agent.memoryEnabled ? 'Enabled' : 'Off'}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">Tools</p><p className="font-semibold">{agent.toolsEnabled ? 'Enabled' : 'Off'}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">Updated</p><p className="font-semibold">{new Date(agent.lastUpdated).toLocaleDateString()}</p></div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">System prompt</p>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600 whitespace-pre-wrap">{agent.systemPrompt}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap) => (
                <span key={cap} className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium">{cap}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold"><SlidersHorizontal className="w-4 h-4" /> Configure</button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><PlayCircle className="w-4 h-4" /> Test</button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><History className="w-4 h-4" /> Versions</button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2"><Database className="w-4 h-4 text-sky-600" /><h3 className="font-semibold">Memory visibility</h3></div>
          <p className="text-sm text-slate-500">Show what the AI remembers, where it came from, and what should be forgotten.</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2"><Wrench className="w-4 h-4 text-sky-600" /><h3 className="font-semibold">Tool execution</h3></div>
          <p className="text-sm text-slate-500">Expose tool calls, success/failure, inputs, outputs, and timings.</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4 text-sky-600" /><h3 className="font-semibold">Feedback loop</h3></div>
          <p className="text-sm text-slate-500">Let users rate outputs, add notes, and improve future responses.</p>
        </div>
      </div>
    </div>
  );
};

export default Agents;
