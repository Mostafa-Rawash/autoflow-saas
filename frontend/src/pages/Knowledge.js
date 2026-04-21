import React, { useEffect, useState } from 'react';
import { Database, Search, BookOpen, FileText, Sparkles } from 'lucide-react';
import { aiAgentAPI } from '../api';

const Knowledge = () => {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    fetch('/api/knowledge')
      .then((r) => r.json())
      .then((res) => setDocs(res.documents || []))
      .catch(() => setDocs([]));
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-sm font-medium mb-3">
          <Database className="w-4 h-4" /> Memory and knowledge
        </div>
        <h1 className="text-3xl font-bold">Knowledge base visibility</h1>
        <p className="text-slate-500 mt-1">Show what the AI knows, where it came from, and how it was chunked.</p>
      </div>

      <div className="grid xl:grid-cols-[0.8fr_1.2fr] gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2"><Search className="w-4 h-4 text-sky-600" /><h3 className="font-semibold">Indexed documents</h3></div>
          <div className="space-y-3">
            {docs.map((doc) => (
              <div key={doc.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{doc.title}</p>
                    <p className="text-xs text-slate-500">Source: {doc.source}</p>
                  </div>
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 mt-2">{doc.chunks} chunks indexed</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-sky-600" /><h3 className="font-semibold">How AI uses memory</h3></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 leading-7">
            <p>• User profile memory: business name, language preference, roles.</p>
            <p>• Conversation memory: recent context and unresolved questions.</p>
            <p>• Knowledge memory: FAQs, docs, policies, and product data.</p>
            <p>• Retrieval trace: show which chunks were used for each answer.</p>
          </div>
          <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-sky-600 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Future value</p>
              <p className="text-sm text-slate-600">When users can see what the AI remembers, trust goes up and debugging gets much easier.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
