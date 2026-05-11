import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useTheme } from '../../context/ThemeContext';

const AdminInvoices = () => {
  const theme = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', method: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/invoices');
      setInvoices(res.data.invoices || getMockInvoices());
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setInvoices(getMockInvoices());
    } finally {
      setLoading(false);
    }
  };

  const getMockInvoices = () => [
    { id: 'INV-001', user: 'أحمد محمد', email: 'ahmed@example.com', plan: 'الاحترافية', amount: 4000, status: 'paid', method: 'fawry', date: '2026-04-05', dueDate: '2026-04-05' },
    { id: 'INV-002', user: 'سارة أحمد', email: 'sara@example.com', plan: 'الأساسية', amount: 2000, status: 'paid', method: 'paymob', date: '2026-04-03', dueDate: '2026-04-03' },
    { id: 'INV-003', user: 'محمد علي', email: 'mohamed@example.com', plan: 'المؤسسات', amount: 24000, status: 'paid', method: 'bank', date: '2026-04-01', dueDate: '2026-04-01' },
    { id: 'INV-004', user: 'فاطمة حسن', email: 'fatma@example.com', plan: 'الأساسية', amount: 2000, status: 'pending', method: 'paymob', date: '2026-04-04', dueDate: '2026-04-06' },
    { id: 'INV-005', user: 'خالد عمر', email: 'khaled@example.com', plan: 'الاحترافية', amount: 4000, status: 'overdue', method: 'fawry', date: '2026-03-20', dueDate: '2026-03-25' },
    { id: 'INV-006', user: 'Mostafa Rawash', email: 'mostafa@rawash.com', plan: 'المؤسسات', amount: 8000, status: 'paid', method: 'paymob', date: '2026-04-05', dueDate: '2026-04-05' },
  ];

  const filteredInvoices = invoices.filter(inv => {
    if (filter.status && inv.status !== filter.status) return false;
    if (filter.method && inv.method !== filter.method) return false;
    if (filter.search) {
      const search = filter.search.toLowerCase();
      return inv.id.toLowerCase().includes(search) ||
             inv.user.toLowerCase().includes(search) ||
             inv.email.toLowerCase().includes(search);
    }
    return true;
  });

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  const statusColors = {
    paid: theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-400',
    pending: theme === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-500/20 text-yellow-400',
    overdue: theme === 'light' ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400',
    cancelled: theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-gray-500/20 text-gray-400'
  };

  const statusNames = {
    paid: 'مدفوعة',
    pending: 'معلقة',
    overdue: 'متأخرة',
    cancelled: 'ملغية'
  };

  const methodNames = {
    paymob: 'Paymob',
    fawry: 'فوري',
    bank: 'تحويل بنكي',
    visa: 'فيزا',
    wallet: 'محفظة'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة الفواتير</h1>
          <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>عرض وإدارة الفواتير والمدفوعات</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            تصدير
          </button>
          <button onClick={() => setShowModal(true)} className="btn-gradient px-4 py-2 rounded-lg flex items-center gap-2" aria-label="فاتورة جديدة">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            فاتورة جديدة
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>إجمالي المحصل</p>
          <p className="text-2xl font-bold text-green-400">{totalRevenue.toLocaleString()} ج.م</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>معلق</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingAmount.toLocaleString()} ج.م</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>متأخر</p>
          <p className="text-2xl font-bold text-red-400">{overdueAmount.toLocaleString()} ج.م</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>عدد الفواتير</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="بحث..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className={`${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-600'} border rounded-lg px-3 py-2`}
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className={`${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-600'} border rounded-lg px-3 py-2`}
          >
            <option value="">كل الحالات</option>
            <option value="paid">مدفوعة</option>
            <option value="pending">معلقة</option>
            <option value="overdue">متأخرة</option>
          </select>
          <select
            value={filter.method}
            onChange={(e) => setFilter({ ...filter, method: e.target.value })}
            className={`${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-600'} border rounded-lg px-3 py-2`}
          >
            <option value="">كل الطرق</option>
            {Object.entries(methodNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <button
            onClick={() => setFilter({ status: '', method: '', search: '' })}
            className={`text-sm ${theme === 'light' ? 'text-slate-500 hover:text-slate-700' : 'text-gray-400 hover:text-white'}`}
          >
            مسح الفلاتر
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className={theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}>
            <tr>
              <th className="px-4 py-3 text-right text-sm font-semibold">رقم الفاتورة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">العميل</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">الخطة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">المبلغ</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">طريقة الدفع</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">التاريخ</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-slate-700'}`}>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className={theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'}>
                <td className="px-4 py-3 font-mono text-primary-400">{invoice.id}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{invoice.user}</p>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>{invoice.email}</p>
                </td>
                <td className="px-4 py-3 text-sm">{invoice.plan}</td>
                <td className="px-4 py-3 font-semibold">{invoice.amount.toLocaleString()} ج.م</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[invoice.status]}`}>
                    {statusNames[invoice.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{methodNames[invoice.method]}</td>
                <td className={`px-4 py-3 text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>{invoice.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setSelectedInvoice(invoice)} className={`p-2 rounded ${theme === 'light' ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} aria-label="عرض الفاتورة">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button onClick={() => window.print()} className={`p-2 rounded ${theme === 'light' ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} aria-label="طباعة الفاتورة">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" onClick={() => setSelectedInvoice(null)}>
          <div className={`rounded-2xl w-full max-w-md p-6 ${theme === 'light' ? 'bg-white' : 'bg-dark-800'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>تفاصيل الفاتورة</h2>
              <button onClick={() => setSelectedInvoice(null)} className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-dark-700'}`} aria-label="إغلاق">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><span className={theme === 'light' ? 'text-slate-500' : 'text-gray-400'}>رقم الفاتورة</span><span className="font-mono font-semibold">{selectedInvoice.id}</span></div>
              <div className="flex justify-between"><span className={theme === 'light' ? 'text-slate-500' : 'text-gray-400'}>العميل</span><span className="font-semibold">{selectedInvoice.user}</span></div>
              <div className="flex justify-between"><span className={theme === 'light' ? 'text-slate-500' : 'text-gray-400'}>البريد</span><span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>{selectedInvoice.email}</span></div>
              <div className="flex justify-between"><span className={theme === 'light' ? 'text-slate-500' : 'text-gray-400'}>الخطة</span><span>{selectedInvoice.plan}</span></div>
              <div className="flex justify-between"><span className={theme === 'light' ? 'text-slate-500' : 'text-gray-400'}>المبلغ</span><span className="font-bold">{selectedInvoice.amount.toLocaleString()} ج.م</span></div>
              <div className="flex justify-between"><span className={theme === 'light' ? 'text-slate-500' : 'text-gray-400'}>الحالة</span><span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[selectedInvoice.status]}`}>{statusNames[selectedInvoice.status]}</span></div>
              <div className="flex justify-between"><span className={theme === 'light' ? 'text-slate-500' : 'text-gray-400'}>طريقة الدفع</span><span>{methodNames[selectedInvoice.method]}</span></div>
              <div className="flex justify-between"><span className={theme === 'light' ? 'text-slate-500' : 'text-gray-400'}>التاريخ</span><span>{selectedInvoice.date}</span></div>
            </div>
            <div className={`mt-6 pt-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-dark-600'} flex gap-3`}>
              <button onClick={() => window.print()} className="btn-primary px-4 py-2 rounded-lg flex-1">طباعة</button>
              <button onClick={() => setSelectedInvoice(null)} className={`px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-dark-700 hover:bg-dark-600'}`}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;