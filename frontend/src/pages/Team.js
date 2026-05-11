import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Team = () => {
  const theme = useTheme();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="card p-8 text-center max-w-md">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${theme === 'light' ? 'bg-slate-100' : 'bg-dark-700'}`}>
          <Lock className={`w-10 h-10 ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`} />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>الفريق</h1>
        <p className={`mb-4 ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
          هذه الميزة قيد التطوير وستكون متاحة قريباً.
        </p>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-dark-700 text-gray-400'}`}>
          <Sparkles className="w-4 h-4" /> قريباً
        </span>
      </div>
    </div>
  );
};

export default Team;