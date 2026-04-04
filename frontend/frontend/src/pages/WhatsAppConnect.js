import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Smartphone, RefreshCw, QrCode, Send, MessageSquare } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WhatsAppConnect = () => {
  const [status, setStatus] = useState('not_initialized');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/whatsapp/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus(data.status);
      setConnected(data.status === 'connected');
      
      if (data.info) {
        toast.success(`واتس آب متصل كـ ${data.info.pushname}`);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Poll for QR code every 3 seconds when initializing
    const interval = setInterval(async () => {
      if (status === 'initializing' || status === 'not_initialized') {
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get(`${API_URL}/whatsapp/qr`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (data.qr) {
            setQrCode(data.qr);
          } else if (data.status === 'connected') {
            setConnected(true);
            setStatus('connected');
            toast.success('واتس آب متصل بنجاح! 🎉');
          }
        } catch (error) {
          console.error('Error fetching QR:', error);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_URL}/whatsapp/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus('initializing');
      toast.success('جاري تهيئة الاتصال...');
    } catch (error) {
      toast.error('فشل في تهيئة الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/whatsapp/disconnect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus('not_initialized');
      setConnected(false);
      setQrCode(null);
      toast.success('تم قطع الاتصال');
    } catch (error) {
      toast.error('فشل في قطع الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleGetChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/whatsapp/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChats(data.chats);
      toast.success(`تم تحميل ${data.chats.length} محادثة`);
    } catch (error) {
      toast.error('فشل في تحميل المحادثات');
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
      toast.error('فشل في إرسال الرسالة');
    }
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
          <div className={`px-4 py-2 rounded-full text-sm ${
            connected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
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
              <div>
                <p className="text-gray-400 mb-4">امسح الكود بواتس آب على جوالك</p>
                <div className="bg-white p-4 rounded-xl inline-block">
                  <pre className="text-xs leading-none">{qrCode}</pre>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  WhatsApp > Settings > Linked Devices > Link Device
                </p>
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
            <h2 className="text-xl font-bold mb-2">واتس آب متصل!</h2>
            <p className="text-gray-400 mb-6">
              يمكنك الآن إرسال واستقبال الرسائل
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGetChats}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
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
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الرسالة</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك..."
                rows={3}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 resize-none"
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
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center">
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
          <h4 className="font-bold text-sm">QR Code</h4>
          <p className="text-xs text-gray-500">سهل التوصيل</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h4 className="font-bold text-sm">Real-time</h4>
          <p className="text-xs text-gray-500">رسائل فورية</p>
        </div>
      </div>

      {/* Info */}
      <div className="card p-6 bg-[#25D366]/10 border-[#25D366]/20">
        <h3 className="font-bold mb-2 text-[#25D366]">💡 ملاحظات مهمة</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• هذا الاتصال يستخدم WhatsApp Web عبر المتصفح</li>
          <li>• يجب أن يظل الجوال متصل بالإنترنت</li>
          <li>• الرسائل مشفرة من طرف لطرف</li>
          <li>• مناسب للاستخدام الشخصي والصغير</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatsAppConnect;