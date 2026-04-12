import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, QrCode, RefreshCw, Check, X, Smartphone } from 'lucide-react';
import { whatsappAPI } from '../api';
import toast from 'react-hot-toast';

const Channels = () => {
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkWhatsAppStatus();
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      setLoading(true);
      const { data } = await whatsappAPI.getStatus();
      setWhatsappStatus(data.data);
      
      if (data.data?.status !== 'connected') {
        // Try to get QR code
        const qrRes = await whatsappAPI.getQR();
        if (qrRes.data?.data?.qr) {
          setQrCode(qrRes.data.data.qr);
        }
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const { data } = await whatsappAPI.connect();
      toast.success('WhatsApp connection initiated');
      
      // Poll for QR code
      const pollQR = async () => {
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const qrRes = await whatsappAPI.getQR();
          if (qrRes.data?.data?.qr) {
            setQrCode(qrRes.data.data.qr);
            break;
          }
        }
      };
      pollQR();
    } catch (error) {
      toast.error('Failed to connect WhatsApp');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await whatsappAPI.disconnect();
      setWhatsappStatus(null);
      setQrCode(null);
      toast.success('WhatsApp disconnected');
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  const handleRefreshQR = async () => {
    try {
      setConnecting(true);
      const { data } = await whatsappAPI.refreshQR();
      toast.success('QR refresh initiated');
      
      // Poll for new QR
      await new Promise(r => setTimeout(r, 3000));
      await checkWhatsAppStatus();
    } catch (error) {
      toast.error('Failed to refresh QR');
    } finally {
      setConnecting(false);
    }
  };

  const isConnected = whatsappStatus?.status === 'connected';

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
        <span className={`px-3 py-1 text-sm rounded-full ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          {isConnected ? '1 متصل' : 'غير متصل'}
        </span>
      </div>

      {/* WhatsApp Status Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl relative" style={{ background: '#25D36620' }}>
            📱
            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center`} style={{ background: isConnected ? '#25D366' : '#ef4444' }}>
              {isConnected ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold">واتس آب</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isConnected ? 'متصل' : 'غير متصل'}
              </span>
              {whatsappStatus?.info?.pushname && (
                <span className="text-xs text-gray-500">{whatsappStatus.info.pushname}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isConnected ? (
              <>
                <Link to="/conversations" className="btn-secondary py-2 px-3 text-sm">عرض المحادثات</Link>
                <button onClick={handleDisconnect} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30">
                  قطع الاتصال
                </button>
              </>
            ) : (
              <button 
                onClick={handleConnect} 
                disabled={connecting}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
              >
                {connecting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
                توصيل واتس آب
              </button>
            )}
          </div>
        </div>

        {/* QR Code Display */}
        {qrCode && !isConnected && (
          <div className="mt-6 pt-6 border-t border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">امسح رمز QR بواسطة واتس آب</h4>
              <button onClick={handleRefreshQR} className="text-sm text-primary-500 hover:underline flex items-center gap-1">
                <RefreshCw className="w-4 h-4" /> تحديث
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl inline-block">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} 
                alt="WhatsApp QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              افتح واتس آب ← الإعدادات ← الأجهزة المرتبطة ← ربط جهاز
            </p>
          </div>
        )}
      </div>

      {/* Coming Soon Channels */}
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
    </div>
  );
};

export default Channels;