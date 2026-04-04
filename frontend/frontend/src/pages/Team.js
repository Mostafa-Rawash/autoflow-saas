import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

const Team = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="card p-8 text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gray-700/50 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">الفريق</h1>
        <p className="text-gray-400 mb-4">
          هذه الميزة قيد التطوير وستكون متاحة قريباً.
        </p>
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-400 rounded-full text-sm">
          <Sparkles className="w-4 h-4" /> قريباً
        </span>
      </div>
    </div>
  );
};

export default Team;
