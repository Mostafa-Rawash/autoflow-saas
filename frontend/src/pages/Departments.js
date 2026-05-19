import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, Trash2, Edit3, UserCheck, X, ChevronDown } from 'lucide-react';
import { departmentsAPI } from '../api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const channelMap = {
  whatsapp: { label: 'واتساب', color: 'bg-green-500' },
  telegram: { label: 'تيليجرام', color: 'bg-blue-500' },
  messenger: { label: 'ماسنجر', color: 'bg-sky-500' },
  instagram: { label: 'انستجرام', color: 'bg-pink-500' },
  email: { label: 'بريد إلكتروني', color: 'bg-yellow-500' },
  livechat: { label: 'دردشة مباشرة', color: 'bg-teal-500' }
};

const assignmentModes = [
  { value: 'manual', label: 'يدوي', desc: 'تعيين يدوي من المدير' },
  { value: 'round-robin', label: 'دوري', desc: 'توزيع متساوٍ بين الوكلاء' },
  { value: 'least-busy', label: 'الأقل انشغالاً', desc: 'تعيين للوكيل الأقل محادثات نشطة' },
  { value: 'skill-based', label: 'بناءً على المهارة', desc: 'تعيين حسب القناة وال مهارة' }
];

const defaultForm = {
  name: '', description: '', icon: 'users', color: '#14b8a6',
  channels: ['whatsapp', 'telegram'], assignmentMode: 'round-robin',
  workSchedule: {
    timezone: 'Africa/Cairo',
    workingDays: [0, 1, 2, 3, 4],
    workingHours: { start: '09:00', end: '17:00' },
    outsideHoursAction: 'auto-reply',
    outsideHoursMessage: 'نعتذر، نحن خارج ساعات العمل حالياً.'
  }
};

export default function Departments() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data } = await departmentsAPI.getAll();
      setDepartments(data.data?.departments || []);
    } catch (err) {
      toast.error('فشل في جلب الأقسام');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editDept) {
        await departmentsAPI.update(editDept._id, form);
        toast.success('تم تحديث القسم');
      } else {
        await departmentsAPI.create(form);
        toast.success('تم إنشاء القسم');
      }
      setShowModal(false);
      setForm(defaultForm);
      setEditDept(null);
      fetchDepartments();
    } catch (err) { toast.error(err.response?.data?.error || 'فشل في حفظ القسم'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف القسم؟')) return;
    try {
      await departmentsAPI.delete(id);
      toast.success('تم حذف القسم');
      fetchDepartments();
    } catch (err) { toast.error('فشل في حذف القسم'); }
  };

  const openEdit = (dept) => {
    setEditDept(dept);
    setForm({
      name: dept.name, description: dept.description, icon: dept.icon, color: dept.color,
      channels: dept.channels || [], assignmentMode: dept.assignmentMode,
      workSchedule: dept.workSchedule || defaultForm.workSchedule
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>الأقسام</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إدارة أقسام الدعم وتوزيع المحادثات</p>
        </div>
        <button onClick={() => { setForm(defaultForm); setEditDept(null); setShowModal(true); }}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25 hover:shadow-lg">
          <Plus className="w-4 h-4 inline ml-1" /> إضافة قسم
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div></div>
      ) : departments.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">لا توجد أقسام بعد</p>
          <p className="text-sm mt-1">أنشئ قسماً لتنظيم فريق الدعم وتوزيع المحادثات</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map(dept => (
            <div key={dept._id} className={`${isDark ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600' : 'bg-white border-gray-200 hover:border-teal-300'} border rounded-2xl p-5 transition-all duration-200`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: dept.color || '#14b8a6' }}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dept.name}</h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{dept.description || 'بدون وصف'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(dept._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>نوع التوزيع:</span>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    {assignmentModes.find(m => m.value === dept.assignmentMode)?.label || dept.assignmentMode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>القنوات:</span>
                  <div className="flex gap-1 flex-wrap">
                    {(dept.channels || []).map(ch => (
                      <span key={ch} className={`px-1.5 py-0.5 text-[10px] rounded text-white ${channelMap[ch]?.color || 'bg-gray-500'}`}>{channelMap[ch]?.label || ch}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>الوكلاء:</span>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{dept.agents?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-inherit">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{editDept ? 'تعديل القسم' : 'إنشاء قسم جديد'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>اسم القسم *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>الوصف</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500 resize-none`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>اللون</label>
                <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-10 h-10 rounded cursor-pointer" />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>نوع التوزيع</label>
                <div className="grid grid-cols-2 gap-2">
                  {assignmentModes.map(mode => (
                    <button key={mode.value} type="button" onClick={() => setForm({...form, assignmentMode: mode.value})}
                      className={`p-2 rounded-xl border text-right ${form.assignmentMode === mode.value ? 'border-teal-500 bg-teal-500/10' : isDark ? 'border-slate-600' : 'border-gray-200'}`}>
                      <div className={`text-sm font-medium ${form.assignmentMode === mode.value ? 'text-teal-500' : isDark ? 'text-white' : 'text-gray-900'}`}>{mode.label}</div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>القنوات</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(channelMap).map(([key, val]) => (
                    <button key={key} type="button" onClick={() => {
                      const channels = form.channels.includes(key) ? form.channels.filter(c => c !== key) : [...form.channels, key];
                      setForm({...form, channels});
                    }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.channels.includes(key) ? `${val.color} text-white` : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>بداية العمل</label>
                  <input type="time" value={form.workSchedule?.workingHours?.start || '09:00'} onChange={e => setForm({...form, workSchedule: {...form.workSchedule, workingHours: {...form.workSchedule.workingHours, start: e.target.value}}})}
                    className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>نهاية العمل</label>
                  <input type="time" value={form.workSchedule?.workingHours?.end || '17:00'} onChange={e => setForm({...form, workSchedule: {...form.workSchedule, workingHours: {...form.workSchedule.workingHours, end: e.target.value}}})}
                    className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md">
                  {editDept ? 'تحديث' : 'إنشاء'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditDept(null); }} className={`px-4 py-2.5 rounded-xl font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}