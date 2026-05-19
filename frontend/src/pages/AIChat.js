import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, FileText, Search, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatAPI, documentsAPI } from '../api';
import { useTheme } from '../context/ThemeContext';

const AIChat = () => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [topK, setTopK] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchDocuments = async () => {
    try {
      const res = await documentsAPI.getAll({ limit: 100, status: 'ready' });
      setDocuments(res.data.documents);
    } catch (err) {
      // Documents not available yet
    }
  };

  const handleSend = async () => {
    const query = input.trim();
    if (!query || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: query, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const payload = { query, topK };
      if (selectedDocs.length > 0) {
        payload.documentIds = selectedDocs;
      }

      const res = await chatAPI.ask(payload);
      const data = res.data;

      const aiMsg = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        tokensUsed: data.tokensUsed || 0,
        model: data.model || '',
        time: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'حدث خطأ أثناء معالجة السؤال';
      const errorCode = err.response?.data?.code;

      if (errorCode === 'AI_NOT_CONFIGURED') {
        setHasApiKey(false);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: null,
        error: errorMsg,
        errorCode,
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleDocSelection = (docId) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const quickQuestions = [
    'ما هي أهم المعلومات في المستندات؟',
    'لخّص لي المحتوى',
    'ما هي النقاط الرئيسية؟',
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Sparkles className="w-6 h-6 text-teal-500" />
            محادثة ذكية
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            اسأل أسئلة عن المستندات المرفوعة واحصل على إجابات مدعومة بالمصادر
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className={`glass p-4 rounded-xl mb-4 ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            إعدادات البحث
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                عدد النتائج (Top K): {topK}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
            <div>
              <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                المستندات المحددة (اترك فارغاً للبحث في الكل)
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {documents.length === 0 ? (
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    لا توجد مستندات جاهزة
                  </p>
                ) : (
                  documents.map(doc => (
                    <label key={doc._id} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                      selectedDocs.includes(doc._id)
                        ? isDark ? 'bg-teal-500/10' : 'bg-teal-50'
                        : isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc._id)}
                        onChange={() => toggleDocSelection(doc._id)}
                        className="accent-teal-500"
                      />
                      <FileText className="w-3.5 h-3.5 text-teal-500" />
                      <span className={`text-xs truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {doc.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API key warning */}
      {!hasApiKey && (
        <div className={`p-3 rounded-xl mb-4 flex items-start gap-2 ${isDark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              خدمة الذكاء الاصطناعي غير مُعدة
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              يرجى إضافة OPENAI_API_KEY في إعدادات الخادم لتفعيل المحادثة الذكية
            </p>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className={`flex-1 overflow-y-auto rounded-xl mb-4 ${messages.length === 0 ? 'flex items-center justify-center' : ''}`}>
        {messages.length === 0 ? (
          <div className="text-center px-4">
            <Bot className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-teal-400' : 'text-teal-500'}`} />
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              مرحباً! أنا مساعدك الذكي
            </h2>
            <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ارفع مستندات في قاعدة المعرفة ثم اسألني أي سؤال عنها
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-sm'
                    : msg.error
                      ? isDark ? 'bg-red-500/10 border border-red-500/30 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
                      : isDark ? 'bg-slate-800 border border-slate-700 text-slate-200' : 'bg-white border border-slate-200 text-slate-800'
                }`}>
                  {msg.error ? (
                    <p className="text-sm">{msg.error}</p>
                  ) : (
                    <>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                          <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            المصادر:
                          </p>
                          <div className="space-y-1">
                            {msg.sources.map((source, i) => (
                              <div key={i} className={`text-xs p-2 rounded-lg ${isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                                  مصدر {i + 1}
                                </span>
                                {source.score && (
                                  <span className="ml-2 opacity-70">({(source.score * 100).toFixed(0)}% تطابق)</span>
                                )}
                                <p className="mt-0.5 line-clamp-2">{source.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.tokensUsed > 0 && (
                        <p className={`text-[10px] mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {msg.tokensUsed} رمز • {msg.model}
                        </p>
                      )}
                    </>
                  )}
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {msg.time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      جاري البحث في المستندات...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className={`glass p-3 rounded-xl ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اسأل عن المستندات..."
            rows={1}
            className={`flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
              isDark
                ? 'bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500/50'
                : 'bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/30'
            }`}
            disabled={loading}
            style={{ maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 rotate-180" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;