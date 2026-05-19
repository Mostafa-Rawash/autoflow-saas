import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Send, Clock, MessageSquare, Plus, Trash2, FileText, X, ChevronDown, Star } from 'lucide-react';
import { conversationsAPI, templatesAPI, csatAPI } from '../api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const ConversationDetail = () => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [fillingTemplate, setFillingTemplate] = useState(null);
  const [variableValues, setVariableValues] = useState({});
  const [csatHover, setCsatHover] = useState(0);
  const messagesEndRef = useRef(null);
  const templatePickerRef = useRef(null);

  useEffect(() => {
    fetchConversation();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close template picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (templatePickerRef.current && !templatePickerRef.current.contains(e.target)) {
        setShowTemplatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const { data } = await conversationsAPI.getOne(id);
      setConversation(data.conversation || null);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('فشل في تحميل المحادثة');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await templatesAPI.getAll();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const text = messageText;
    setMessageText('');

    try {
      const { data } = await conversationsAPI.sendMessage(id, { content: text, type: 'text' });
      if (data?.message) {
        setMessages(prev => [...prev, data.message]);
        setConversation(prev => ({
          ...prev,
          lastMessage: { content: text, timestamp: new Date(), sender: 'agent' }
        }));
      } else {
        fetchConversation();
      }
    } catch (error) {
      toast.error('فشل في إرسال الرسالة');
      setMessageText(text);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      await conversationsAPI.update(id, { notes: [...(conversation.notes || []), { content: noteText, addedAt: new Date() }] });
      setConversation(prev => ({
        ...prev,
        notes: [...(prev.notes || []), { content: noteText, addedAt: new Date() }]
      }));
      setNoteText('');
      toast.success('تم إضافة الملاحظة');
    } catch (error) {
      toast.error('فشل في إضافة الملاحظة');
    }
  };

  const handleDeleteNote = async (index) => {
    try {
      const updatedNotes = conversation.notes.filter((_, i) => i !== index);
      await conversationsAPI.update(id, { notes: updatedNotes });
      setConversation(prev => ({ ...prev, notes: updatedNotes }));
      toast.success('تم حذف الملاحظة');
    } catch (error) {
      toast.error('فشل في حذف الملاحظة');
    }
  };

  const handleCSAT = async (score) => {
    try {
      const { data } = await csatAPI.submit(id, { score });
      setConversation(prev => ({ ...prev, csat: data.conversation.csat }));
      toast.success('تم إرسال التقييم بنجاح');
    } catch (error) {
      toast.error('فشل في إرسال التقييم');
    }
  };

  // Map known variable names to contact data
  const getContactValue = (key) => {
    if (!conversation?.contact) return '';
    const k = key.toLowerCase();
    if (k === 'name' || k === 'الاسم' || k === 'اسم') return conversation.contact.name || '';
    if (k === 'phone' || k === 'هاتف' || k === 'رقم' || k === 'رقم_الهاتف') return conversation.contact.phone || '';
    if (k === 'email' || k === 'بريد' || k === 'البريد') return conversation.contact.email || '';
    return '';
  };

  const handleSelectTemplate = (template) => {
    setShowTemplatePicker(false);
    const content = template.content?.text || template.content || '';
    const variables = template.content?.variables || [];

    // Auto-fill contact data for known variables
    const prefilled = variables.reduce((acc, v) => {
      acc[v] = getContactValue(v);
      return acc;
    }, {});

    // If all variables are auto-filled, insert directly
    const allFilled = variables.every(v => prefilled[v]);
    if (allFilled) {
      let text = content;
      for (const v of variables) {
        text = text.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), prefilled[v]);
      }
      setMessageText(text);
      return;
    }

    setFillingTemplate({ ...template, content: { ...template.content, text: content }, contentText: content });
    setVariableValues(prefilled);
  };

  const handleApplyTemplate = () => {
    let text = fillingTemplate.contentText;
    for (const [key, value] of Object.entries(variableValues)) {
      text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`);
    }
    setMessageText(text);
    setFillingTemplate(null);
    setVariableValues({});
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const channelLabel = (channel) => {
    switch (channel) {
      case 'telegram': return 'تيليجرام';
      case 'whatsapp': return 'واتس آب';
      default: return channel;
    }
  };

  const filteredTemplates = templates.filter(t => {
    const text = templateSearch.toLowerCase();
    return t.name.toLowerCase().includes(text) ||
           (t.content?.text || '').toLowerCase().includes(text);
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" /></div>;
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>المحادثة غير موجودة</p>
        <Link to="/conversations" className="btn-primary mt-4 inline-block">العودة للمحادثات</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/conversations" className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{conversation.contact?.name || conversation.contact?.phone || 'مجهول'}</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {conversation.contact?.phone} • {channelLabel(conversation.channel)}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs ${
          conversation.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'
          : conversation.status === 'pending' ? 'bg-amber-500/15 text-amber-600 border border-amber-500/20'
          : 'bg-sky-500/15 text-sky-600 border border-sky-500/20'
        }`}>
          {conversation.status === 'active' ? 'نشط' : conversation.status === 'pending' ? 'معلق' : conversation.status === 'resolved' ? 'محلول' : 'مغلق'}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Chat Area */}
        <div className={`glass rounded-2xl p-4 flex flex-col h-[70vh]`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-2">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>لا توجد رسائل بعد</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={msg._id || msg.id || idx} className={`flex ${msg.sender === 'agent' || msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.sender === 'contact'
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white'
                      : msg.sender === 'bot'
                        ? isDark ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
                        : isDark ? 'bg-sky-500/20 border border-sky-500/30' : 'bg-sky-50 border border-sky-200'
                  }`}>
                    {msg.sender === 'bot' && (
                      <span className={`text-xs font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>رد تلقائي</span>
                    )}
                    <p className={`text-sm ${msg.sender === 'contact' ? 'text-white' : isDark ? 'text-slate-200' : 'text-slate-800'}`}>{msg.content}</p>
                    <div className={`text-xs mt-2 flex items-center gap-1 ${msg.sender === 'contact' ? 'text-white/70' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3" /> {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Template Variable Fill Modal */}
          {fillingTemplate && (
            <div className={`mb-3 p-4 rounded-xl ${isDark ? 'bg-slate-800/80 border border-slate-700/60' : 'bg-white border border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fillingTemplate.name}</h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>املأ المتغيرات ثم أرسل</p>
                  </div>
                </div>
                <button
                  onClick={() => { setFillingTemplate(null); setVariableValues({}); }}
                  className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview */}
              <div className={`text-sm p-3 rounded-lg mb-3 ${isDark ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                {Object.entries(variableValues).map(([key, value]) => {
                  const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                  return null;
                })}
                {(() => {
                  let preview = fillingTemplate.contentText;
                  for (const [key, value] of Object.entries(variableValues)) {
                    preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`);
                  }
                  return preview;
                })()}
              </div>

              {/* Variable inputs */}
              <div className="space-y-2 mb-3">
                {Object.keys(variableValues).map(variable => (
                  <div key={variable} className="flex items-center gap-2">
                    <span className={`text-xs font-mono px-2 py-1 rounded ${isDark ? 'bg-teal-500/15 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                      {`{{${variable}}}`}
                    </span>
                    <input
                      type="text"
                      value={variableValues[variable]}
                      onChange={(e) => setVariableValues(prev => ({ ...prev, [variable]: e.target.value }))}
                      placeholder={`قيمة ${variable}`}
                      className={`flex-1 text-sm rounded-lg py-2 px-3 ${isDark ? 'bg-slate-900/60 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'} border`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleApplyTemplate}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all"
                >
                  إدراج في الرسالة
                </button>
                <button
                  onClick={() => { setFillingTemplate(null); setVariableValues({}); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Message Input */}
          <form onSubmit={handleSend} className={`pt-4 flex gap-2 ${isDark ? 'border-t border-slate-700/50' : 'border-t border-slate-200/60'}`}>
            {/* Template Picker */}
            <div className="relative" ref={templatePickerRef}>
              <button
                type="button"
                onClick={() => {
                  if (!showTemplatePicker) fetchTemplates();
                  setShowTemplatePicker(!showTemplatePicker);
                }}
                className={`p-3 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-slate-700/60 text-slate-400 hover:text-teal-400' : 'hover:bg-teal-50 text-slate-400 hover:text-teal-600'}`}
                title="القوالب"
              >
                <FileText className="w-5 h-5" />
              </button>

              {/* Template Picker Dropdown */}
              {showTemplatePicker && (
                <div className={`absolute bottom-full right-0 mb-2 w-80 max-h-72 overflow-hidden rounded-xl shadow-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className={`p-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <input
                      type="text"
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="ابحث في القوالب..."
                      className={`w-full text-sm rounded-lg py-2 px-3 ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'} border`}
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-48">
                    {filteredTemplates.length === 0 ? (
                      <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {templates.length === 0 ? 'لا توجد قوالب بعد' : 'لا توجد نتائج'}
                      </div>
                    ) : (
                      filteredTemplates.map(template => {
                        const content = template.content?.text || template.content || '';
                        const variables = template.content?.variables || [];
                        return (
                          <button
                            key={template._id}
                            onClick={() => handleSelectTemplate(template)}
                            className={`w-full text-right p-3 transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{template.name}</span>
                              {variables.length > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-teal-500/15 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                                  {variables.length} متغير
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {content.substring(0, 60)}{content.length > 60 ? '...' : ''}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="اكتب رسالتك..."
              className={`flex-1 rounded-xl py-3 px-4 ${isDark ? 'bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500' : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'} focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all`}
            />
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" /> إرسال
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <h3 className={`font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><MessageSquare className="w-4 h-4" /> معلومات المحادثة</h3>
            <div className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <p>القناة: {channelLabel(conversation.channel)}</p>
              <p>الأولوية: {conversation.priority || 'عادية'}</p>
              <p>آخر رسالة: {conversation.lastMessage?.content || '—'}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>ملاحظات</h3>
            <div className="space-y-2 mb-3">
              {(conversation.notes || []).length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>لا توجد ملاحظات بعد</p>
              ) : (
                conversation.notes.map((note, idx) => (
                  <div key={idx} className={`flex items-start gap-2 p-2 rounded-lg ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                    <p className={`flex-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{note.content}</p>
                    <button onClick={() => handleDeleteNote(idx)} className="text-rose-400 hover:text-rose-500 flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="أضف ملاحظة..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNote(); } }}
                className={`flex-1 rounded-lg py-2 px-3 text-sm ${isDark ? 'bg-slate-800/60 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'} border`}
              />
              <button onClick={handleAddNote} className="btn-primary p-2" disabled={!noteText.trim()}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CSAT Rating */}
          <div className="glass rounded-2xl p-4">
            <h3 className={`font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Star className="w-4 h-4" /> تقييم رضا العميل</h3>
            {conversation.csat?.score ? (
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-8 h-8 ${s <= conversation.csat.score ? 'text-amber-400 fill-amber-400' : isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>التقييم: {conversation.csat.score}/5</p>
                {conversation.csat.comment && <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{conversation.csat.comment}</p>}
                {conversation.csat.ratedAt && <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{new Date(conversation.csat.ratedAt).toLocaleDateString('ar-EG')}</p>}
              </div>
            ) : (
              <div>
                <div className="flex justify-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => handleCSAT(s)}
                      className={`p-1 rounded-lg transition-all ${csatHover === s ? 'scale-110' : ''} ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`}
                      onMouseEnter={() => setCsatHover(s)} onMouseLeave={() => setCsatHover(0)}>
                      <Star className={`w-8 h-8 transition-colors ${(csatHover || 0) >= s ? 'text-amber-400 fill-amber-400' : isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <p className={`text-center text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>اضغط على النجوم للتقييم</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;