import React, { useEffect, useState } from 'react';
import { Check, Smartphone, RefreshCw, QrCode, Send, MessageSquare, Lock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WhatsAppConnect = () => {
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('connected');
  const [chats, setChats] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setChats([
      { id: 'demo-1', name: 'أحمد محمد', isGroup: false, lastMessage: { content: 'عايز أعرف سعر الباقة' }, unreadCount: 2 },
      { id: 'demo-2', name: 'سارة علي', isGroup: false, lastMessage: { content: 'شكراً ليكم' }, unreadCount: 0 }
    ]);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/channels/connect`, { type: 'whatsapp' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('واتس آب بالفعل متصل في وضع العرض');
      setConnected(true);
      setStatus('connected');
    } catch (error) {
      toast.error('واتس آب متاح فقط في وضع العرض حالياً');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!phoneNumber || !message) return toast.error('أدخل رقم الهاتف والرسالة');
    toast.success('تم إرسال الرسالة في وضع العرض');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">واتس آب</h1>
          <p className="text-gray-400 mt-1">القناة الوحيدة النشطة حالياً</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm ${connected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {connected ? 'متصل ✓' : 'غير متصل'}
        </div>
      </div>

      <div className="card p-8">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-12 h-12 text-[#25D366]" />
          </div>
          <h2 className="text-xl font-bold mb-2">واتس آب متصل بالفعل</h2>
          <p className="text-gray-400 mb-6">هذه الصفحة تعمل بوضع العرض فقط، ولا يوجد ربط يدوي حقيقي حالياً.</p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2"
            style={{ background: '#25D366' }}
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
            <span>{loading ? 'جاري التحديث...' : 'تحديث الحالة'}</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 text-center"><div className="text-3xl mb-2">💰</div><h4 className="font-bold text-sm">مظهر تجريبي</h4><p className="text-xs text-gray-500">لا يعتمد على QR حقيقي</p></div>
        <div className="card p-4 text-center"><div className="text-3xl mb-2">📱</div><h4 className="font-bold text-sm">واتس آب فقط</h4><p className="text-xs text-gray-500">باقي القنوات معطلة</p></div>
        <div className="card p-4 text-center"><div className="text-3xl mb-2">⚡</div><h4 className="font-bold text-sm">Real-time</h4><p className="text-xs text-gray-500">معاينة فورية للواجهة</p></div>
      </div>

      <div className="card p-6 bg-[#25D366]/10 border-[#25D366]/20">
        <h3 className="font-bold mb-2 text-[#25D366]">💡 ملاحظات مهمة</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• القناة الحالية هي واتس آب فقط</li>
          <li>• Messenger / Instagram / Telegram معطلة حالياً</li>
          <li>• إرسال الرسائل هنا تجريبي لواجهة العرض</li>
        </ul>
      </div>

      <div className="card p-6">
        <h3 className="font-bold mb-4">المحادثات</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {chats.map((chat) => (
            <div key={chat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center">{chat.isGroup ? '👥' : '👤'}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{chat.name}</p>
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage?.content || 'لا توجد رسائل'}</p>
              </div>
              {chat.unreadCount > 0 && <span className="bg-[#25D366] text-white text-xs px-2 py-1 rounded-full">{chat.unreadCount}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold mb-4">إرسال سريع</h3>
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="201099129550" className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الرسالة</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="اكتب رسالتك..." rows={3} className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 resize-none" />
          </div>
          <button type="submit" className="btn-primary inline-flex items-center gap-2" style={{ background: '#25D366' }}>
            <Send className="w-5 h-5" /> إرسال
          </button>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppConnect;
