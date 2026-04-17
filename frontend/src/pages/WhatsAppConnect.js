import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Smartphone, RefreshCw, QrCode, Send, MessageSquare, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const WhatsAppConnect = () => {
  const [status, setStatus] = useState('not_initialized');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  // Get current user ID from token
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload.userId;
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
    return null;
  };

  // Initialize socket connection
  useEffect(() => {
    const userId = getCurrentUserId();
    
    if (userId) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: { token: localStorage.getItem('token') },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        socketRef.current.emit('authenticate', userId);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected, will auto-reconnect');
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        socketRef.current.emit('authenticate', userId);
      });

      // Listen for QR code events
      socketRef.current.on('whatsapp-qr', (data) => {
        console.log('Received QR code:', data);
        setQrCode(data.qr);
        setStatus('qr_ready');
      });

      // Listen for connected event
      socketRef.current.on('whatsapp-connected', (data) => {
        console.log('WhatsApp connected:', data);
        setConnected(true);
        setStatus('connected');
        setQrCode(null);
        setUserInfo(data.info);
        toast.success(`واتس آب متصل كـ ${data.info?.pushname || 'المستخدم'}! 🎉`);
      });

      // Listen for disconnected event
      socketRef.current.on('whatsapp-disconnected', (data) => {
        console.log('WhatsApp disconnected:', data);
        setConnected(false);
        setStatus('disconnected');
        setQrCode(null);
        setUserInfo(null);
        toast.error('تم قطع اتصال واتس آب');
      });

      // Listen for error event
      socketRef.current.on('whatsapp-error', (data) => {
        console.log('WhatsApp error:', data);
        setStatus('error');
        toast.error(data.error || 'حدث خطأ في الاتصال');
      });

      // Listen for new messages
      socketRef.current.on('new-message', (data) => {
        console.log('New message:', data);
        toast.success('رسالة جديدة! 📩');
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [SOCKET_URL]);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/whatsapp/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus(data.status);
      setConnected(data.status === 'connected');
      
      if (data.info) {
        setUserInfo(data.info);
        toast.success(`واتس آب متصل كـ ${data.info.pushname}`);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [API_URL]);
  
  // Fetch QR on demand when status is 'initializing' or 'qr_ready'
  const fetchQR = async () => {
    if (status !== 'initializing' && status !== 'qr_ready' && status !== 'not_initialized') {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/whatsapp/qr`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.qr) {
        setQrCode(data.qr);
        setStatus('qr_ready');
      } else if (data.status === 'connected') {
        setConnected(true);
        setStatus('connected');
        toast.success('واتس آب متصل بنجاح! 🎉');
      }
    } catch (error) {
      console.error('Error fetching QR:', error);
    }
  };
  
  // Manual refresh button handler
  const handleRefresh = () => {
    fetchStatus();
    if (status === 'initializing' || status === 'qr_ready') {
      fetchQR();
    }
  };

  const handleConnect = async () => {
    // Show confirmation dialog with limitations
    const confirmMessage = `⚠️ تنبيه قبل الاتصال:\n\n` +
      `• الهاتف يجب أن يبقى متصلاً بالإنترنت\n` +
      `• الاتصال يستهلك ~200 MB ذاكرة\n` +
      `• غير مناسب للإرسال الكمي\n\n` +
      `هل تريد المتابعة؟`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_URL}/whatsapp/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus(data.status);
      
      if (data.status === 'limit_reached') {
        toast.error(data.message);
      } else if (data.status === 'already_exists') {
        toast('العميل موجود بالفعل', { icon: 'ℹ️' });
      } else {
        toast.success('جاري تهيئة الاتصال... انتظر كود QR');
      }
    } catch (error) {
      toast.error('فشل في تهيئة الاتصال');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    const confirmMessage = `⚠️ تنبيه:\n\n` +
      `سيتم قطع اتصال واتس آب وستحتاج لمسح كود QR مرة أخرى للتواصل.\n\n` +
      `هل تريد قطع الاتصال؟`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/whatsapp/disconnect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus('not_initialized');
      setConnected(false);
      setQrCode(null);
      setUserInfo(null);
      toast.success('تم قطع الاتصال');
    } catch (error) {
      toast.error('فشل في قطع الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleGetChats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/whatsapp/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChats(data.chats || []);
      toast.success(`تم تحميل ${data.chats?.length || 0} محادثة`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل في تحميل المحادثات');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || !message) {
      toast.error('أدخل رقم الهاتف والرسالة');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/whatsapp/send`, {
        to: phoneNumber,
        content: message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('تم إرسال الرسالة! ✅');
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل في إرسال الرسالة');
    }
  };

  // Generate QR Code image using QR server API
  const getQRCodeImageUrl = (qrString) => {
    if (!qrString) return null;
    // Use QR code API to generate image from the string
    return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrString)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">واتس آب</h1>
          <p className="text-gray-400 mt-1">تواصل مع عملائك عبر واتس آب</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
            connected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
            {connected ? 'متصل ✓' : 'غير متصل'}
          </div>
        </div>
      </div>

      {/* Connection Card */}
      <div className="card p-8">
        {!connected ? (
          <div className="text-center">
            {/* QR Code Display */}
            {qrCode ? (
              <div className="space-y-4">
                <p className="text-gray-400 mb-4">امسح الكود بواتس آب على جوالك</p>
                <div className="bg-white p-6 rounded-xl inline-block">
                  {/* Show QR as image */}
                  <img 
                    src={getQRCodeImageUrl(qrCode)} 
                    alt="WhatsApp QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  WhatsApp ➜ Settings ➜ Linked Devices ➜ Link Device
                </p>
                <p className="text-xs text-[#25D366] mt-2">
                  📱 افتح واتس آب على جوالك وامسح الكود أعلاه
                </p>
                
                {/* Debug: Show raw QR string */}
                <details className="mt-4 text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer">عرض الكود الخام (للتطوير)</summary>
                  <pre className="text-xs bg-dark-800 p-2 rounded mt-2 overflow-auto max-h-32">{qrCode}</pre>
                </details>
              </div>
            ) : status === 'initializing' ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-[#25D366] animate-spin mb-4" />
                <p className="text-gray-400">جاري تهيئة الاتصال...</p>
                <p className="text-xs text-gray-500 mt-2">قد يستغرق هذا بضع ثوانٍ</p>
              </div>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-12 h-12 text-[#25D366]" />
                </div>
                <h2 className="text-xl font-bold mb-2">تواصل مع واتس آب</h2>
                <p className="text-gray-400 mb-6">
                  اضغط على زر الاتصال وامسح كود QR بواتس آب على جوالك
                </p>
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="btn-primary inline-flex items-center gap-2"
                  style={{ background: '#25D366' }}
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <QrCode className="w-5 h-5" />
                  )}
                  <span>{loading ? 'جاري التهيئة...' : 'اتصل الآن'}</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-12 h-12 text-[#25D366]" />
            </div>
            <h2 className="text-xl font-bold mb-2">واتس آب متصل! 🎉</h2>
            {userInfo && (
              <p className="text-gray-400 mb-2">
                متصل كـ: <span className="text-[#25D366] font-medium">{userInfo.pushname}</span>
              </p>
            )}
            {userInfo?.me && (
              <p className="text-xs text-gray-500 mb-4">
                الرقم: {userInfo.me}
              </p>
            )}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 text-left max-w-md mx-auto">
              <p className="text-xs text-amber-400 font-medium mb-1">⚡ للاتصال المستقر:</p>
              <ul className="text-xs text-gray-400 space-y-0.5">
                <li>• أبقِ هاتفك متصلاً بالإنترنت</li>
                <li>• لا تغلق تطبيق واتس آب على الهاتف</li>
                <li>• تجنب الإرسال الكمي لتجنب الحظر</li>
              </ul>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={handleGetChats}
                disabled={loading}
                className="btn-secondary inline-flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                تحميل المحادثات
              </button>
              <button
                onClick={handleDisconnect}
                className="border border-red-500/40 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                قطع الاتصال
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Send (when connected) */}
      {connected && (
        <div className="card p-6">
          <h3 className="font-bold mb-4">إرسال سريع</h3>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="201099129550"
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 focus:border-[#25D366] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الرسالة</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك..."
                rows={3}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 resize-none focus:border-[#25D366] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-primary inline-flex items-center gap-2"
              style={{ background: '#25D366' }}
            >
              <Send className="w-5 h-5" />
              إرسال
            </button>
          </form>
        </div>
      )}

      {/* Chats List (when loaded) */}
      {chats.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold mb-4">المحادثات ({chats.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setPhoneNumber(chat.id.replace('@c.us', ''))}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-[#25D366]/20"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-lg">
                  {chat.isGroup ? '👥' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{chat.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.lastMessage?.content || 'لا توجد رسائل'}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <span className="bg-[#25D366] text-white text-xs px-2 py-1 rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-3xl mb-2">💰</div>
          <h4 className="font-bold text-sm">مجاني 100%</h4>
          <p className="text-xs text-gray-500">بدون رسوم API</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl mb-2">📱</div>
          <h4 className="font-bold text-sm">Multi-Tenant</h4>
          <p className="text-xs text-gray-500">كل حساب متصل منفصل</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h4 className="font-bold text-sm">Real-time</h4>
          <p className="text-xs text-gray-500">رسائل فورية عبر Socket.io</p>
        </div>
      </div>

      {/* Limitations Warning */}
      {!connected && (
        <div className="card p-6 bg-amber-500/10 border-amber-500/20">
          <h3 className="font-bold mb-3 text-amber-400 flex items-center gap-2">
            ⚠️ قيود مهمة يجب معرفتها
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-amber-400">💾</span>
              <div>
                <p className="text-white font-medium">استهلاك الموارد</p>
                <p className="text-gray-400">كل اتصال يستهلك ~150-200 MB ذاكرة (يعمل متصفح خفي)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-400">📱</span>
              <div>
                <p className="text-white font-medium">الهاتف يجب أن يبقى متصلاً</p>
                <p className="text-gray-400">واتس آب Web يتطلب اتصال الهاتف بالإنترنت باستمرار</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-400">🔒</span>
              <div>
                <p className="text-white font-medium">غير مناسب للإرسال الكمي</p>
                <p className="text-gray-400">مصمم للاستخدام الشخصي والشركات الصغيرة، وليس للـ bulk messaging</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-400">⚠️</span>
              <div>
                <p className="text-white font-medium">خطر الحظر</p>
                <p className="text-gray-400">الإرسال المكثف قد يؤدي لحسابك من واتس آب - استخدم بحكمة</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-400">🔢</span>
              <div>
                <p className="text-white font-medium">حد الاتصالات المتزامنة</p>
                <p className="text-gray-400">الحد الأقصى 10 اتصالات نشطة في نفس الوقت (قابل للزيادة عبر الدعم)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-400">⚡</span>
              <div>
                <p className="text-white font-medium">الاتصال قد ينقطع</p>
                <p className="text-gray-400">إذا انقطع الهاتف من الإنترنت أو إغلقت واتس آب، ستحتاج إعادة المسح</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-amber-500/20">
            <p className="text-xs text-gray-500">
              💡 <span className="text-amber-400">بديل:</span> للإرسال الكمي والاستخدام التجاري، نوصي باستخدام 
              <span className="text-green-400"> WhatsApp Business API</span> (يتطلب موافقة واتس آب)
            </p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="card p-6 bg-[#25D366]/10 border-[#25D366]/20">
        <h3 className="font-bold mb-2 text-[#25D366]">✅ المميزات</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• <span className="text-white">مجاني 100%</span> - بدون رسوم API أو اشتراك</li>
          <li>• <span className="text-white">متعدد المستخدمين</span> - كل حساب متصل بواتس آب الخاص به</li>
          <li>• <span className="text-white">رسائل فورية</span> - عبر Socket.io في الوقت الحقيقي</li>
          <li>• <span className="text-white">تشفير من طرف لطرف</span> - نفس أمان واتس آب</li>
          <li>• <span className="text-white">سهل التوصيل</span> - فقط امسح كود QR</li>
          <li>• <span className="text-white">محادثات لا محدودة</span> - بدون قيود على عدد المحادثات</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatsAppConnect;