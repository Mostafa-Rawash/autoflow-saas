import React, { useEffect, useState } from 'react';
import { FileText, History, Copy, RotateCcw, Sparkles } from 'lucide-react';
import { authAPI } from '../api';

const Prompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [current, setCurrent] = useState('');
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    authAPI.getMe().then(() => {
      return fetch('/api/prompts').then((r) => r.json());
    }).then((res) => {
      const list = res.prompts || [];
      setPrompts(list);
      setCurrent(list[0]?.description || 'You are AutoFlow\'s AI assistant.');
    });
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-sm font-medium mb-3">
          <FileText className="w-4 h-4" /> Prompt versioning
        </div>
        <h1 className="text-3xl font-bold">Prompt history and rollback</h1>
        <p className="text-slate-500 mt-1">Make prompt changes traceable, reversible, and safe for non-technical users.</p>
      </div>

      <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">System prompt</h3>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><Copy className="w-4 h-4" /> Copy</button>
          </div>
          <textarea
            className="w-full min-h-[260px] rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm outline-none focus:border-sky-500"
            defaultValue={`You are AutoFlow's AI assistant.

- Reply concisely.
- Be helpful and clear.
- Prefer Arabic for Arabic users.
- Use tools when needed.
- Reference knowledge when relevant.`}
          />
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Save new version</button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><RotateCcw className="w-4 h-4" /> Roll back</button>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2"><History className="w-4 h-4 text-sky-600" /><h3 className="font-semibold">Versions</h3></div>
          {versions.map((v) => (
            <div key={v.id} className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{v.id} · {v.label}</p>
                  <p className="text-xs text-slate-500">{v.updated}</p>
                </div>
                <button className="text-sky-600 text-sm font-semibold">Use</button>
              </div>
              <p className="mt-2 text-sm text-slate-600">{v.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <h3 className="font-semibold mb-2">Why this matters</h3>
          <p className="text-sm text-slate-500">Users need to know what changed when quality drops. Prompt versioning makes that simple.</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <h3 className="font-semibold mb-2">Rollback safety</h3>
          <p className="text-sm text-slate-500">One click should restore the last stable version without hunting through history.</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <h3 className="font-semibold mb-2">Traceability</h3>
          <p className="text-sm text-slate-500">Keep prompts tied to evaluation, feedback, and outcome history.</p>
        </div>
      </div>
    </div>
  );
};

export default Prompts;
