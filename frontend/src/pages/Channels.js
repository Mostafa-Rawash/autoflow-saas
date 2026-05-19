import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, RefreshCw, Check, X, Smartphone, Scan, Wifi, WifiOff, Send } from 'lucide-react';
import { whatsappAPI, whatsappBusinessAPI, telegramAPI, channelsAPI, instagramAPI, messengerAPI } from '../api';
import toast from 'react-hot-toast';

const Channels = () => {
  const theme = useTheme();
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [telegramConnection, setTelegramConnection] = useState(null);
  const [telegramConnecting, setTelegramConnecting] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramBotUsername, setTelegramBotUsername] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [whatsappMode, setWhatsappMode] = useState('web'); // 'web' or 'business_api'
  const [businessApiForm, setBusinessApiForm] = useState({ phoneNumberId: '', accessToken: '', businessAccountId: '', wabaId: '' });
  const [businessApiConnecting, setBusinessApiConnecting] = useState(false);
  const [businessApiStatus, setBusinessApiStatus] = useState(null);
  const [instagramStatus, setInstagramStatus] = useState(null);
  const [instagramConnecting, setInstagramConnecting] = useState(false);
  const [instagramForm, setInstagramForm] = useState({ pageId: '', pageAccessToken: '', igUserId: '' });
  const [messengerStatus, setMessengerStatus] = useState(null);
  const [messengerConnecting, setMessengerConnecting] = useState(false);
  const [messengerForm, setMessengerForm] = useState({ pageId: '', pageAccessToken: '' });

  useEffect(() => {
    checkWhatsAppStatus();
    checkTelegramStatus();
    checkWhatsappMode();
    checkBusinessApiStatus();
    checkInstagramStatus();
    checkMessengerStatus();
    // Poll QR every 3 seconds only when modal is open AND not yet connected
    const interval = setInterval(() => {
      if (showQRModal && !connecting && !isConnected) {
        pollQRCode();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [showQRModal, connecting]);

  const checkWhatsAppStatus = async () => {
    try {
      setLoading(true);
      const [{ data: whatsappResp }, { data: channelsResp }] = await Promise.all([
        whatsappAPI.getStatus(),
        channelsAPI.getAll()
      ]);
      const persistedWhatsApp = (channelsResp?.channels || []).find((ch) => ch.type === 'whatsapp');
      const nextStatus = persistedWhatsApp?.status || whatsappResp?.status || 'not_initialized';
      setWhatsappStatus({
        ...(whatsappResp || {}),
        persistedStatus: persistedWhatsApp?.status || null,
        connectedAt: persistedWhatsApp?.connectedAt || null,
        lastSyncAt: persistedWhatsApp?.lastSyncAt || null,
        lastError: persistedWhatsApp?.lastError || whatsappResp?.lastError || null,
        status: nextStatus
      });
      if ((nextStatus === 'initializing' || nextStatus === 'connecting' || nextStatus === 'qr_ready') && !showQRModal) {
        setShowQRModal(true);
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWhatsappMode = async () => {
    try {
      const { data } = await whatsappAPI.getMode();
      if (data?.success) setWhatsappMode(data.mode || 'web');
    } catch (e) { /* default to web */ }
  };

  const checkBusinessApiStatus = async () => {
    try {
      const { data } = await whatsappBusinessAPI.getStatus();
      if (data?.success) setBusinessApiStatus(data);
    } catch (e) { /* not connected */ }
  };

  const handleSwitchMode = async (mode) => {
    try {
      const { data } = await whatsappAPI.setMode(mode);
      if (data?.success) {
        setWhatsappMode(mode);
        toast.success(mode === 'business_api' ? 'تم التبديل إلى WhatsApp Business API' : 'تم التبديل إلى وضع QR Code');
      }
    } catch (error) {
      toast.error('فشل في تبديل الوضع');
    }
  };

  const handleBusinessApiConnect = async () => {
    try {
      setBusinessApiConnecting(true);
      const { data } = await whatsappBusinessAPI.connect(businessApiForm);
      if (data?.success) {
        toast.success('تم ربط WhatsApp Business API بنجاح');
        setBusinessApiStatus({ status: 'connected', ...data });
        checkWhatsAppStatus();
      } else {
        toast.error(data?.message || 'فشل في ربط Business API');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل في ربط Business API');
    } finally {
      setBusinessApiConnecting(false);
    }
  };

  const handleBusinessApiDisconnect = async () => {
    try {
      const { data } = await whatsappBusinessAPI.disconnect();
      if (data?.success) {
        toast.success('تم قطع اتصال WhatsApp Business API');
        setBusinessApiStatus({ status: 'disconnected' });
        checkWhatsAppStatus();
      }
    } catch (error) {
      toast.error('فشل في قطع الاتصال');
    }
  };

  const checkTelegramStatus = async () => {
    try {
      const { data: channelsData } = await channelsAPI.getAll();
      const telegram = (channelsData?.channels || []).find((ch) => ch.type === 'telegram');

      // Also check live Telegram service status
      let liveStatus = null;
      try {
        const { data: tgResp } = await telegramAPI.getStatus();
        liveStatus = tgResp?.data || tgResp;
      } catch (e) { /* ignore */ }

      const isConnected = telegram?.status === 'connected' || liveStatus?.status === 'connected';
      const botUsername = telegram?.config?.botUsername || liveStatus?.botUsername || null;
      const hasToken = !!(telegram?.config?.botToken);

      setTelegramConnection(telegram || null);
      setTelegramStatus(isConnected ? {
        status: 'connected',
        botUsername,
        hasToken,
        updatedAt: telegram?.updatedAt
      } : {
        status: 'needs_config',
        botUsername: null,
        hasToken: false,
        updatedAt: null
      });
      if (botUsername) setTelegramBotUsername(botUsername);
      if (hasToken) setTelegramBotToken(prev => prev || '••••••••');
    } catch (error) {
      console.error('Error checking Telegram status:', error);
    }
  };

  const pollQRCode = async () => {
    try {
      const { data } = await whatsappAPI.getQR();
      if (data?.status === 'connected') {
        setWhatsappStatus({ status: 'connected' });
        toast.success('WhatsApp connected successfully!');
        setShowQRModal(false);
        setQrCode(null);
        checkWhatsAppStatus();
        return;
      }
      if (data?.qr) {
        setQrCode(data.qr);
      }
    } catch (error) {
      console.error('Error polling QR:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setQrCode(null);
      setShowQRModal(true);

      // Disconnect any existing client first to get a fresh QR
      try { await whatsappAPI.disconnect(); } catch (e) { /* ignore */ }
      await new Promise(r => setTimeout(r, 1000));

      // Initialize connection
      const { data: connectData } = await whatsappAPI.connect();
      if (connectData?.qr) {
        setQrCode(connectData.qr);
      }
      toast.success('جاري توليد رمز QR...');

      // Poll for QR code (keep polling to pick up refreshed QRs)
      let attempts = 0;
      const maxAttempts = 20;
      const poll = async () => {
        if (attempts >= maxAttempts) return;
        attempts++;
        try {
          const { data } = await whatsappAPI.getQR();
          if (data?.status === 'connected') {
            setWhatsappStatus({ status: 'connected' });
            toast.success('WhatsApp connected successfully!');
            setShowQRModal(false);
            setQrCode(null);
            checkWhatsAppStatus();
            return;
          }
          if (data?.qr) {
            setQrCode(data.qr);
          }
        } catch (e) { /* ignore poll errors */ }
        await new Promise(r => setTimeout(r, 3000));
        await poll();
      };
      await poll();
    } catch (error) {
      toast.error('فشل في الاتصال بواتس آب');
      setShowQRModal(false);
    } finally {
      setConnecting(false);
    }
  };

  const handleTelegramConnect = async () => {
    try {
      setTelegramConnecting(true);
      await checkTelegramStatus();
      const hasSavedTelegram = !!telegramConnection?.config?.botToken && !!telegramConnection?.config?.botUsername;
      const payload = {};
      if (!hasSavedTelegram) {
        if (telegramBotToken && telegramBotToken !== '••••••••') payload.botToken = telegramBotToken.trim();
        if (telegramBotUsername) payload.botUsername = telegramBotUsername.trim().replace(/^@/, '');
      }
      const { data } = await telegramAPI.connect(payload);
      setTelegramConnection(data.data?.connection || null);
      setTelegramStatus(data.data);
      if (data?.data?.connection?.config?.botUsername) setTelegramBotUsername(data.data.connection.config.botUsername);
      if (data?.data?.connection?.config?.botToken) setTelegramBotToken('••••••••');
      toast.success('Telegram ready');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enable Telegram');
    } finally {
      setTelegramConnecting(false);
    }
  };

  const handleTelegramDisconnect = async () => {
    try {
      await telegramAPI.disconnect();
      setTelegramStatus({ status: 'needs_config', botUsername: null, hasToken: false });
      toast.success('Telegram disconnected');
    } catch (error) {
      toast.error('Failed to disconnect Telegram');
    }
  };

  const checkInstagramStatus = async () => {
    try {
      const { data } = await instagramAPI.getStatus();
      if (data?.status === 'connected' || data?.data?.status === 'connected') {
        setInstagramStatus({ status: 'connected', ...((data.data || data)) });
      } else {
        setInstagramStatus({ status: 'disconnected' });
      }
    } catch (e) {
      setInstagramStatus({ status: 'disconnected' });
    }
  };

  const handleInstagramConnect = async () => {
    try {
      setInstagramConnecting(true);
      const { data } = await instagramAPI.connect(instagramForm);
      if (data?.status === 'connected' || data?.data?.status === 'connected') {
        toast.success('تم ربط إنستجرام بنجاح');
        setInstagramStatus({ status: 'connected', ...(data.data || data) });
        setInstagramForm({ pageId: '', pageAccessToken: '', igUserId: '' });
      } else {
        toast.error(data?.message || data?.data?.message || 'فشل في ربط إنستجرام');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل في ربط إنستجرام');
    } finally {
      setInstagramConnecting(false);
    }
  };

  const handleInstagramDisconnect = async () => {
    try {
      await instagramAPI.disconnect();
      setInstagramStatus({ status: 'disconnected' });
      toast.success('تم قطع اتصال إنستجرام');
    } catch (error) {
      toast.error('فشل في قطع اتصال إنستجرام');
    }
  };

  const checkMessengerStatus = async () => {
    try {
      const { data } = await messengerAPI.getStatus();
      if (data?.status === 'connected' || data?.data?.status === 'connected') {
        setMessengerStatus({ status: 'connected', ...((data.data || data)) });
      } else {
        setMessengerStatus({ status: 'disconnected' });
      }
    } catch (e) {
      setMessengerStatus({ status: 'disconnected' });
    }
  };

  const handleMessengerConnect = async () => {
    try {
      setMessengerConnecting(true);
      const { data } = await messengerAPI.connect(messengerForm);
      if (data?.status === 'connected' || data?.data?.status === 'connected') {
        toast.success('تم ربط ماسنجر بنجاح');
        setMessengerStatus({ status: 'connected', ...(data.data || data) });
        setMessengerForm({ pageId: '', pageAccessToken: '' });
      } else {
        toast.error(data?.message || data?.data?.message || 'فشل في ربط ماسنجر');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل في ربط ماسنجر');
    } finally {
      setMessengerConnecting(false);
    }
  };

  const handleMessengerDisconnect = async () => {
    try {
      await messengerAPI.disconnect();
      setMessengerStatus({ status: 'disconnected' });
      toast.success('تم قطع اتصال ماسنجر');
    } catch (error) {
      toast.error('فشل في قطع اتصال ماسنجر');
    }
  };

  const handleDisconnect = async () => {
    try {
      await whatsappAPI.disconnect();
      setWhatsappStatus((prev) => ({ ...(prev || {}), status: 'disconnected', persistedStatus: 'disconnected' }));
      setQrCode(null);
      await checkWhatsAppStatus();
      toast.success('تم قطع اتصال واتس آب');
    } catch (error) {
      toast.error('فشل في قطع الاتصال');
    }
  };

  const handleRefreshQR = async () => {
    try {
      setConnecting(true);
      setQrCode(null);
      const { data: refreshData } = await whatsappAPI.refreshQR();
      if (refreshData?.qr) {
        setQrCode(refreshData.qr);
      }
      toast.success('جاري تحديث رمز QR...');

      // Keep polling for refreshed QRs (don't stop after first one)
      let attempts = 0;
      const poll = async () => {
        if (attempts >= 20) return;
        attempts++;
        try {
          const { data } = await whatsappAPI.getQR();
          if (data?.status === 'connected') {
            setWhatsappStatus({ status: 'connected' });
            toast.success('WhatsApp connected successfully!');
            setShowQRModal(false);
            setQrCode(null);
            checkWhatsAppStatus();
            return;
          }
          if (data?.qr) {
            setQrCode(data.qr);
          }
        } catch (e) { /* ignore */ }
        await new Promise(r => setTimeout(r, 3000));
        await poll();
      };
      await poll();
    } catch (error) {
      toast.error('فشل في تحديث QR');
    } finally {
      setConnecting(false);
    }
  };

  const isConnected = whatsappStatus?.status === 'connected' || whatsappStatus?.persistedStatus === 'connected';

  const comingSoonChannels = [
    { id: 'email', name: 'بريد إلكتروني', icon: '📧', color: '#EA4335' },
    { id: 'sms', name: 'SMS', icon: '📱', color: '#6B7280' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>القنوات</h1>
          <p className={`mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>قم بتوصيل قنوات التواصل الخاصة بك</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isConnected ? '1 متصل' : 'غير متصل'}
          </span>
        </div>
      </div>



      {/* Telegram Card */}
      <div className="card overflow-hidden">
        <div className={`p-6 border-b ${theme === 'light' ? 'bg-sky-50 border-slate-200' : 'bg-sky-500/10 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl relative" style={{ background: '#0088cc' }}>
                <Send className="w-8 h-8 text-white" />
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${theme === 'light' ? 'border-white' : 'border-dark-800'}`} style={{ background: telegramStatus?.status === 'connected' ? '#25D366' : '#ef4444' }}>
                  {telegramStatus?.status === 'connected' ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>تيليجرام</h3>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Bot-based integration for Telegram messages</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${telegramStatus?.status === 'connected' ? (theme === 'light' ? 'bg-emerald-50 text-emerald-700' : 'bg-green-500/20 text-green-400') : (theme === 'light' ? 'bg-amber-50 text-amber-700' : 'bg-yellow-500/20 text-yellow-400')}`}>
              {telegramStatus?.status === 'connected' ? '✓ متصل' : 'يحتاج إعداد'}
            </span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-xl space-y-3 ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-200/50'}`}>
            <h4 className={`font-medium mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Telegram bot setup</h4>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Connect your own Telegram bot for this workspace. Each tenant stores its own bot token and username.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Bot token</label>
                <input
                  type="password"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="123456:ABC-DEF..."
                  className={`w-full px-3 py-2 rounded-lg text-sm ${theme === 'light' ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-100 border border-slate-300 text-white'}`}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Bot username</label>
                <input
                  type="text"
                  value={telegramBotUsername}
                  onChange={(e) => setTelegramBotUsername(e.target.value)}
                  placeholder="my_autoflow_bot"
                  className={`w-full px-3 py-2 rounded-lg text-sm ${theme === 'light' ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-100 border border-slate-300 text-white'}`}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleTelegramConnect} disabled={telegramConnecting} className="btn-primary py-2.5 px-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Smartphone className="w-4 h-4" />
              {telegramConnecting ? 'جاري التفعيل...' : 'تفعيل تيليجرام'}
            </button>
            <button onClick={handleTelegramDisconnect} className="px-4 py-2.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-red-500/30 transition-colors flex items-center gap-2">
              <X className="w-4 h-4" />
              قطع الاتصال
            </button>
          </div>
        </div>
      </div>
      {/* WhatsApp Card - Main Channel */}
      <div className="card overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r from-[#25D366]/20 to-[#128C7E]/20 p-6 border-b ${theme === 'light' ? 'border-slate-200' : 'border-dark-700'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl relative" style={{ background: '#25D366' }}>
                <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.377l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${theme === 'light' ? 'border-white' : 'border-dark-800'}`} style={{ background: isConnected ? '#25D366' : '#ef4444' }}>
                  {isConnected ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>واتس آب</h3>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>توصيل رقم واتس آب الخاص بك</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isConnected
                  ? (theme === 'light' ? 'bg-green-500/20 text-green-700' : 'bg-green-500/20 text-green-400')
                  : (theme === 'light' ? 'bg-rose-50 text-rose-700' : 'bg-rose-500/20 text-rose-400')
              }`}>
                {isConnected ? '✓ متصل' : 'غير متصل'}
              </span>
              {whatsappStatus?.info?.pushname && (
                <span className="text-xs text-slate-400">{whatsappStatus.info.pushname}</span>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Mode Switcher */}
        <div className={`px-6 py-3 border-b ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-dark-700 bg-dark-800'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>طريقة الاتصال</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSwitchMode('web')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                whatsappMode === 'web'
                  ? 'bg-[#25D366] text-white shadow-md'
                  : (theme === 'light' ? 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50' : 'bg-dark-700 text-slate-400 border border-dark-600 hover:bg-dark-600')
              }`}
            >
              <Smartphone className="w-4 h-4 inline mr-1" />
              رمز QR
            </button>
            <button
              onClick={() => handleSwitchMode('business_api')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                whatsappMode === 'business_api'
                  ? 'bg-[#25D366] text-white shadow-md'
                  : (theme === 'light' ? 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50' : 'bg-dark-700 text-slate-400 border border-dark-600 hover:bg-dark-600')
              }`}
            >
              <Lock className="w-4 h-4 inline mr-1" />
              Business API
            </button>
          </div>
          {whatsappMode === 'business_api' && (
            <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              يُنصح به للشركات — يتطلب حساب WhatsApp Business API رسمي من Meta
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {whatsappMode === 'business_api' ? (
            /* Business API Form */
            <div className="space-y-4">
              {businessApiStatus?.status === 'connected' ? (
                <div className="space-y-4">
                  <div className={`flex items-center gap-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-green-500/10 border-green-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-400">WhatsApp Business API متصل</p>
                      {businessApiStatus.displayPhoneNumber && (
                        <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          {businessApiStatus.displayPhoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleBusinessApiDisconnect}
                    className="w-full px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    قطع اتصال Business API
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    أدخل بيانات WhatsApp Business API الخاصة بك
                  </p>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={businessApiForm.phoneNumberId}
                      onChange={(e) => setBusinessApiForm(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                      placeholder="123456789012345"
                      className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={businessApiForm.accessToken}
                      onChange={(e) => setBusinessApiForm(prev => ({ ...prev, accessToken: e.target.value }))}
                      placeholder="EAAxxxxxxxxxxxxx"
                      className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      Business Account ID (optional)
                    </label>
                    <input
                      type="text"
                      value={businessApiForm.businessAccountId}
                      onChange={(e) => setBusinessApiForm(prev => ({ ...prev, businessAccountId: e.target.value }))}
                      placeholder="1234567890"
                      className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      WABA ID (optional)
                    </label>
                    <input
                      type="text"
                      value={businessApiForm.wabaId}
                      onChange={(e) => setBusinessApiForm(prev => ({ ...prev, wabaId: e.target.value }))}
                      placeholder="1234567890"
                      className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                    />
                  </div>
                  <button
                    onClick={handleBusinessApiConnect}
                    disabled={businessApiConnecting || !businessApiForm.phoneNumberId || !businessApiForm.accessToken}
                    className="w-full px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {businessApiConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        جاري الاتصال...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        ربط Business API
                      </>
                    )}
                  </button>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    يمكنك الحصول على هذه البيانات من Meta Developer Dashboard → WhatsApp → API Setup
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Web/QR mode - existing UI */
            <React.Fragment>
            {isConnected ? (
            <div className="space-y-4">
              {/* Connected Info */}
              <div className={`flex items-center gap-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-green-500/10 border-green-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-400">واتس آب متصل بنجاح</p>
                  <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>يمكنك الآن إرسال واستقبال الرسائل</p>
                </div>
              </div>

              {/* Connection Details */}
              <div className={`grid grid-cols-2 md:grid-cols-3 gap-3`}>
                {whatsappStatus?.info?.me && (
                  <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-dark-700'}`}>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>رقم الهاتف</p>
                    <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>+{whatsappStatus.info.me}</p>
                  </div>
                )}
                {whatsappStatus?.info?.pushname && (
                  <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-dark-700'}`}>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>اسم العرض</p>
                    <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{whatsappStatus.info.pushname}</p>
                  </div>
                )}
                {whatsappStatus?.info?.platform && (
                  <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-dark-700'}`}>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>المنصة</p>
                    <p className={`font-semibold capitalize ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{whatsappStatus.info.platform}</p>
                  </div>
                )}
                {whatsappStatus?.connectedAt && (
                  <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-dark-700'}`}>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>تاريخ الاتصال</p>
                    <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{new Date(whatsappStatus.connectedAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                )}
                <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-green-50 border border-green-200' : 'bg-green-500/10 border border-green-500/20'}`}>
                  <p className={`text-xs ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}>الحالة</p>
                  <p className={`font-semibold ${theme === 'light' ? 'text-green-700' : 'text-green-400'}`}>● متصل الآن</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Link to="/conversations" className="btn-primary py-2.5 px-4 flex items-center gap-2">
                  <Scan className="w-4 h-4" />
                  عرض المحادثات
                </Link>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  قطع اتصال واتس آب
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection Instructions */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-200/50' : 'bg-dark-800'}`}>
                  <h4 className={`font-medium mb-2 flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center">1</span>
                    اضغط على زر التوصيل
                  </h4>
                  <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>سيتم توليد رمز QR للاتصال</p>
                </div>
                <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-200/50' : 'bg-dark-800'}`}>
                  <h4 className={`font-medium mb-2 flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center">2</span>
                    امسح رمز QR
                  </h4>
                  <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>افتح واتس آب → الإعدادات → الأجهزة المرتبطة</p>
                </div>
              </div>

              {/* Connect Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleConnect} 
                  disabled={connecting}
                  className="flex-1 btn-primary py-4 text-lg flex items-center justify-center gap-3"
                >
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
                <button 
                  onClick={handleDisconnect}
                  className="px-4 py-4 rounded-lg bg-rose-50 text-rose-700 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  قطع الاتصال
                </button>
              </div>
            </div>
          )}
          </React.Fragment>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && !isConnected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>امسح رمز QR بواسطة واتس آب</h3>
              <p className={`text-sm mb-6 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                افتح واتس آب على هاتفك ← الإعدادات ← الأجهزة المرتبطة ← ربط جهاز
              </p>

              {/* QR Code */}
              <div className={`p-6 rounded-2xl inline-block mb-4 ${theme === 'light' ? 'bg-white' : 'bg-dark-800'}`}>
                {qrCode ? (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCode)}`} 
                    alt="WhatsApp QR Code"
                    className="w-56 h-56"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <RefreshCw className="w-12 h-12 text-slate-500 animate-spin" />
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className={`rounded-lg p-4 mb-4 text-right ${theme === 'light' ? 'bg-slate-200/50' : 'bg-dark-800'}`}>
                <ol className={`text-sm space-y-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center">1</span>
                    افتح واتس آب على هاتفك
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center">2</span>
                    اذهب إلى الإعدادات
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center">3</span>
                    اختر الأجهزة المرتبطة
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center">4</span>
                    اضغط على ربط جهاز وامسح الرمز
                  </li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={handleRefreshQR}
                  disabled={connecting}
                  className="flex-1 btn-secondary py-2.5 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${connecting ? 'animate-spin' : ''}`} />
                  تحديث الرمز
                </button>
                <button 
                  onClick={() => setShowQRModal(false)}
                  className={`px-4 py-2.5 rounded-lg transition-colors ${theme === 'light' ? 'bg-slate-200 hover:bg-slate-300' : 'bg-dark-700 hover:bg-dark-600'}`}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Card */}
      <div className="card overflow-hidden">
        <div className={`p-6 border-b ${theme === 'light' ? 'bg-gradient-to-r from-[#E4405F]/10 to-[#F7737C]/10 border-slate-200' : 'bg-[#E4405F]/10 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl relative" style={{ background: 'linear-gradient(135deg, #E4405F, #833AB4, #F7737C)' }}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${theme === 'light' ? 'border-white' : 'border-dark-800'}`} style={{ background: instagramStatus?.status === 'connected' ? '#25D366' : '#ef4444' }}>
                  {instagramStatus?.status === 'connected' ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>إنستجرام</h3>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>ربط حساب إنستجرام بيزنس للرسائل المباشرة</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${instagramStatus?.status === 'connected' ? (theme === 'light' ? 'bg-green-50 text-green-700' : 'bg-green-500/20 text-green-400') : (theme === 'light' ? 'bg-amber-50 text-amber-700' : 'bg-amber-500/20 text-amber-400')}`}>
              {instagramStatus?.status === 'connected' ? '✓ متصل' : 'غير متصل'}
            </span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {instagramStatus?.status === 'connected' ? (
            <div className="space-y-4">
              <div className={`flex items-center gap-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-green-50 border-green-200' : 'bg-green-500/10 border-green-500/20'}`}>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-400">إنستجرام متصل</p>
                  {instagramStatus?.pageName && (
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      الصفحة: {instagramStatus.pageName}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleInstagramDisconnect}
                className="px-4 py-2.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                قطع اتصال إنستجرام
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                أدخل بيانات صفحة فيسبوك المرتبطة بحساب إنستجرام بيزنس
              </p>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  معرف صفحة فيسبوك (Page ID)
                </label>
                <input
                  type="text"
                  value={instagramForm.pageId}
                  onChange={(e) => setInstagramForm(prev => ({ ...prev, pageId: e.target.value }))}
                  placeholder="1234567890"
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  رمز الوصول للصفحة (Page Access Token)
                </label>
                <input
                  type="password"
                  value={instagramForm.pageAccessToken}
                  onChange={(e) => setInstagramForm(prev => ({ ...prev, pageAccessToken: e.target.value }))}
                  placeholder="EAAxxxxxxxxxxxxx"
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  معرف إنستجرام بيزنس (اختياري)
                </label>
                <input
                  type="text"
                  value={instagramForm.igUserId}
                  onChange={(e) => setInstagramForm(prev => ({ ...prev, igUserId: e.target.value }))}
                  placeholder="يتم استخراجه تلقائياً من الصفحة"
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                />
              </div>
              <button
                onClick={handleInstagramConnect}
                disabled={instagramConnecting || !instagramForm.pageId || !instagramForm.pageAccessToken}
                className="w-full px-4 py-2.5 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #E4405F, #833AB4)' }}
              >
                {instagramConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري الاتصال...
                  </>
                ) : (
                  <>
                    ربط إنستجرام
                  </>
                )}
              </button>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                يجب أن يكون حساب إنستجرام بيزنس مرتبطاً بصفحة فيسبوك. يمكنك الحصول على Page ID و Access Token من Meta Developer Dashboard.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Coming Soon Channels */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className={`font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>قنوات قادمة</h3>
          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${theme === 'light' ? 'bg-gray-500/20 text-slate-500' : 'bg-dark-700 text-slate-400'}`}>
            <Sparkles className="w-3 h-3" /> قريباً
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {comingSoonChannels.map((channel) => (
            <div 
              key={channel.id} 
              className={`p-4 rounded-xl border text-center cursor-not-allowed opacity-60 hover:opacity-80 transition-opacity ${theme === 'light' ? 'border-slate-200 bg-slate-100/50' : 'border-dark-600 bg-dark-800'}`}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2"
                style={{ background: `${channel.color}20` }}
              >
                {channel.icon}
              </div>
              <h3 className={`font-medium text-sm mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{channel.name}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${theme === 'light' ? 'bg-slate-200 text-slate-500' : 'bg-dark-700 text-slate-400'}`}>
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