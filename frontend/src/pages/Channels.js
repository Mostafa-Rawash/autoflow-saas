import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, RefreshCw, Check, X, Smartphone, Scan, Wifi, WifiOff } from 'lucide-react';
import { whatsappAPI } from '../api';
import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import toast from 'react-hot-toast';

const Channels = () => {
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const isMountedRef = useRef(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;
    checkWhatsAppStatus();
  }, []);

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const refreshFromServer = () => {
      checkWhatsAppStatus();
    };

    socket.on('connect', () => {
      const token = localStorage.getItem('token');
      if (token) socket.emit('join-channel', token);
      refreshFromServer();
    });

    const syncStatus = async (payload) => {
      if (payload?.channel !== 'whatsapp') return;
      const nextStatus = payload.status || 'disconnected';
      setWhatsappStatus((prev) => {
        const prevPersisted = prev?.persistedStatus || prev?.status;
        const shouldKeepConnected = prevPersisted === 'connected' && nextStatus !== 'connected';
        const mergedStatus = shouldKeepConnected ? 'connected' : nextStatus;
        return {
          ...(prev || {}),
          status: mergedStatus,
          persistedStatus: payload.persistedStatus || mergedStatus,
          lastError: payload.error || prev?.lastError || null,
          connectedAt: payload.connectedAt || prev?.connectedAt || (mergedStatus === 'connected' ? new Date().toISOString() : null),
          lastSyncAt: payload.lastSyncAt || new Date().toISOString()
        };
      });
      if (nextStatus === 'connected') {
        setShowQRModal(false);
        setQrCode(null);
        setConnecting(false);
        toast.success('✅ WhatsApp connected successfully!');
        await checkWhatsAppStatus();
      }
      if (nextStatus === 'disconnected') {
        setQrCode(null);
      }
    };

    socket.on(SOCKET_EVENTS.CHANNEL_STATUS_CHANGED, syncStatus);
    socket.on(SOCKET_EVENTS.WHATSAPP_QR, (payload) => {
      if (payload?.channel !== 'whatsapp') return;
      if (whatsappStatus?.status === 'connected' || whatsappStatus?.persistedStatus === 'connected') return;
      if (payload?.qr) setQrCode(payload.qr);
      setWhatsappStatus((prev) => ({
        ...(prev || {}),
        status: payload.status || 'connecting',
        persistedStatus: payload.status || 'connecting',
        lastSyncAt: new Date().toISOString()
      }));
      setShowQRModal(true);
      setConnecting(false);
    });
    socket.on(SOCKET_EVENTS.WHATSAPP_CONNECTED, syncStatus);
    socket.on(SOCKET_EVENTS.WHATSAPP_DISCONNECTED, syncStatus);
    socket.on(SOCKET_EVENTS.WHATSAPP_ERROR, syncStatus);

    return () => {
      socket.off();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      setLoading(true);
      const { data: whatsappResp } = await whatsappAPI.getStatus();
      const apiStatus = whatsappResp?.data?.status || null;
      setWhatsappStatus((prev) => {
        const previousConnected = prev?.persistedStatus === 'connected' || prev?.status === 'connected';
        const nextConnected = apiStatus === 'connected';
        const nextStatus = previousConnected || nextConnected ? 'connected' : (apiStatus || 'not_initialized');
        return {
          ...(whatsappResp?.data || {}),
          persistedStatus: prev?.persistedStatus || whatsappResp?.data?.persistedStatus || null,
          connectedAt: prev?.connectedAt || whatsappResp?.data?.connectedAt || null,
          lastSyncAt: whatsappResp?.data?.lastSyncAt || prev?.lastSyncAt || null,
          lastError: whatsappResp?.data?.lastError || prev?.lastError || null,
          status: nextStatus
        };
      });
      if ((apiStatus === 'initializing' || apiStatus === 'connecting') && !showQRModal) {
        setShowQRModal(true);
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (resetSession = false) => {
    try {
      setConnecting(true);
      setQrCode(null);
      setShowQRModal(true);
      const { data } = await whatsappAPI.connect(resetSession ? { resetSession: true } : {});
      if (data?.data?.qr) setQrCode(data.data.qr);
      await checkWhatsAppStatus();
      toast.success('📱 جاري توليد رمز QR...');
    } catch (error) {
      toast.error('فشل في الاتصال بواتس آب');
      setShowQRModal(false);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await whatsappAPI.disconnect();
      setWhatsappStatus((prev) => ({ ...(prev || {}), status: 'disconnected', persistedStatus: 'disconnected' }));
      setQrCode(null);
      setShowQRModal(false);
      toast.success('تم قطع اتصال واتس آب');
    } catch (error) {
      toast.error('فشل في قطع الاتصال');
    }
  };

  const handleRefreshQR = async () => {
    try {
      setConnecting(true);
      setQrCode(null);
      const { data } = await whatsappAPI.refreshQR();
      if (data?.data?.qr) setQrCode(data.data.qr);
      toast.success('جاري تحديث رمز QR...');
    } catch (error) {
      toast.error('فشل في تحديث QR');
    } finally {
      setConnecting(false);
    }
  };

  const whatsappPersistedStatus = whatsappStatus?.persistedStatus || null;
  const whatsappLiveStatus = whatsappStatus?.status || null;
  const isConnected = whatsappPersistedStatus === 'connected' || whatsappLiveStatus === 'connected';
  const whatsappDisplayStatus = isConnected ? 'connected' : (whatsappPersistedStatus || whatsappLiveStatus || 'disconnected');

  const comingSoonChannels = [
    { id: 'messenger', name: 'ماسنجر', icon: '💬', color: '#0084FF' },
    { id: 'instagram', name: 'إنستجرام', icon: '📷', color: '#E4405F' },
    { id: 'email', name: 'بريد إلكتروني', icon: '📧', color: '#EA4335' },
    { id: 'sms', name: 'SMS', icon: '📱', color: '#6B7280' },
    { id: 'livechat', name: 'Live Chat', icon: '💬', color: '#7C3AED' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">القنوات</h1>
          <p className="text-slate-500 mt-1">قم بتوصيل قنوات التواصل الخاصة بك</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isConnected ? '1 متصل' : 'غير متصل'}
          </span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-[#25D366]/20 to-[#128C7E]/20 p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl relative" style={{ background: '#25D366' }}>
                <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.377l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-dark-800" style={{ background: isConnected ? '#25D366' : '#ef4444' }}>
                  {isConnected ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">واتس آب</h3>
                <p className="text-slate-500 text-sm">توصيل رقم واتس آب الخاص بك</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-rose-50 text-rose-700'}`}>
              {whatsappDisplayStatus === 'connected' ? '✓ متصل' : 'غير متصل'}
            </span>
          </div>
        </div>

        <div className="p-6">
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-400">واتس آب متصل بنجاح</p>
                  <p className="text-sm text-slate-500">يمكنك الآن إرسال واستقبال الرسائل</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/conversations" className="btn-primary py-2.5 px-4 flex items-center gap-2">
                  <Scan className="w-4 h-4" />
                  عرض المحادثات
                </Link>
                <button onClick={handleDisconnect} className="px-4 py-2.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-red-500/30 transition-colors flex items-center gap-2">
                  <X className="w-4 h-4" />
                  قطع اتصال واتس آب
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-200/50 rounded-xl">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center">1</span>
                    اضغط على زر التوصيل
                  </h4>
                  <p className="text-sm text-slate-500">سيتم توليد رمز QR للاتصال</p>
                </div>
                <div className="p-4 bg-slate-200/50 rounded-xl">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center">2</span>
                    امسح رمز QR
                  </h4>
                  <p className="text-sm text-slate-500">افتح واتس آب → الإعدادات → الأجهزة المرتبطة</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleConnect(false)} disabled={connecting} className="flex-1 btn-primary py-4 text-lg flex items-center justify-center gap-3">
                  {connecting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      جاري التوصيل...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      توصيل واتس آب
                    </>
                  )}
                </button>
                <button onClick={handleDisconnect} className="px-4 py-4 rounded-lg bg-rose-50 text-rose-700 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                  <X className="w-5 h-5" />
                  قطع الاتصال
                </button>
                <button onClick={() => handleConnect(true)} disabled={connecting} className="px-4 py-4 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Sparkles className="w-5 h-5" />
                  ربط جديد من الصفر
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showQRModal && !isConnected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">امسح رمز QR بواسطة واتس آب</h3>
              <p className="text-slate-500 text-sm mb-6">افتح واتس آب على هاتفك ← الإعدادات ← الأجهزة المرتبطة ← ربط جهاز</p>

              <div className="bg-white p-6 rounded-2xl inline-block mb-4">
                {qrCode ? (
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCode)}`} alt="WhatsApp QR Code" className="w-56 h-56" />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <RefreshCw className="w-12 h-12 text-slate-500 animate-spin" />
                  </div>
                )}
              </div>

              <div className="bg-slate-200/50 rounded-lg p-4 mb-4 text-right">
                <ol className="text-sm text-slate-500 space-y-2">
                  <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center">1</span> افتح واتس آب على هاتفك</li>
                  <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center">2</span> اذهب إلى الإعدادات</li>
                  <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center">3</span> اختر الأجهزة المرتبطة</li>
                  <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center">4</span> اضغط على ربط جهاز وامسح الرمز</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button onClick={handleRefreshQR} disabled={connecting} className="flex-1 btn-secondary py-2.5 flex items-center justify-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${connecting ? 'animate-spin' : ''}`} />
                  تحديث الرمز
                </button>
                <button onClick={() => setShowQRModal(false)} className="px-4 py-2.5 rounded-lg bg-slate-200 hover:bg-dark-600 transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold text-slate-500">قنوات قادمة</h3>
          <span className="px-2 py-1 bg-gray-500/20 text-slate-500 text-xs rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> قريباً
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {comingSoonChannels.map((channel) => (
            <div key={channel.id} className="p-4 rounded-xl border border-slate-200 bg-slate-100/50 text-center cursor-not-allowed opacity-60 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2" style={{ background: `${channel.color}20` }}>
                {channel.icon}
              </div>
              <h3 className="font-medium text-slate-500 text-sm mb-1">{channel.name}</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-200 text-slate-500">
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
