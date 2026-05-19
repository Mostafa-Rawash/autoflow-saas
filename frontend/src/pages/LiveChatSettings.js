import React, { useState, useEffect } from 'react';
import { MessageCircle, Save, Copy, Code } from 'lucide-react';
import { livechatAPI } from '../api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function LiveChatSettings() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data } = await livechatAPI.getConfig();
      setConfig(data.data || {});
    } catch (err) { toast.error('فشل في جلب إعدادات الدردشة المباشرة'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await livechatAPI.updateConfig(config);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (err) { toast.error('فشل في حفظ الإعدادات'); }
    finally { setSaving(false); }
  };

  const updateField = (path, value) => {
    setConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const toggleDay = (dayIndex) => {
    setConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const schedule = next.operatingHours?.schedule || [];
      const dayIndex2 = schedule.findIndex(s => s.day === dayIndex);
      if (dayIndex2 >= 0) {
        schedule[dayIndex2].isAvailable = !schedule[dayIndex2].isAvailable;
      } else {
        schedule.push({ day: dayIndex, start: '09:00', end: '17:00', isAvailable: true });
      }
      if (!next.operatingHours) next.operatingHours = { enabled: false, timezone: 'Africa/Cairo', schedule: [] };
      next.operatingHours.schedule = schedule;
      return next;
    });
  };

  const embedCode = config ? `<script>
  (function() {
    var s = document.createElement('script');
    s.src = '${window.location.origin}/livechat-widget.js';
    s.setAttribute('data-user-id', '${config.user || 'YOUR_USER_ID'}');
    s.async = true;
    document.head.appendChild(s);
  })();
</script>` : '';

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>الدردشة المباشرة</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إعدادات ويدجت الدردشة المباشرة لموقعك</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEmbed(!showEmbed)} className={`px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <Code className="w-4 h-4 inline ml-1" /> كود التضمين
          </button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25 hover:shadow-lg disabled:opacity-50">
            <Save className="w-4 h-4 inline ml-1" /> {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>

      {/* Embed Code */}
      {showEmbed && (
        <div className={`${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-4`}>
          <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>كود التضمين</h3>
          <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>أضف هذا الكود في صفحة موقعك لعرض ويدجت الدردشة المباشرة</p>
          <div className={`relative p-4 rounded-xl font-mono text-sm overflow-x-auto ${isDark ? 'bg-slate-900 text-green-400' : 'bg-gray-900 text-green-400'}`}>
            <pre className="whitespace-pre-wrap">{embedCode}</pre>
            <button onClick={() => { navigator.clipboard.writeText(embedCode); toast.success('تم نسخ الكود'); }}
              className={`absolute top-2 left-2 p-1.5 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
              <Copy className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className={`${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-5 space-y-4`}>
          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>إعدادات عامة</h3>
          <label className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>تفعيل الدردشة المباشرة</span>
            <input type="checkbox" checked={config.isActive ?? true} onChange={e => updateField('isActive', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
          </label>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>عنوان الويدجت</label>
            <input type="text" value={config.title || ''} onChange={e => updateField('title', e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>العنوان الفرعي</label>
            <input type="text" value={config.subtitle || ''} onChange={e => updateField('subtitle', e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>رسالة الترحيب</label>
            <textarea value={config.welcomeMessage || ''} onChange={e => updateField('welcomeMessage', e.target.value)} rows={2}
              className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500 resize-none`} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>رسالة خارج ساعات العمل</label>
            <textarea value={config.offlineMessage || ''} onChange={e => updateField('offlineMessage', e.target.value)} rows={2}
              className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500 resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>لون الويدجت</label>
              <input type="color" value={config.primaryColor || '#14b8a6'} onChange={e => updateField('primaryColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>الموقع</label>
              <select value={config.position || 'bottom-right'} onChange={e => updateField('position', e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}>
                <option value="bottom-right">أسفل اليمين</option>
                <option value="bottom-left">أسفل اليسار</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pre-chat form & Operating hours */}
        <div className="space-y-6">
          <div className={`${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-5 space-y-4`}>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>نموذج ما قبل الدردشة</h3>
            <label className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>طلب معلومات الزائر</span>
              <input type="checkbox" checked={config.preChatForm?.enabled ?? true} onChange={e => updateField('preChatForm.enabled', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
            </label>
            <label className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>التعيين التلقائي للوكلاء</span>
              <input type="checkbox" checked={config.autoAssignment ?? true} onChange={e => updateField('autoAssignment', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
            </label>
          </div>

          <div className={`${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-5 space-y-4`}>
            <label className="flex items-center justify-between">
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ساعات العمل</span>
              <input type="checkbox" checked={config.operatingHours?.enabled ?? false} onChange={e => updateField('operatingHours.enabled', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
            </label>
            {config.operatingHours?.enabled && (
              <div className="space-y-2">
                {dayNames.map((name, i) => {
                  const schedule = (config.operatingHours?.schedule || []).find(s => s.day === i);
                  const isAvailable = schedule?.isAvailable ?? false;
                  return (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                      <label className="flex items-center gap-2 w-28">
                        <input type="checkbox" checked={isAvailable} onChange={() => toggleDay(i)} className="w-4 h-4 rounded border-gray-300 text-teal-500" />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{name}</span>
                      </label>
                      {isAvailable && (
                        <div className="flex items-center gap-2 flex-1">
                          <input type="time" value={schedule?.start || '09:00'} onChange={e => { const s = JSON.parse(JSON.stringify(config.operatingHours.schedule)); const idx = s.findIndex(x => x.day === i); if (idx >= 0) s[idx].start = e.target.value; updateField('operatingHours.schedule', s); }}
                            className={`px-2 py-1 text-sm rounded border ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'}`} />
                          <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>إلى</span>
                          <input type="time" value={schedule?.end || '17:00'} onChange={e => { const s = JSON.parse(JSON.stringify(config.operatingHours.schedule)); const idx = s.findIndex(x => x.day === i); if (idx >= 0) s[idx].end = e.target.value; updateField('operatingHours.schedule', s); }}
                            className={`px-2 py-1 text-sm rounded border ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}