import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Send, Clock, MessageSquare } from 'lucide-react';
import { conversationsAPI } from '../api';

const demoConversation = {
  _id: 'demo-1',
  channel: 'whatsapp',
  contact: { name: 'أحمد محمد', phone: '+201012345678' },
  status: 'active',
  priority: 'normal',
  lastMessage: { content: 'مرحباً، عايز أعرف أسعار الباقات الجديدة', timestamp: new Date().toISOString(), sender: 'contact' },
  notes: []
};

const demoMessages = [
  { id: 'm1', sender: 'contact', content: 'مرحباً، عايز أعرف أسعار الباقات الجديدة', time: '10:15 ص' },
  { id: 'm2', sender: 'agent', content: 'أكيد، باقة البداية تبدأ من 2000 جنيه شهرياً وتشمل قناة واتس آب واحدة.', time: '10:16 ص' },
  { id: 'm3', sender: 'contact', content: 'تمام، ممكن تفاصيل أكثر؟', time: '10:17 ص' }
];

const ConversationDetail = () => {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversation();
  }, [id]);

  const fetchConversation = async () => {
    try {
      const { data } = await conversationsAPI.getOne(id);
      setConversation(data.conversation || demoConversation);
      setMessages(data.messages?.length ? data.messages : demoMessages);
    } catch (error) {
      setConversation(demoConversation);
      setMessages(demoMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'agent', content: messageText, time: 'الآن' }]);
    setMessageText('');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/conversations" className="p-2 rounded-lg hover:bg-white/5">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{conversation?.contact?.name}</h1>
            <p className="text-gray-400 text-sm">{conversation?.contact?.phone} • واتس آب</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs ${conversation?.status === 'active' ? 'status-active' : conversation?.status === 'pending' ? 'status-pending' : 'status-resolved'}`}>
          {conversation?.status === 'active' ? 'نشط' : conversation?.status === 'pending' ? 'معلق' : 'محلول'}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="card p-4 flex flex-col h-[70vh]">
          <div className="flex-1 overflow-y-auto space-y-4 p-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender === 'agent' ? 'bg-primary-500/20' : 'bg-whatsapp/20'}`}>
                  <p className="text-sm">{msg.content}</p>
                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="pt-4 border-t border-dark-700 flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="اكتب رسالتك..."
              className="flex-1 bg-dark-800 border border-dark-600 rounded-lg py-3 px-4"
            />
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" /> إرسال
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> معلومات المحادثة</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>القناة: واتس آب</p>
              <p>الأولوية: {conversation?.priority || 'normal'}</p>
              <p>آخر رسالة: {conversation?.lastMessage?.content || '—'}</p>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="font-bold mb-3">ملاحظات</h3>
            <p className="text-sm text-gray-400">يمكنك لاحقاً إضافة ملاحظات داخلية وربطها بالفريق.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
