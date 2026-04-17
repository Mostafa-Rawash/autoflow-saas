import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, RefreshCw, ExternalLink, Power, Settings, QrCode, Lock, Sparkles, Loader2 } from 'lucide-react';
import { channelsAPI } from '../api';
import toast from 'react-hot-toast';

const Channels = () => {
  const [connecting, setConnecting] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Default channel definitions
  const defaultChannels = [
    { id: 'whatsapp', name: 'واتس آب', icon: '📱', color: '#25D366', available: true },
    { id: 'messenger', name: 'ماسنجر', icon: '💬', color: '#0084FF', available: false },
    { id: 'instagram', name: 'إنستجرام', icon: '📷', color: '#E4405F', available: false },
    { id: 'telegram', name: 'تيليجرام', icon: '✈️', color: '#0088cc', available: false },
    { id: 'livechat', name: 'Live Chat', icon: '🖥️', color: '#00D4AA', available: false },
    { id: 'email', name: 'بريد إلكتروني', icon: '📧', color: '#EA4335', available: false },
    { id: 'sms', name: 'SMS', icon: '📱', color: '#7C3AED', available: false },
    { id: 'api', name: 'API', icon: '🔗', color: '#F59E0B', available: true }
  ];

  const [channels, setChannels] = useState(defaultChannels.map(ch => ({
    ...ch,
    status: 'disconnected',
    lastSync: null,
    messages: 0
  })));

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const { data } = await channelsAPI.getAll();
      
      if (data.success && data.integrations) {
        // Merge API data with default channels
        const updatedChannels = defaultChannels.map(defCh => {
          const integration = data.integrations.find(i => i.type === defCh.id);
          if (integration) {
            return {
              ...defCh,
              status: integration.status === 'connected' ? 'connected' : 'disconnected',
              lastSync: integration.lastSync,
              messages: integration.messages || 0,
              integrationId: integration._id
            };
          }
          return defCh;
        });
        setChannels(updatedChannels);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      // Keep default state on error
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (channelId) => {
    setConnecting(channelId);
    setActionLoading(channelId);
    
    try {
      const { data } = await channelsAPI.connect({
        type: channelId,
        name: channels.find(c => c.id === channelId)?.name
      });
      
      if (data.success) {
        setChannels(prev => prev.map(ch => 
          ch.id === channelId 
            ? { ...ch, status: data.integration?.status === 'connected' ? 'connected' : 'pending', lastSync: new Date().toISOString(), integrationId: data.integration?._id }
            : ch
        ));
        toast.success(`تم توصيل ${channels.find(c => c.id === channelId)?.name} بنجاح!`);
      } else {
        toast.error(data.error || 'فشل في التوصيل');
      }
    } catch (error) {
      console.error('Error connecting channel:', error);
      toast.error(error.response?.data?.error || 'فشل في التوصيل');
    } finally {
      setConnecting(null);
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel?.integrationId) {
      // No integration in DB, just update local state
      setChannels(prev => prev.map(ch => 
        ch.id === channelId 
          ? { ...ch, status: 'disconnected', lastSync: null, integrationId: null }
          : ch
      ));
      toast.success('تم فصل القناة');
      return;
    }
    
    setActionLoading(channelId);
    try {
      await channelsAPI.disconnect(channel.integrationId);
      setChannels(prev => prev.map(ch => 
        ch.id === channelId 
          ? { ...ch, status: 'disconnected', lastSync: null, integrationId: null }
          : ch
      ));
      toast.success('تم فصل القناة');
    } catch (error) {
      console.error('Error disconnecting channel:', error);
      toast.error(error.response?.data?.error || 'فشل في فصل القناة');
    } finally {
      setActionLoading(null);
    }
  };

  const formatLastSync = (dateString) => {
    if (!dateString) return 'غير متصل';
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const connectedCount = channels.filter(c => c.status === 'connected').length;
  const availableCount = channels.filter(c => c.available).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">القنوات</h1>
          <p className="text-gray-400 mt-1">وصّل قنوات التواصل مع عملائك</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="status-active px-3 py-1 text-sm">
            {connectedCount} متصل
          </span>
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{connectedCount}</p>
          <p className="text-sm text-gray-500">قنوات متصلة</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">{availableCount}</p>
          <p className="text-sm text-gray-500">قنوات متاحة</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">
            {channels.reduce((sum, c) => sum + c.messages, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">رسالة هذا الأسبوع</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">{channels.length}</p>
          <p className="text-sm text-gray-500">قنوات مدعومة</p>
        </div>
      </div>

      {/* Available Channels Section */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold">قنوات متاحة الآن</h3>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            نشط
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.filter(c => c.available).map((channel) => (
            <div 
              key={channel.id} 
              className="p-5 rounded-xl border transition-all"
              style={{ 
                borderColor: channel.status === 'connected' ? `${channel.color}40` : '#374151',
                background: `${channel.color}05`
              }}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl relative"
                  style={{ background: `${channel.color}20` }}
                >
                  {channel.icon}
                  {channel.status === 'connected' && (
                    <div 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: channel.color }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-bold">{channel.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      channel.status === 'connected' ? 'status-active' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {channel.status === 'connected' ? 'متصل ✓' : 'غير متصل'}
                    </span>
                    {channel.status === 'connected' && (
                      <span className="text-xs text-gray-500">
                        {channel.messages} رسالة
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {channel.status === 'connected' ? (
                    <>
                      <Link
                        to={`/conversations?channel=${channel.id}`}
                        className="btn-secondary py-2 px-3 flex items-center gap-1 text-sm"
                        style={{ borderColor: `${channel.color}40` }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        عرض
                      </Link>
                      <button
                        onClick={() => handleDisconnect(channel.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(channel.id)}
                      disabled={connecting === channel.id}
                      className="btn-primary py-2 px-4 flex items-center gap-1 text-sm"
                      style={{ background: channel.color }}
                    >
                      {connecting === channel.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Power className="w-4 h-4" />
                          توصيل
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Channels Section */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold text-gray-400">قنوات الاتصال المدعومة</h3>
          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            قريباً
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {channels.filter(c => !c.available).map((channel) => (
            <div 
              key={channel.id} 
              className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 text-center cursor-not-allowed opacity-60 hover:opacity-80 transition-opacity"
              onClick={() => toast('هذه القناة قيد التطوير وستكون متاحة قريباً! 🚀', { icon: '🔜' })}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2 bg-gray-700/50">
                {channel.icon}
              </div>

              {/* Name */}
              <h3 className="font-medium text-gray-400 text-sm mb-1">{channel.name}</h3>

              {/* Coming Soon Badge */}
              <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-400 flex items-center gap-1 justify-center">
                <Lock className="w-3 h-3" />
                قريباً
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-4">
          نعمل على إضافة المزيد من القنوات لتوسيع نطاق تواصلك مع العملاء
        </p>
      </div>

      {/* WhatsApp QR Section */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-whatsapp/20 flex items-center justify-center text-2xl">
            📱
          </div>
          <div className="flex-1">
            <h3 className="font-bold">توصيل واتس آب</h3>
            <p className="text-sm text-gray-400">
              لوحة التحكم تتيح لك توصيل واتس آب عبر رمز QR أو API مباشر
            </p>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            عرض QR
          </button>
        </div>
      </div>

      {/* API Info */}
      <div className="card p-6">
        <h3 className="font-bold mb-4">معلومات API</h3>
        <div className="bg-dark-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">رابط API:</p>
          <code className="text-primary-400 text-sm">
            https://api.autoflow.com/v1/webhook/{'{channel}'}
          </code>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          استخدم API لتوصيل أنظمتك الخارجية بأي قناة مدعومة
        </p>
      </div>
    </div>
  );
};

export default Channels;