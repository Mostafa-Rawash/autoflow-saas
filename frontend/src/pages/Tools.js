import React, { useEffect, useState } from 'react';
import { Wrench, PlayCircle, CheckCircle2, AlertTriangle, Clock3 } from 'lucide-react';
import { logsAPI } from '../api';

const Tools = () => {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    logsAPI.getAll().then((res) => setRuns(res.data?.runs || res.data?.feedback || []));
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-sm font-medium mb-3">
          <Wrench className="w-4 h-4" /> Tool execution logs
        </div>
        <h1 className="text-3xl font-bold">Automation trace</h1>
        <p className="text-slate-500 mt-1">Show what tools ran, what they returned, and where they failed.</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Recent tool runs</h3>
            <p className="text-sm text-slate-500">A clear execution log helps debug AI behaviour quickly.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold"><PlayCircle className="w-4 h-4" /> Run test</button>
        </div>
        <div className="space-y-3">
          {runs.map((run, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {run.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <p className="font-semibold">{run.name}</p>
                </div>
                <p className="text-sm text-slate-500 mt-1">{run.output}</p>
              </div>
              <div className="text-right text-sm text-slate-500 shrink-0">
                <p className="inline-flex items-center gap-1"><Clock3 className="w-4 h-4" /> {run.duration}</p>
                <p className="mt-1 capitalize">{run.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tools;
