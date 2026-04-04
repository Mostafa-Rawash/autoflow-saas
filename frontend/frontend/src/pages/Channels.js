import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, QrCode } from 'lucide-react';

const Channels = () => {
  const activeChannel = {
    id: 'whatsapp',
    name: 'واتس آب',
    icon: '📱',
    color: '#25D366',
    status: 'connected',
    messages: 523
  };

  const comingSoonChannels = [
    { id: 'messenger', name: 'ماسنجر', icon: '💬' },
    { id: 'instagram', name: 'إنستجرام', icon: '📷' },
    { id: 'telegram', name: 'تيليجرام', icon: '✈️' },
    { id: 'email', name: 'بريد إلكتروني', icon: '📧' },
    { id: 'sms', name: 'SMS', icon: '📱' },
    { id: 'livechat', name: 'Live Chat', icon: '🖥️' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">القنوات</h1>
          <p className="text-gray-400 mt-1">واتس آب هو القناة النشطة حالياً، والباقي قريباً</p>
        </div>
        <span className="status-active px-3 py-1 text-sm">1 متصل</span>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl relative" style={{ background: `${activeChannel.color}20` }}>
            {activeChannel.icon}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: activeChannel.color }}>
              <span className="text-white text-[10px] font-bold">✓</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold">{activeChannel.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="status-active">متصل</span>
              <span className="text-xs text-gray-500">{activeChannel.messages} رسالة</span>
            </div>
          </div>
          <Link to="/conversations" className="btn-secondary py-2 px-3 text-sm">عرض المحادثات</Link>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold text-gray-400">قنوات قادمة</h3>
          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> قريباً
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {comingSoonChannels.map((channel) => (
            <div key={channel.id} className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 text-center cursor-not-allowed opacity-60">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2 bg-gray-700/50">{channel.icon}</div>
              <h3 className="font-medium text-gray-400 text-sm mb-1">{channel.name}</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-400">
                <Lock className="w-3 h-3" /> قريباً
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-whatsapp/20 flex items-center justify-center text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-bold">توصيل واتس آب</h3>
            <p className="text-sm text-gray-400">توصيل عبر QR أو API مباشر — واتس آب فقط في المرحلة الحالية</p>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <QrCode className="w-4 h-4" /> عرض QR
          </button>
        </div>
      </div>
    </div>
  );
};

export default Channels;
