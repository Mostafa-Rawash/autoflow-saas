import React, { useState, useEffect } from 'react';
import { Check, X, Crown, Star, Lock } from 'lucide-react';
import { subscriptionsAPI } from '../api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const plans = [
  {
    id: 'starter',
    name: 'المبتدئ',
    nameEn: 'Starter',
    price: 2000,
    priceYearly: 20000,
    popular: true,
    features: [
      { text: 'قناة واحدة (واتس آب)', included: true },
      { text: '1000 محادثة شهرياً', included: true },
      { text: '10000 رسالة شهرياً', included: true },
      { text: 'ردود تلقائية', included: true },
      { text: 'دعم عبر الواتس آب', included: true },
      { text: '14 يوم تجربة مجانية', included: true },
      { text: 'تقارير متقدمة', included: false },
      { text: 'فريق متعدد', included: false }
    ]
  },
  {
    id: 'standard',
    name: 'قياسي',
    nameEn: 'Standard',
    price: 4000,
    priceYearly: 40000,
    features: [
      { text: '3 قنوات', included: true },
      { text: '5000 محادثة شهرياً', included: true },
      { text: '50000 رسالة شهرياً', included: true },
      { text: '5 أعضاء فريق', included: true },
      { text: 'قوالب مخصصة', included: true },
      { text: 'دعم على مدار الساعة', included: true },
      { text: 'تقارير متقدمة', included: true },
      { text: 'API مخصص', included: false }
    ]
  },
  {
    id: 'premium',
    name: 'مميز',
    nameEn: 'Premium',
    price: 8000,
    priceYearly: 80000,
    features: [
      { text: '8 قنوات (جميع القنوات)', included: true },
      { text: 'محادثات غير محدودة', included: true },
      { text: 'رسائل غير محدودة', included: true },
      { text: 'فريق غير محدود', included: true },
      { text: 'قوالب غير محدودة', included: true },
      { text: 'دعم VIP', included: true },
      { text: 'تقارير متقدمة', included: true },
      { text: 'API مخصص', included: true }
    ]
  }
];

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const { data } = await subscriptionsAPI.getCurrent();
      setCurrentPlan(data.subscription.plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    toast('سيتم إضافة الدفع الإلكتروني قريباً! 🔜', { icon: '💳' });
  };

  const getPrice = (plan) => {
    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.price;
    return price;
  };

  const getSavings = (plan) => {
    if (billingCycle === 'yearly') {
      return Math.round(plan.price * 12 - plan.priceYearly);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">خطط الاشتراك</h1>
        <p className="text-gray-400">اختر الخطة المناسبة لاحتياجاتك</p>
        
        {/* WhatsApp Focus Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-whatsapp/20 text-whatsapp text-sm font-bold mt-4">
          📱 ابدأ بواتس آب من 2000 جنيه/شهر
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            billingCycle === 'monthly'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
          }`}
        >
          شهري
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            billingCycle === 'yearly'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
          }`}
        >
          سنوي
          <span className="mr-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            وفر شهرين
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const price = getPrice(plan);
          const savings = getSavings(plan);

          return (
            <div
              key={plan.id}
              className={`card p-6 relative ${
                plan.popular ? 'border-whatsapp border-2' : ''
              } ${isCurrentPlan ? 'ring-2 ring-primary-500' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-whatsapp text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  الأكثر شعبية
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                  خطتك الحالية
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.nameEn}</p>
                
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-4xl font-black">{price.toLocaleString()}</span>
                    <span className="text-lg text-gray-400">جنيهاً</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    / {billingCycle === 'yearly' ? 'سنوياً' : 'شهرياً'}
                  </p>
                  {savings > 0 && (
                    <p className="text-xs text-green-400 mt-1">
                      توفير {savings.toLocaleString()} جنيه
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrentPlan}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  isCurrentPlan
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-whatsapp hover:bg-whatsapp/90 text-white'
                    : 'btn-secondary'
                }`}
              >
                {isCurrentPlan ? 'خطتك الحالية' : 'ابدأ الآن'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Features Comparison */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold">لماذا تختار AutoFlow؟</h3>
          <span className="px-2 py-1 bg-whatsapp/20 text-whatsapp text-xs rounded-full">
            واتس آب أولاً
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
          <div className="p-4 bg-dark-800 rounded-lg">
            <p className="text-white font-semibold mb-2">📱 توصيل سريع</p>
            <p>وصّل واتس آب في دقائق عبر QR أو API</p>
          </div>
          <div className="p-4 bg-dark-800 rounded-lg">
            <p className="text-white font-semibold mb-2">🤖 ردود ذكية</p>
            <p>ردود تلقائية بالعربي مع دعم AI</p>
          </div>
          <div className="p-4 bg-dark-800 rounded-lg">
            <p className="text-white font-semibold mb-2">🔒 آمن وموثوق</p>
            <p>تشفير كامل لحماية بيانات عملائك</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card p-6">
        <h3 className="font-bold mb-4">أسئلة شائعة</h3>
        <div className="space-y-4 text-sm text-gray-400">
          <div>
            <p className="font-semibold text-white">هل يمكنني تغيير الخطة لاحقاً؟</p>
            <p>نعم، يمكنك الترقية أو الإلغاء في أي وقت من إعدادات الحساب.</p>
          </div>
          <div>
            <p className="font-semibold text-white">ما هي طرق الدفع المتاحة؟</p>
            <p>بطاقات الائتمان، فودافون كاش، فوري، التحويل البنكي.</p>
          </div>
          <div>
            <p className="font-semibold text-white">هل هناك فترة تجريبية؟</p>
            <p>نعم، جميع الخطط الجديدة تحصل على 14 يوم تجربة مجانية.</p>
          </div>
          <div>
            <p className="font-semibold text-white">ما هي القنوات المتاحة؟</p>
            <p>حالياً واتس آب فقط. قنوات أخرى (ماسنجر، إنستجرام، تيليجرام) قريباً!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;