import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, Mail, Building2, Tag, MoreVertical, X, UserPlus, Merge } from 'lucide-react';
import { contactsAPI } from '../api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const sourceMap = {
  whatsapp: { label: 'واتساب', color: 'bg-green-500' },
  telegram: { label: 'تيليجرام', color: 'bg-blue-500' },
  messenger: { label: 'ماسنجر', color: 'bg-sky-500' },
  instagram: { label: 'انستجرام', color: 'bg-pink-500' },
  email: { label: 'بريد إلكتروني', color: 'bg-yellow-500' },
  livechat: { label: 'دردشة مباشرة', color: 'bg-teal-500' },
  web: { label: 'موقع ويب', color: 'bg-purple-500' },
  manual: { label: 'يدوي', color: 'bg-gray-500' }
};

export default function Contacts() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [showMerge, setShowMerge] = useState(false);
  const [mergePrimary, setMergePrimary] = useState('');
  const [mergeSecondary, setMergeSecondary] = useState('');
  const [form, setForm] = useState({
    name: '', email: [''], phone: [''], company: '', title: '', notes: '', tags: '', source: 'manual'
  });

  useEffect(() => { fetchContacts(); }, [page, search]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data } = await contactsAPI.getAll({ page, limit: 20, search });
      setContacts(data.data?.contacts || []);
      setTotalPages(data.data?.totalPages || 1);
    } catch (err) {
      toast.error('فشل في جلب جهات الاتصال');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        email: form.email.filter(e => e.trim()),
        phone: form.phone.filter(p => p.trim()),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (editContact) {
        await contactsAPI.update(editContact._id, payload);
        toast.success('تم تحديث جهة الاتصال');
      } else {
        await contactsAPI.create(payload);
        toast.success('تم إنشاء جهة الاتصال');
      }
      setShowModal(false);
      resetForm();
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل في حفظ جهة الاتصال');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف جهة الاتصال؟')) return;
    try {
      await contactsAPI.delete(id);
      toast.success('تم حذف جهة الاتصال');
      fetchContacts();
    } catch (err) { toast.error('فشل في حذف جهة الاتصال'); }
  };

  const handleMerge = async () => {
    if (!mergePrimary || !mergeSecondary) return toast.error('يرجى اختيار جهتي اتصال');
    try {
      await contactsAPI.merge(mergePrimary, mergeSecondary);
      toast.success('تم دمج جهات الاتصال بنجاح');
      setShowMerge(false);
      fetchContacts();
    } catch (err) { toast.error('فشل في دمج جهات الاتصال'); }
  };

  const resetForm = () => {
    setForm({ name: '', email: [''], phone: [''], company: '', title: '', notes: '', tags: '', source: 'manual' });
    setEditContact(null);
  };

  const openEdit = (contact) => {
    setEditContact(contact);
    setForm({
      name: contact.name || '',
      email: contact.email?.length ? contact.email : [''],
      phone: contact.phone?.length ? contact.phone : [''],
      company: contact.company || '',
      title: contact.title || '',
      notes: contact.notes || '',
      tags: (contact.tags || []).join(', '),
      source: contact.source || 'manual'
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>جهات الاتصال</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إدارة جهات الاتصال والعملاء</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowMerge(true); }} className={`px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <Merge className="w-4 h-4 inline ml-1" /> دمج
          </button>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25 hover:shadow-lg">
            <Plus className="w-4 h-4 inline ml-1" /> إضافة جهة اتصال
          </button>
        </div>
      </div>

      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-4`}>
        <div className="relative">
          <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
          <input type="text" placeholder="بحث في جهات الاتصال..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className={`w-full pr-10 pl-4 py-3 rounded-xl ${isDark ? 'bg-slate-900/50 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} border focus:outline-none focus:border-teal-500`} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div></div>
      ) : contacts.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">لا توجد جهات اتصال بعد</p>
          <p className="text-sm mt-1">أضف جهة اتصال جديدة لبدء إدارة عملائك</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {contacts.map(contact => (
            <div key={contact._id} className={`${isDark ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600' : 'bg-white border-gray-200 hover:border-teal-300'} border rounded-xl p-4 transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${isDark ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-gradient-to-br from-teal-400 to-emerald-500'}`}>
                    {contact.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>{contact.name}</h3>
                      {contact.source && sourceMap[contact.source] && (
                        <span className={`px-2 py-0.5 text-[10px] rounded-md text-white ${sourceMap[contact.source].color}`}>{sourceMap[contact.source].label}</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-3 mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {contact.email?.[0] && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email[0]}</span>}
                      {contact.phone?.[0] && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone[0]}</span>}
                      {contact.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{contact.company}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {contact.tags?.map((tag, i) => (
                    <span key={i} className={`px-2 py-0.5 text-[10px] rounded-md ${isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                      <Tag className="w-2.5 h-2.5 inline ml-0.5" />{tag}
                    </span>
                  ))}
                  <div className="relative group">
                    <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <div className={`absolute left-0 top-full mt-1 w-36 rounded-xl shadow-lg border z-10 hidden group-hover:block ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                      <button onClick={() => openEdit(contact)} className={`w-full px-3 py-2 text-sm text-right ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-700'}`}>تعديل</button>
                      <button onClick={() => handleDelete(contact._id)} className="w-full px-3 py-2 text-sm text-right text-red-500 hover:bg-red-50">حذف</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-slate-800 text-slate-300 disabled:opacity-50' : 'bg-gray-100 text-gray-700 disabled:opacity-50'}`}>السابق</button>
          <span className={`px-3 py-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-slate-800 text-slate-300 disabled:opacity-50' : 'bg-gray-100 text-gray-700 disabled:opacity-50'}`}>التالي</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-inherit">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{editContact ? 'تعديل جهة اتصال' : 'إضافة جهة اتصال'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>الاسم *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:border-teal-500`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>البريد الإلكتروني</label>
                {form.email.map((e, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="email" value={e} onChange={ev => { const arr = [...form.email]; arr[i] = ev.target.value; setForm({...form, email: arr}); }}
                      placeholder="email@example.com" className={`flex-1 px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
                    {form.email.length > 1 && <button type="button" onClick={() => setForm({...form, email: form.email.filter((_, j) => j !== i)})} className="text-red-500"><X className="w-5 h-5" /></button>}
                  </div>
                ))}
                <button type="button" onClick={() => setForm({...form, email: [...form.email, '']})} className="text-teal-500 text-sm">+ إضافة بريد</button>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>رقم الهاتف</label>
                {form.phone.map((p, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="tel" value={p} onChange={ev => { const arr = [...form.phone]; arr[i] = ev.target.value; setForm({...form, phone: arr}); }}
                      placeholder="+201xxxxxxxxx" className={`flex-1 px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
                    {form.phone.length > 1 && <button type="button" onClick={() => setForm({...form, phone: form.phone.filter((_, j) => j !== i)})} className="text-red-500"><X className="w-5 h-5" /></button>}
                  </div>
                ))}
                <button type="button" onClick={() => setForm({...form, phone: [...form.phone, '']})} className="text-teal-500 text-sm">+ إضافة رقم</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>الشركة</label>
                  <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                    className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>المسمى الوظيفي</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>الوسوم (مفصولة بفاصلة)</label>
                <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="عميل VIP, تجديد"
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>ملاحظات</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3}
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500 resize-none`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md">
                  {editContact ? 'تحديث' : 'إنشاء'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className={`px-4 py-2.5 rounded-xl font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {showMerge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMerge(false)}>
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-md p-6`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>دمج جهات الاتصال</h2>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>سيتم دمج البيانات من جهة الاتصال الثانوية في جهة الاتصال الرئيسية</p>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>جهة الاتصال الرئيسية</label>
                <select value={mergePrimary} onChange={e => setMergePrimary(e.target.value)} className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}>
                  <option value="">اختر...</option>
                  {contacts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>جهة الاتصال الثانوية</label>
                <select value={mergeSecondary} onChange={e => setMergeSecondary(e.target.value)} className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}>
                  <option value="">اختر...</option>
                  {contacts.filter(c => c._id !== mergePrimary).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleMerge} disabled={!mergePrimary || !mergeSecondary} className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md disabled:opacity-50">دمج</button>
              <button onClick={() => setShowMerge(false)} className={`px-4 py-2.5 rounded-xl font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}