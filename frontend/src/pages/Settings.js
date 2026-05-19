import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { usersAPI, settingsAPI, emailAPI } from '../api';
import toast from 'react-hot-toast';
import { Loader2, Bot, CheckCircle, AlertCircle, RefreshCw, MessageSquare, Zap, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [aiConfig, setAiConfig] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiTestResult, setAiTestResult] = useState(null);
  const [aiAutoReply, setAiAutoReply] = useState(null);
  const [aiAutoReplyLoading, setAiAutoReplyLoading] = useState(true);
  const [aiAutoReplySaving, setAiAutoReplySaving] = useState(false);
  const [emailConfig, setEmailConfig] = useState(null);
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState(null);
  const [emailForm, setEmailForm] = useState({
    host: '', port: 587, secure: false, username: '', password: '',
    fromName: 'AutoFlow Support', fromEmail: '', isActive: true
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    language: 'ar',
    timezone: 'Africa/Cairo',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        language: user.settings?.language || 'ar',
        timezone: user.settings?.timezone || 'Africa/Cairo',
        notifications: user.settings?.notifications || {
          email: true,
          sms: false,
          push: true
        }
      });
    }
    fetchAIConfig();
    fetchAIAutoReply();
    fetchEmailConfig();
  }, [user]);

  const fetchAIConfig = async () => {
    setAiLoading(true);
    try {
      const res = await settingsAPI.getAIConfig();
      setAiConfig(res.data.config);
    } catch (err) {
      // Config not available yet
    } finally {
      setAiLoading(false);
    }
  };

  const testAIConnection = async () => {
    setAiTesting(true);
    setAiTestResult(null);
    try {
      const res = await settingsAPI.testAI();
      setAiTestResult({ success: res.data.success, message: res.data.message || 'تم الاتصال بنجاح', dimension: res.data.embeddingDimension });
      toast.success('تم الاتصال بـ OpenAI بنجاح');
    } catch (err) {
      const msg = err.response?.data?.error || 'فشل الاتصال بـ OpenAI';
      setAiTestResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setAiTesting(false);
    }
  };

  const fetchAIAutoReply = async () => {
    setAiAutoReplyLoading(true);
    try {
      const res = await settingsAPI.getAIAutoReplyConfig();
      setAiAutoReply(res.data);
    } catch (err) {
      // Not critical
    } finally {
      setAiAutoReplyLoading(false);
    }
  };

  const saveAIAutoReply = async (updates) => {
    setAiAutoReplySaving(true);
    try {
      const res = await settingsAPI.updateAIAutoReplyConfig(updates);
      setAiAutoReply(prev => ({ ...prev, settings: res.data.settings }));
      toast.success('تم حفظ إعدادات الرد الذكي');
    } catch (err) {
      toast.error('فشل في حفظ الإعدادات');
    } finally {
      setAiAutoReplySaving(false);
    }
  };

  const fetchEmailConfig = async () => {
    setEmailLoading(true);
    try {
      const res = await emailAPI.getConfig();
      const config = res.data.data;
      if (config) {
        setEmailConfig(config);
        setEmailForm({
          host: config.host || '', port: config.port || 587, secure: config.secure || false,
          username: config.username || '', password: config.password || '',
          fromName: config.fromName || 'AutoFlow Support', fromEmail: config.fromEmail || '',
          isActive: config.isActive ?? true
        });
      }
    } catch (err) { /* not configured yet */ }
    finally { setEmailLoading(false); }
  };

  const saveEmailConfig = async () => {
    setEmailSaving(true);
    try {
      const res = await emailAPI.saveConfig(emailForm);
      setEmailConfig(res.data.data);
      toast.success('تم حفظ إعدادات البريد الإلكتروني');
    } catch (err) {
      toast.error('فشل في حفظ إعدادات البريد الإلكتروني');
    } finally { setEmailSaving(false); }
  };

  const testEmailConnection = async () => {
    setEmailTesting(true);
    setEmailTestResult(null);
    try {
      const res = await emailAPI.testConnection();
      setEmailTestResult({ success: res.data.data?.success, message: res.data.data?.message });
      if (res.data.data?.success) toast.success('تم الاتصال بالبريد الإلكتروني بنجاح');
      else toast.error(res.data.data?.message || 'فشل الاتصال');
    } catch (err) {
      setEmailTestResult({ success: false, message: err.response?.data?.error || 'فشل الاتصال' });
      toast.error('فشل الاتصال');
    } finally { setEmailTesting(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('notifications.')) {
      const notifKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notifKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersAPI.update(user.id, {
        name: formData.name,
        phone: formData.phone,
        settings: {
          language: formData.language,
          timezone: formData.timezone,
          notifications: formData.notifications
        }
      });
      
      // Update local store
      updateUser({
        name: formData.name,
        phone: formData.phone,
        settings: {
          language: formData.language,
          timezone: formData.timezone,
          notifications: formData.notifications
        }
      });
      
      toast.success('تم حفظ الإعدادات');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.error || 'فشل في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>الإعدادات</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card p-6">
          <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : ''}`}>الملف الشخصي</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الاسم</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-800 border border-dark-600'} rounded-lg py-2 px-4 focus:border-primary-500 focus:outline-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                defaultValue={user?.email}
                className={`w-full ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-800 border border-dark-600'} rounded-lg py-2 px-4 opacity-50 cursor-not-allowed`}
                disabled
              />
              <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>لا يمكن تغيير البريد الإلكتروني</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-800 border border-dark-600'} rounded-lg py-2 px-4 focus:border-primary-500 focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-6">
          <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : ''}`}>التفضيلات</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اللغة</label>
              <select 
                name="language"
                value={formData.language}
                onChange={handleChange}
                className={`w-full ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-800 border border-dark-600'} rounded-lg py-2 px-4 focus:border-primary-500 focus:outline-none`}
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">المنطقة الزمنية</label>
              <select 
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className={`w-full ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-800 border border-dark-600'} rounded-lg py-2 px-4 focus:border-primary-500 focus:outline-none`}
              >
                <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                <option value="Asia/Dubai">دبي (GMT+4)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : ''}`}>الإشعارات</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="notifications.email"
                checked={formData.notifications.email}
                onChange={handleChange}
                className="w-4 h-4 accent-primary-500" 
              />
              <span>إشعارات البريد الإلكتروني</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="notifications.sms"
                checked={formData.notifications.sms}
                onChange={handleChange}
                className="w-4 h-4 accent-primary-500" 
              />
              <span>إشعارات SMS</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="notifications.push"
                checked={formData.notifications.push}
                onChange={handleChange}
                className="w-4 h-4 accent-primary-500" 
              />
              <span>إشعارات المتصفح</span>
            </label>
          </div>
        </div>
      </div>

      {/* AI Configuration */}
      <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bot className={`w-5 h-5 ${theme === 'light' ? 'text-teal-600' : 'text-teal-400'}`} />
            <h3 className={`font-bold ${theme === 'light' ? 'text-slate-900' : ''}`}>إعدادات الذكاء الاصطناعي</h3>
          </div>
          {aiLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
            </div>
          ) : aiConfig ? (
            <div className="space-y-4">
              {/* API Key Status */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                aiConfig.hasApiKey
                  ? theme === 'light' ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/30'
                  : theme === 'light' ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  {aiConfig.hasApiKey ? (
                    <CheckCircle className={`w-5 h-5 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  ) : (
                    <AlertCircle className={`w-5 h-5 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                  )}
                  <div>
                    <p className={`font-medium text-sm ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                      {aiConfig.hasApiKey ? 'مفتاح API مُعد' : 'مفتاح API غير مُعد'}
                    </p>
                    {aiConfig.hasApiKey && aiConfig.maskedApiKey && (
                      <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {aiConfig.maskedApiKey}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Model Config */}
              <div>
                <label className={`text-sm font-medium mb-1 block ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  نموذج المحادثة
                </label>
                <div className={`px-3 py-2 rounded-lg text-sm ${theme === 'light' ? 'bg-slate-50 border border-slate-200 text-slate-700' : 'bg-dark-800 border border-dark-600 text-slate-300'}`}>
                  {aiConfig.model}
                </div>
                <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                  يتغير عبر متغير البيئة OPENAI_MODEL في الخادم
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium mb-1 block ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  نموذج التضمين
                </label>
                <div className={`px-3 py-2 rounded-lg text-sm ${theme === 'light' ? 'bg-slate-50 border border-slate-200 text-slate-700' : 'bg-dark-800 border border-dark-600 text-slate-300'}`}>
                  {aiConfig.embeddingModel}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-medium mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    حجم القطعة (رموز)
                  </label>
                  <div className={`px-3 py-2 rounded-lg text-sm ${theme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-dark-800 border border-dark-600'}`}>
                    {aiConfig.maxChunkTokens}
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-medium mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    تداخل القطع (رموز)
                  </label>
                  <div className={`px-3 py-2 rounded-lg text-sm ${theme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-dark-800 border border-dark-600'}`}>
                    {aiConfig.chunkOverlap}
                  </div>
                </div>
              </div>

              {/* Test Connection */}
              <button
                onClick={testAIConnection}
                disabled={aiTesting || !aiConfig.hasApiKey}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  aiTesting || !aiConfig.hasApiKey
                    ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-teal-500/25'
                }`}
              >
                {aiTesting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                اختبار الاتصال
              </button>

              {aiTestResult && (
                <div className={`p-3 rounded-lg text-sm ${
                  aiTestResult.success
                    ? theme === 'light' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : theme === 'light' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-red-500/10 text-red-300 border border-red-500/30'
                }`}>
                  {aiTestResult.success ? (
                    <p>تم الاتصال بنجاح! أبعاد التضمين: {aiTestResult.dimension}</p>
                  ) : (
                    <p>{aiTestResult.message}</p>
                  )}
                </div>
              )}

              {!aiConfig.hasApiKey && (
                <div className={`p-3 rounded-lg text-xs ${theme === 'light' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}`}>
                  <p className="font-medium mb-1">لتشغيل الذكاء الاصطناعي:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>أضف OPENAI_API_KEY إلى ملف .env في الخادم</li>
                    <li>أعد تشغيل الخادم</li>
                    <li>اضغط "اختبار الاتصال" للتحقق</li>
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              غير قادر على تحميل إعدادات الذكاء الاصطناعي
            </p>
          )}
        </div>

        {/* AI Auto-Reply */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className={`w-5 h-5 ${theme === 'light' ? 'text-teal-600' : 'text-teal-400'}`} />
            <h3 className={`font-bold ${theme === 'light' ? 'text-slate-900' : ''}`}>الرد الذكي التلقائي</h3>
          </div>
          {aiAutoReplyLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
            </div>
          ) : aiAutoReply ? (
            <div className="space-y-4">
              {/* Enable/Disable Toggle */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-dark-800 border border-dark-600'}`}>
                <div>
                  <p className={`font-medium ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>تفعيل الرد الذكي</p>
                  <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    الرد تلقائياً على رسائل العملاء باستخدام الذكاء الاصطناعي
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiAutoReply.settings?.enabled || false}
                    onChange={(e) => saveAIAutoReply({ enabled: e.target.checked })}
                    disabled={aiAutoReplySaving || !aiConfig?.hasApiKey}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 ${
                    aiAutoReply.settings?.enabled ? 'bg-teal-500' : theme === 'light' ? 'bg-slate-300' : 'bg-slate-600'
                  } peer-disabled:opacity-50 peer-disabled:cursor-not-allowed after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    aiAutoReply.settings?.enabled ? 'after:translate-x-full' : ''
                  }`}></div>
                </label>
              </div>

              {!aiConfig?.hasApiKey && (
                <div className={`p-3 rounded-lg text-xs ${theme === 'light' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}`}>
                  يجب تفعيل مفتاح OpenAI أولاً لاستخدام الرد الذكي التلقائي
                </div>
              )}

              {/* Channels */}
              <div>
                <label className={`text-sm font-medium mb-2 block ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  القنوات النشطة
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'whatsapp', label: 'واتساب', color: 'bg-green-500' },
                    { id: 'telegram', label: 'تليجرام', color: 'bg-blue-500' }
                  ].map(channel => (
                    <label key={channel.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      aiAutoReply.settings?.channels?.includes(channel.id)
                        ? theme === 'light' ? 'bg-teal-50' : 'bg-teal-500/10'
                        : theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-dark-800'
                    }`}>
                      <input
                        type="checkbox"
                        checked={aiAutoReply.settings?.channels?.includes(channel.id) || false}
                        onChange={(e) => {
                          const current = aiAutoReply.settings?.channels || [];
                          const updated = e.target.checked
                            ? [...current, channel.id]
                            : current.filter(c => c !== channel.id);
                          saveAIAutoReply({ channels: updated });
                        }}
                        disabled={aiAutoReplySaving || !aiAutoReply.settings?.enabled}
                        className="accent-teal-500"
                      />
                      <div className={`w-2 h-2 rounded-full ${channel.color}`} />
                      <span className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{channel.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className={`text-sm font-medium mb-2 block ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  نبرة الرد
                </label>
                <select
                  value={aiAutoReply.settings?.tone || 'professional'}
                  onChange={(e) => saveAIAutoReply({ tone: e.target.value })}
                  disabled={aiAutoReplySaving || !aiAutoReply.settings?.enabled}
                  className={`w-full rounded-lg py-2 px-3 text-sm ${
                    theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-800 border border-dark-600'
                  } focus:border-teal-500 focus:outline-none disabled:opacity-50`}
                >
                  <option value="professional">مهني — رسمي ومهذب</option>
                  <option value="friendly">ودود — غير رسمي ولطيف</option>
                  <option value="casual">عفوي — بسيط ومباشر</option>
                </select>
              </div>

              {/* Include Sources */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-dark-800 border border-dark-600'}`}>
                <div>
                  <p className={`font-medium text-sm ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>إرفاق المصادر</p>
                  <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    إظهار مصادر المستندات مع الرد
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiAutoReply.settings?.includeSources || false}
                    onChange={(e) => saveAIAutoReply({ includeSources: e.target.checked })}
                    disabled={aiAutoReplySaving || !aiAutoReply.settings?.enabled}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 ${
                    aiAutoReply.settings?.includeSources ? 'bg-teal-500' : theme === 'light' ? 'bg-slate-300' : 'bg-slate-600'
                  } peer-disabled:opacity-50 peer-disabled:cursor-not-allowed after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    aiAutoReply.settings?.includeSources ? 'after:translate-x-full' : ''
                  }`}></div>
                </label>
              </div>

              {/* Usage */}
              <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-dark-800 border border-dark-600'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    الاستخدام الشهري
                  </span>
                  <span className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {aiAutoReply.usage?.used || 0} / {aiAutoReply.usage?.limit === Infinity ? '∞' : aiAutoReply.usage?.limit || 0}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}>
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                    style={{ width: `${Math.min(aiAutoReply.usage?.percentage || 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* How it works */}
              <div className={`p-3 rounded-lg text-xs ${theme === 'light' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'}`}>
                <p className="font-medium mb-1">كيف يعمل الرد الذكي التلقائي؟</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>يتم فحص قواعد الرد التلقائي أولاً — إذا تطابقت كلمة مفتاحية، يتم الرد بالقاعدة</li>
                  <li>إذا لم تتطابق أي قاعدة و كان الرد الذكي مفعّلاً، يقوم الذكاء الاصطناعي بالرد من قاعدة المعرفة</li>
                  <li>الردود تُحسب من حدود الخطة الشهرية للرسائل الذكية</li>
                </ol>
              </div>
            </div>
          ) : (
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              غير قادر على تحميل إعدادات الرد الذكي
            </p>
          )}
        </div>

      {/* Subscription */}
      <div className="card p-6">
        <div className={`flex items-center justify-between p-3 ${theme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-dark-800'} rounded-lg`}>
          <div>
            <p className="font-medium">الخطة الحالية</p>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
              {user?.subscription?.plan === 'free' ? 'مجاني' :
               user?.subscription?.plan === 'basic' ? 'أساسي' :
               user?.subscription?.plan === 'standard' ? 'قياسي' :
               user?.subscription?.plan === 'premium' ? 'مميز' : 'مجاني'}
            </p>
          </div>
          {user?.subscription?.isActive ? (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              نشط
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
              تجربة
            </span>
          )}
        </div>
        <a href="/subscription" className="btn-primary w-full text-center block mt-4">
          ترقية الاشتراك
        </a>
      </div>

      {/* Email Channel Settings */}
      <div className={`card p-6 ${theme === 'light' ? '' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
            <Mail className={`w-5 h-5 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
          </div>
          <div>
            <h3 className="font-bold">البريد الإلكتروني</h3>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>إعدادات SMTP لإرسال واستقبال رسائل البريد</p>
          </div>
        </div>

        {emailLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-800 rounded-lg">
              <div>
                <p className="font-medium">تفعيل البريد الإلكتروني</p>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>استقبال وإرسال رسائل عبر البريد</p>
              </div>
              <input type="checkbox" checked={emailForm.isActive} onChange={e => setEmailForm({...emailForm, isActive: e.target.checked})}
                className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">خادم SMTP</label>
                <input type="text" value={emailForm.host} onChange={e => setEmailForm({...emailForm, host: e.target.value})} placeholder="smtp.example.com"
                  className={`w-full px-3 py-2 rounded-lg ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'} border focus:outline-none focus:border-primary-500`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المنفذ</label>
                <input type="number" value={emailForm.port} onChange={e => setEmailForm({...emailForm, port: parseInt(e.target.value) || 587})}
                  className={`w-full px-3 py-2 rounded-lg ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'} border focus:outline-none focus:border-primary-500`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
                <input type="text" value={emailForm.username} onChange={e => setEmailForm({...emailForm, username: e.target.value})} placeholder="user@example.com"
                  className={`w-full px-3 py-2 rounded-lg ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'} border focus:outline-none focus:border-primary-500`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">كلمة المرور</label>
                <input type="password" value={emailForm.password} onChange={e => setEmailForm({...emailForm, password: e.target.value})} placeholder="••••••••"
                  className={`w-full px-3 py-2 rounded-lg ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'} border focus:outline-none focus:border-primary-500`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المرسل</label>
                <input type="text" value={emailForm.fromName} onChange={e => setEmailForm({...emailForm, fromName: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'} border focus:outline-none focus:border-primary-500`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">بريد المرسل</label>
                <input type="email" value={emailForm.fromEmail} onChange={e => setEmailForm({...emailForm, fromEmail: e.target.value})} placeholder="support@example.com"
                  className={`w-full px-3 py-2 rounded-lg ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'} border focus:outline-none focus:border-primary-500`} />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={emailForm.secure} onChange={e => setEmailForm({...emailForm, secure: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-teal-500" />
              <span className="text-sm">اتصال آمن (SSL/TLS)</span>
            </label>

            {emailTestResult && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${emailTestResult.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {emailTestResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-sm">{emailTestResult.message}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={saveEmailConfig} disabled={emailSaving}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md disabled:opacity-50">
                {emailSaving ? <><Loader2 className="w-4 h-4 inline animate-spin ml-1" /> جاري الحفظ...</> : 'حفظ الإعدادات'}
              </button>
              <button onClick={testEmailConnection} disabled={emailTesting}
                className={`px-4 py-2.5 rounded-xl font-medium ${theme === 'light' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-dark-700 text-slate-300 hover:bg-dark-600'} disabled:opacity-50`}>
                {emailTesting ? <><Loader2 className="w-4 h-4 inline animate-spin ml-1" /> جاري الاختبار...</> : 'اختبار الاتصال'}
              </button>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={handleSave} 
        disabled={loading}
        className="btn-primary flex items-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        حفظ التغييرات
      </button>
    </div>
  );
};

export default Settings;