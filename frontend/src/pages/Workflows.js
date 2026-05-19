import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, Power, Trash2, Edit3, X, Zap, ArrowRight } from 'lucide-react';
import { workflowsAPI } from '../api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const triggerOptions = [
  { value: 'conversation_created', label: 'محادثة جديدة', icon: '💬' },
  { value: 'status_change', label: 'تغيير الحالة', icon: '🔄' },
  { value: 'priority_change', label: 'تغيير الأولوية', icon: '⚡' },
  { value: 'keyword_match', label: 'مطابقة كلمة مفتاحية', icon: '🔑' },
  { value: 'no_reply', label: 'عدم الرد', icon: '⏰' },
  { value: 'department_change', label: 'تغيير القسم', icon: '🏢' },
  { value: 'csat_received', label: 'تقييم مستوى الخدمة', icon: '⭐' }
];

const actionOptions = [
  { value: 'change_status', label: 'تغيير الحالة', configFields: ['status'] },
  { value: 'change_priority', label: 'تغيير الأولوية', configFields: ['priority'] },
  { value: 'assign_agent', label: 'تعيين وكيل', configFields: ['agentId'] },
  { value: 'assign_department', label: 'تعيين قسم', configFields: ['departmentId'] },
  { value: 'add_tag', label: 'إضافة وسم', configFields: ['tags'] },
  { value: 'remove_tag', label: 'إزالة وسم', configFields: ['tags'] },
  { value: 'send_message', label: 'إرسال رسالة', configFields: ['message'] },
  { value: 'notify', label: 'إرسال إشعار', configFields: ['message'] }
];

const defaultForm = {
  name: '', description: '',
  trigger: { type: 'conversation_created', conditions: [] },
  actions: [{ type: 'change_status', config: { status: 'active' } }],
  isActive: true
};

export default function Workflows() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editWf, setEditWf] = useState(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { fetchWorkflows(); }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const { data } = await workflowsAPI.getAll();
      setWorkflows(data.data?.workflows || []);
    } catch (err) {
      toast.error('فشل في جلب مسارات العمل');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editWf) {
        await workflowsAPI.update(editWf._id, form);
        toast.success('تم تحديث مسار العمل');
      } else {
        await workflowsAPI.create(form);
        toast.success('تم إنشاء مسار العمل');
      }
      setShowModal(false);
      setForm(defaultForm);
      setEditWf(null);
      fetchWorkflows();
    } catch (err) { toast.error(err.response?.data?.error || 'فشل في حفظ مسار العمل'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف مسار العمل؟')) return;
    try {
      await workflowsAPI.delete(id);
      toast.success('تم حذف مسار العمل');
      fetchWorkflows();
    } catch (err) { toast.error('فشل في حذف مسار العمل'); }
  };

  const handleToggle = async (id) => {
    try {
      await workflowsAPI.toggle(id);
      fetchWorkflows();
    } catch (err) { toast.error('فشل في تبديل حالة مسار العمل'); }
  };

  const openEdit = (wf) => {
    setEditWf(wf);
    setForm({
      name: wf.name, description: wf.description || '',
      trigger: wf.trigger || defaultForm.trigger,
      actions: wf.actions || defaultForm.actions,
      isActive: wf.isActive
    });
    setShowModal(true);
  };

  const updateAction = (index, field, value) => {
    const actions = [...form.actions];
    actions[index] = { ...actions[index], [field]: value };
    if (field === 'type') actions[index].config = {};
    setForm({...form, actions});
  };

  const addAction = () => setForm({...form, actions: [...form.actions, { type: 'change_status', config: {} }]});
  const removeAction = (index) => setForm({...form, actions: form.actions.filter((_, i) => i !== index)});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>مسارات العمل</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>أتمتة المهام والإجراءات بناءً على الأحداث</p>
        </div>
        <button onClick={() => { setForm(defaultForm); setEditWf(null); setShowModal(true); }}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25 hover:shadow-lg">
          <Plus className="w-4 h-4 inline ml-1" /> إنشاء مسار عمل
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div></div>
      ) : workflows.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">لا توجد مسارات عمل بعد</p>
          <p className="text-sm mt-1">أنشئ مسار عمل لأتمتة المهام المتكررة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map(wf => (
            <div key={wf._id} className={`${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border rounded-xl p-4 transition-all duration-200 ${!wf.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${wf.isActive ? 'bg-gradient-to-br from-teal-400 to-emerald-600' : isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <Zap className={`w-5 h-5 ${wf.isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{wf.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-[10px] rounded-md ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                        {triggerOptions.find(t => t.value === wf.trigger?.type)?.icon} {triggerOptions.find(t => t.value === wf.trigger?.type)?.label || wf.trigger?.type}
                      </span>
                      <ArrowRight className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                      <span className={`px-2 py-0.5 text-[10px] rounded-md ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                        {wf.actions?.length || 0} إجراء
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${wf.isActive ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500')}`}>
                    {wf.isActive ? 'نشط' : 'معطل'}
                  </span>
                  <button onClick={() => handleToggle(wf._id)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}>
                    <Power className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(wf)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}>
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(wf._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {wf.description && <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{wf.description}</p>}
              {wf.executionCount > 0 && (
                <div className={`mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  تم التنفيذ {wf.executionCount} مرة {wf.lastExecutedAt && `• آخر تنفيذ: ${new Date(wf.lastExecutedAt).toLocaleDateString('ar-EG')}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-inherit">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{editWf ? 'تعديل مسار العمل' : 'إنشاء مسار عمل جديد'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>اسم مسار العمل *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="مثال: تعيين المحادثات الجديدة تلقائياً"
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>الوصف</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} placeholder="وصف ما يفعله مسار العمل هذا"
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500 resize-none`} />
              </div>

              {/* Trigger */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>المُحفّز (عندما...)</label>
                <div className="grid grid-cols-2 gap-2">
                  {triggerOptions.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm({...form, trigger: {...form.trigger, type: opt.value, conditions: []}})}
                      className={`p-2.5 rounded-xl border text-right ${form.trigger.type === opt.value ? 'border-teal-500 bg-teal-500/10' : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'}`}>
                      <span className="text-base">{opt.icon}</span>
                      <div className={`text-sm font-medium mt-1 ${form.trigger.type === opt.value ? 'text-teal-500' : isDark ? 'text-white' : 'text-gray-900'}`}>{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>الإجراءات</label>
                  <button type="button" onClick={addAction} className="text-teal-500 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة إجراء</button>
                </div>
                <div className="space-y-3">
                  {form.actions.map((action, index) => (
                    <div key={index} className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3`}>
                      <div className="flex items-center gap-2 mb-2">
                        <select value={action.type} onChange={e => updateAction(index, 'type', e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-200'}`}>
                          {actionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        {form.actions.length > 1 && (
                          <button type="button" onClick={() => removeAction(index)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                      {/* Action config fields */}
                      {action.type === 'change_status' && (
                        <select value={action.config?.status || ''} onChange={e => updateAction(index, 'config', {...action.config, status: e.target.value})}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-200'}`}>
                          <option value="active">نشطة</option><option value="pending">معلقة</option><option value="resolved">تم الحل</option><option value="closed">مغلقة</option>
                        </select>
                      )}
                      {action.type === 'change_priority' && (
                        <select value={action.config?.priority || ''} onChange={e => updateAction(index, 'config', {...action.config, priority: e.target.value})}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-200'}`}>
                          <option value="low">منخفضة</option><option value="normal">عادية</option><option value="high">عالية</option><option value="urgent">عاجلة</option>
                        </select>
                      )}
                      {(action.type === 'send_message' || action.type === 'notify') && (
                        <textarea value={action.config?.message || ''} onChange={e => updateAction(index, 'config', {...action.config, message: e.target.value})} rows={2} placeholder="نص الرسالة"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-200'} resize-none`} />
                      )}
                      {action.type === 'add_tag' && (
                        <input type="text" value={(action.config?.tags || []).join(', ')} onChange={e => updateAction(index, 'config', {...action.config, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                          placeholder="الوسوم مفصولة بفاصلة" className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md">
                  {editWf ? 'تحديث' : 'إنشاء'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditWf(null); }} className={`px-4 py-2.5 rounded-xl font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}