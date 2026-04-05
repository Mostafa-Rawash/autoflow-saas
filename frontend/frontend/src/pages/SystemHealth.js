import React, { useState, useEffect } from 'react';

const SystemHealth = () => {
  const [health, setHealth] = useState({
    api: { status: 'checking', latency: null },
    database: { status: 'checking', size: null },
    whatsapp: { status: 'checking', connected: false },
    storage: { status: 'checking', used: null, total: null },
    memory: { status: 'checking', used: null },
    uptime: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      // In production, call actual health endpoint
      // const res = await api.get('/health/detailed');
      
      // Mock health data
      setHealth({
        api: { status: 'healthy', latency: 45 },
        database: { status: 'healthy', size: '256 MB' },
        whatsapp: { status: 'connected', connected: true },
        storage: { status: 'healthy', used: 78, total: 100 },
        memory: { status: 'healthy', used: 62 },
        uptime: '15 days, 4 hours'
      });
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      healthy: 'bg-green-500/20 text-green-400',
      connected: 'bg-green-500/20 text-green-400',
      warning: 'bg-yellow-500/20 text-yellow-400',
      error: 'bg-red-500/20 text-red-400',
      checking: 'bg-gray-500/20 text-gray-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || colors.checking}`}>
        {status === 'healthy' ? '✓ سليم' : 
         status === 'connected' ? '✓ متصل' :
         status === 'warning' ? '⚠ تحذير' :
         status === 'error' ? '✗ خطأ' : 'جاري الفحص...'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">حالة النظام</h1>
          <p className="text-gray-400 text-sm mt-1">مراقبة صحة وصلاحية الخدمات</p>
        </div>
        <button
          onClick={checkHealth}
          className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          تحديث
        </button>
      </div>

      {/* Overall Status */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              health.api.status === 'healthy' && health.whatsapp.status === 'connected'
                ? 'bg-green-500/20'
                : 'bg-yellow-500/20'
            }`}>
              {health.api.status === 'healthy' && health.whatsapp.status === 'connected' ? (
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {health.api.status === 'healthy' && health.whatsapp.status === 'connected'
                  ? 'النظام يعمل بشكل طبيعي'
                  : 'النظام يحتاج انتباه'}
              </h2>
              <p className="text-gray-400">آخر فحص: {new Date().toLocaleTimeString('ar-EG')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">وقت التشغيل</p>
            <p className="text-lg font-bold">{health.uptime}</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* API */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 className="font-bold">API Server</h3>
            </div>
            <StatusBadge status={health.api.status} />
          </div>
          {health.api.latency && (
            <p className="text-sm text-gray-400">زمن الاستجابة: {health.api.latency}ms</p>
          )}
        </div>

        {/* Database */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="font-bold">قاعدة البيانات</h3>
            </div>
            <StatusBadge status={health.database.status} />
          </div>
          {health.database.size && (
            <p className="text-sm text-gray-400">الحجم: {health.database.size}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </div>
              <h3 className="font-bold">واتس آب</h3>
            </div>
            <StatusBadge status={health.whatsapp.status} />
          </div>
          <p className="text-sm text-gray-400">
            {health.whatsapp.connected ? 'متصل وجاهز' : 'غير متصل'}
          </p>
        </div>

        {/* Storage */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="font-bold">التخزين</h3>
            </div>
            <StatusBadge status={health.storage.status} />
          </div>
          {health.storage.used && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{health.storage.used}% مستخدم</span>
                <span className="text-gray-500">{health.storage.total} GB</span>
              </div>
              <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    health.storage.used > 90 ? 'bg-red-500' :
                    health.storage.used > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${health.storage.used}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Memory */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="font-bold">الذاكرة</h3>
            </div>
            <StatusBadge status={health.memory.status} />
          </div>
          {health.memory.used && (
            <p className="text-sm text-gray-400">{health.memory.used}% مستخدم</p>
          )}
        </div>

        {/* SSL/Security */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold">الأمان</h3>
            </div>
            <StatusBadge status="healthy" />
          </div>
          <p className="text-sm text-gray-400">SSL فعال • HTTPS</p>
        </div>
      </div>

      {/* Actions */}
      <div className="glass rounded-xl p-6">
        <h3 className="font-bold mb-4">إجراءات سريعة</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <button className="btn-secondary px-4 py-3 rounded-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            إعادة تشغيل API
          </button>
          <button className="btn-secondary px-4 py-3 rounded-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            مسح الكاش
          </button>
          <button className="btn-secondary px-4 py-3 rounded-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            نسخ احتياطي
          </button>
          <button className="btn-secondary px-4 py-3 rounded-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            تصدير السجلات
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;