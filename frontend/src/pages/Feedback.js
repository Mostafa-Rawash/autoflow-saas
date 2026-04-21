import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Star } from 'lucide-react';
import { feedbackAPI } from '../api';

const Feedback = () => {
  const [items, setItems] = useState([]);
  const [rating, setRating] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    feedbackAPI.getAll().then((res) => setItems(res.data?.feedback || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-sm font-medium mb-3">
          <MessageSquare className="w-4 h-4" /> Feedback loop
        </div>
        <h1 className="text-3xl font-bold">Rate AI responses</h1>
        <p className="text-slate-500 mt-1">Let users rate answers and add notes so the system can improve over time.</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4 max-w-2xl">
        <div>
          <p className="font-semibold mb-2">Was this response useful?</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setRating('up')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 border text-sm font-semibold ${rating === 'up' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-300 text-slate-700'}`}>
              <ThumbsUp className="w-4 h-4" /> Helpful
            </button>
            <button onClick={() => setRating('down')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 border text-sm font-semibold ${rating === 'down' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-300 text-slate-700'}`}>
              <ThumbsDown className="w-4 h-4" /> Not helpful
            </button>
          </div>
        </div>

        <div>
          <p className="font-semibold mb-2">Notes</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full min-h-[140px] rounded-2xl border border-slate-300 bg-slate-50 p-4 outline-none focus:border-sky-500" placeholder="What should be improved?" />
        </div>

        <button onClick={() => feedbackAPI.create({ rating, notes })} className="btn-primary inline-flex items-center gap-2"><Star className="w-4 h-4" /> Submit feedback</button>
      </div>
    </div>
  );
};

export default Feedback;
