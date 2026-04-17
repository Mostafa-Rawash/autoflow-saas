import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, MessageSquare, Sparkles, Users, CalendarDays } from 'lucide-react';

const cards = [
  { label: 'Conversations', value: '0', icon: MessageSquare },
  { label: 'Messages', value: '0', icon: BarChart3 },
  { label: 'Active Users', value: '1', icon: Users },
  { label: 'Tasks Today', value: '0', icon: CalendarDays },
];

const quickActions = [
  { title: 'Complete onboarding', desc: 'Set up your workspace in a few steps', to: '/onboarding' },
  { title: 'Connect channels', desc: 'Bring WhatsApp or Telegram online', to: '/channels' },
  { title: 'Review conversations', desc: 'See your inbox and activity', to: '/conversations' },
];

const Dashboard = () => {
  const [userName, setUserName] = useState('there');
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUserName(JSON.parse(raw)?.name || 'there');
    } catch {}
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Welcome back
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Hello, {userName}</h1>
            <p className="text-slate-600 max-w-2xl">Your workspace is ready. Start with onboarding, connect your channels, and keep the UI simple and easy to scan.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold">
              Start onboarding <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/channels" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              Connect channels
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{c.value}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center"><c.icon className="w-5 h-5" /></div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        {quickActions.map((item) => (
          <Link key={item.title} to={item.to} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-sky-300 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-sky-500" />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;