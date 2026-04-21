import React, { useState, useEffect } from 'react';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [filter, setFilter] = useState({ status: '', plan: '' });

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    key: '',
    price: '',
    priceUsd: '',
    channels: 1,
    conversations: 500,
    users: 1,
    features: [],
    isPopular: false,
    status: 'active'
  });

  const allFeatures = [
    { key: 'whatsapp', name: 'واتس آب', icon: '📱' },
    { key: 'auto_replies', name: 'ردود تلقائية', icon: '⚡' },
    { key: 'templates', name: 'قوالب رسائل', icon: '📝' },
    { key: 'analytics', name: 'تحليلات', icon: '📊' },
    { key: 'team', name: 'فريق', icon: '👥' },
    { key: 'api', name: 'API', icon: '🔗' },
    { key: 'integrations', name: 'تكاملات', icon: '🔌' },
    { key: 'broadcast', name: 'رسائل جماعية', icon: '📨' },
    { key: 'ai', name: 'ذكاء اصطناعي', icon: '🤖' },
    { key: 'support', name: 'دعم فني', icon: '🎧' },
    { key: 'custom_branding', name: 'تخصيص العلامة', icon: '🎨' }
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, [filter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/subscriptions');
      setSubscriptions(res.data.subscriptions || getMockData());
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setSubscriptions(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    plans: [
      { id: 1, name: 'الأساسية', nameEn: 'Basic', key: 'basic', price: 2000, priceUsd: 40, channels: 1, conversations: 500, users: 1, features: ['whatsapp', 'auto_replies', 'templates'], isPopular: false, status: 'active', subscribers: 45 },
      { id: 2, name: 'الاحترافية', nameEn: 'Professional', key: 'professional', price: 4000, priceUsd: 80, channels: 3, conversations: 2000, users: 5, features: ['whatsapp', 'auto_replies', 'templates', 'analytics', 'team', 'ai'], isPopular: true, status: 'active', subscribers: 28 },
      { id: 3, name: 'المؤسسات', nameEn: 'Enterprise', key: 'enterprise', price: 8000, priceUsd: 160, channels: 8, conversations: -1, users: -1, features: ['whatsapp', 'auto_replies', 'templates', 'analytics', 'team', 'api', 'integrations', 'broadcast', 'ai', 'support', 'custom_branding'], isPopular: false, status: 'active', subscribers: 12 }
    ],
    activeSubscriptions: [
      { id: 1, user: 'أحمد محمد', email: 'ahmed@example.com', plan: 'professional', status: 'active', startDate: '2026-03-01', endDate: '2026-04-01', amount: 4000 },
      { id: 2, user: 'سارة أحمد', email: 'sara@example.com', plan: 'basic', status: 'active', startDate: '2026-03-15', endDate: '2026-04-15', amount: 2000 },
      { id: 3, user: 'محمد علي', email: 'mohamed@example.com', plan: 'enterprise', status: 'active', startDate: '2026-02-01', endDate: '2026-05-01', amount: 24000 },
      { id: 4, user: 'فاطمة حسن', email: 'fatma@example.com', plan: 'basic', status: 'expired', startDate: '2026-01-15', endDate: '2026-02-15', amount: 2000 },
    ],
    revenue: { total: 34000, thisMonth: 18000, lastMonth: 16000 }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.put(`/admin/subscriptions/plans/${editingPlan.id}`, formData);
      } else {
        await api.post('/admin/subscriptions/plans', formData);
      }
      setShowModal(false);
      fetchSubscriptions();
      resetForm();
    } catch (err) {
      console.error('Error saving plan:', err);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      nameEn: plan.nameEn,
      key: plan.key,
      price: plan.price,
      priceUsd: plan.priceUsd,
      channels: plan.channels,
      conversations: plan.conversations,
      users: plan.users,
      features: plan.features || [],
      isPopular: plan.isPopular,
      status: plan.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', nameEn: '', key: '', price: '', priceUsd: '', channels: 1,
      conversations: 500, users: 1, features: [], isPopular: false, status: 'active'
    });
    setEditingPlan(null);
  };

  const toggleFeature = (featureKey) => {
    if (formData.features.includes(featureKey)) {
      setFormData({ ...formData, features: formData.features.filter(f => f !== featureKey) });
    } else {
      setFormData({ ...formData, features: [...formData.features, featureKey] });
    }
  };

  const data = getMockData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة الاشتراكات</h1>
          <p className="text-gray-400 text-sm mt-1">الخطط والمشتركين والإيرادات</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-gradient px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          خطة جديدة
        </button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
          <p className="text-2xl font-bold">{data.revenue.total.toLocaleString()} ج.م</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">هذا الشهر</p>
          <p className="text-2xl font-bold text-green-400">{data.revenue.thisMonth.toLocaleString()} ج.م</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">المشتركين النشطين</p>
          <p className="text-2xl font-bold text-primary-400">
            {data.activeSubscriptions.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">معدل التجديد</p>
          <p className="text-2xl font-bold">87%</p>
        </div>
      </div>

      {/* Plans */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">خطط الاشتراك</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {data.plans.map(plan => (
            <div
              key={plan.id}
              className={`relative bg-dark-800 rounded-xl p-6 ${plan.isPopular ? 'ring-2 ring-primary-500' : ''}`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-500 text-white text-xs rounded-full">
                  الأكثر مبيعاً
                </span>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-xs text-gray-500">{plan.nameEn}</p>
                </div>
                <button
                  onClick={() => handleEdit(plan)}
                  className="p-2 hover:bg-dark-700 rounded text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-3xl font-black">{plan.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">جنيه/شهر</p>
                <p className="text-xs text-gray-600">${plan.priceUsd}/mo</p>
              </div>
              
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span>
                  {plan.channels} قنوات
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span>
                  {plan.conversations === -1 ? 'محادثات غير محدودة' : `${plan.conversations} محادثة/شهر`}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span>
                  {plan.users === -1 ? 'فريق غير محدود' : `${plan.users} مستخدم`}
                </li>
              </ul>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {plan.features.slice(0, 4).map(f => (
                  <span key={f} className="text-xs px-2 py-0.5 rounded bg-dark-700">
                    {allFeatures.find(af => af.key === f)?.name}
                  </span>
                ))}
                {plan.features.length > 4 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-dark-700">
                    +{plan.features.length - 4}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{plan.subscribers} مشترك</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  plan.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {plan.status === 'active' ? 'نشط' : 'معطل'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-dark-700">
          <h2 className="text-lg font-bold">اشتراكات المستخدمين</h2>
        </div>
        <table className="w-full">
          <thead className="bg-dark-800">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-semibold">المستخدم</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">الخطة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">البداية</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">النهاية</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">المبلغ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {data.activeSubscriptions.map(sub => (
              <tr key={sub.id} className="hover:bg-dark-800/50">
                <td className="px-4 py-3">
                  <p className="font-semibold">{sub.user}</p>
                  <p className="text-xs text-gray-500">{sub.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded bg-primary-500/20 text-primary-400 text-sm">
                    {data.plans.find(p => p.key === sub.plan)?.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {sub.status === 'active' ? 'نشط' : 'منتهي'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{sub.startDate}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{sub.endDate}</td>
                <td className="px-4 py-3 font-semibold">{sub.amount.toLocaleString()} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-bold">
                {editingPlan ? 'تعديل الخطة' : 'خطة جديدة'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">الاسم بالعربية *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">السعر (ج.م) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">السعر ($)</label>
                  <input
                    type="number"
                    value={formData.priceUsd}
                    onChange={(e) => setFormData({ ...formData, priceUsd: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">المفتاح</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">القنوات</label>
                  <input
                    type="number"
                    value={formData.channels}
                    onChange={(e) => setFormData({ ...formData, channels: parseInt(e.target.value) })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">المحادثات/شهر (-1 = غير محدود)</label>
                  <input
                    type="number"
                    value={formData.conversations}
                    onChange={(e) => setFormData({ ...formData, conversations: parseInt(e.target.value) })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">المستخدمين (-1 = غير محدود)</label>
                  <input
                    type="number"
                    value={formData.users}
                    onChange={(e) => setFormData({ ...formData, users: parseInt(e.target.value) })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-3">المميزات</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {allFeatures.map(feature => (
                    <label
                      key={feature.key}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        formData.features.includes(feature.key)
                          ? 'bg-primary-500/20 border border-primary-500/50'
                          : 'bg-dark-800 border border-dark-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature.key)}
                        onChange={() => toggleFeature(feature.key)}
                        className="sr-only"
                      />
                      <span>{feature.icon}</span>
                      <span className="text-sm">{feature.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded bg-dark-800 border-dark-600"
                  />
                  <span className="text-sm">الأكثر مبيعاً</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">معطل</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2 rounded-lg bg-dark-800 hover:bg-dark-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-gradient px-6 py-2 rounded-lg font-semibold"
                >
                  {editingPlan ? 'حفظ التغييرات' : 'إنشاء الخطة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;