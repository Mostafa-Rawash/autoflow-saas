import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, Smartphone, Zap, Users, Crown, MessageSquare, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const steps = [
  { id: 1, title: 'مرحباً بك في AutoFlow', subtitle: 'نورتنا! خلينا نعرفك على النظام', icon: '👋' },
  { id: 2, title: 'نوع النشاط', subtitle: 'اختار نوع نشاطك التجاري', icon: '🏢' },
  { id: 3, title: 'توصيل واتس آب', subtitle: 'اربط حساب واتس آب بتاعك', icon: '📱' },
  { id: 4, title: 'أول رد تلقائي', subtitle: 'جهز أول رد تلقائي لعملائك', icon: '⚡' },
  { id: 5, title: 'جاهز!', subtitle: 'كل حاجة اتصححت، يلا نبدأ', icon: '🎉' }
];

const businessTypes = [
  { id: 'restaurant', name: 'مطعم / كافيه', icon: '🍽️' },
  { id: 'clinic', name: 'عيادة / مستشفى', icon: '🏥' },
  { id: 'ecommerce', name: 'متجر إلكتروني', icon: '🛍️' },
  { id: 'realestate', name: 'عقارات', icon: '🏠' },
  { id: 'services', name: 'خدمات مهنية', icon: '🔧' },
  { id: 'retail', name: 'متجر تجاري', icon: '🏪' },
  { id: 'education', name: 'تعليم / تدريب', icon: '📚' },
  { id: 'other', name: 'نشاط آخر', icon: '💼' }
];

const quickReplies = [
  { name: 'مرحباً', keywords: 'مرحبا، السلام عليكم، hi', response: 'أهلاً بك في [اسم النشاط]! كيف يمكنني مساعدتك؟' },
  { name: 'ساعات العمل', keywords: 'ساعات، مواعيد، امتى', response: 'ساعات العمل: من 9 صباحاً إلى 10 مساءً كل يوم.' },
  { name: 'أسعار', keywords: 'سعر، أسعار، كام', response: 'للأسعار والعروض، تواصل معنا على 01099129550' }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessType: '',
    businessName: user?.name || '',
    whatsappConnected: false,
    quickReplies: []
  });

  useEffect(() => {
    // Check if already onboarded
    const onboarded = localStorage.getItem('autoflow_onboarded');
    if (onboarded === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBusinessSelect = (type) => {
    setFormData({ ...formData, businessType: type });
  };

  const handleQuickReplyToggle = (reply) => {
    const current = formData.quickReplies;
    const exists = current.find(r => r.name === reply.name);
    if (exists) {
      setFormData({ ...formData, quickReplies: current.filter(r => r.name !== reply.name) });
    } else {
      setFormData({ ...formData, quickReplies: [...current, reply] });
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save quick replies
      if (formData.quickReplies.length > 0) {
        for (const reply of formData.quickReplies) {
          await axios.post(`${API_URL}/auto-replies`, {
            name: reply.name,
            keywords: reply.keywords.split(', '),
            response: reply.response,
            matchType: 'contains',
            isActive: true
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
      
      // Mark as onboarded
      localStorage.setItem('autoflow_onboarded', 'true');
      localStorage.setItem('autoflow_business_type', formData.businessType);
      
      toast.success('تم الإعداد بنجاح! مرحباً بك في AutoFlow');
      navigate('/');
    } catch (error) {
      console.error('Onboarding error:', error);
      localStorage.setItem('autoflow_onboarded', 'true');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">👋</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">{steps[0].title}</h2>
            <p className="text-xl text-slate-500 mb-8">{steps[0].subtitle}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              {['📱 واتس آب', '🤖 ردود تلقائية', '📊 تقارير', '👥 فريق'].map((feature, i) => (
                <div key={i} className="card p-4 text-center">
                  <p className="font-medium">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div>
            <h2 className="text-3xl font-bold mb-4 text-center">{steps[1].title}</h2>
            <p className="text-xl text-slate-500 mb-8 text-center">{steps[1].subtitle}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleBusinessSelect(type.id)}
                  className={`card p-6 text-center transition-all ${formData.businessType === type.id ? 'border-2 border-sky-300 bg-sky-600/10' : 'hover:border-sky-300/30'}`}
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <p className="font-medium">{type.name}</p>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">📱</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">{steps[2].title}</h2>
            <p className="text-xl text-slate-500 mb-8">{steps[2].subtitle}</p>
            <div className="max-w-md mx-auto">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-whatsapp/20 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-whatsapp" />
                  </div>
                </div>
                <p className="text-slate-500 mb-4">واتس آب هو القناة الوحيدة النشطة حالياً في AutoFlow</p>
                <button
                  onClick={() => setFormData({ ...formData, whatsappConnected: true })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 font-semibold w-full"
                  style={{ background: '#25D366' }}
                >
                  توصيل واتس آب
                </button>
                {formData.whatsappConnected && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
                    <Check className="w-5 h-5" /> متصل في وضع العرض
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div>
            <h2 className="text-3xl font-bold mb-4 text-center">{steps[3].title}</h2>
            <p className="text-xl text-slate-500 mb-8 text-center">{steps[3].subtitle}</p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {quickReplies.map((reply) => {
                const selected = formData.quickReplies.find(r => r.name === reply.name);
                return (
                  <button
                    key={reply.name}
                    onClick={() => handleQuickReplyToggle(reply)}
                    className={`card p-6 text-right transition-all ${selected ? 'border-2 border-whatsapp bg-whatsapp/10' : 'hover:border-whatsapp/30'}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className={`w-5 h-5 ${selected ? 'text-whatsapp' : 'text-slate-400'}`} />
                      <h3 className="font-bold">{reply.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500">{reply.response.substring(0, 50)}...</p>
                    {selected && <div className="mt-3 flex items-center gap-1 text-whatsapp text-sm"><Check className="w-4 h-4" /> مضاف</div>}
                  </button>
                );
              })}
            </div>
            <p className="text-center text-slate-400 text-sm mt-4">تقدر تعدل أو تضيف قواعد تانية من لوحة التحكم بعدين</p>
          </div>
        );
      
      case 5:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">{steps[4].title}</h2>
            <p className="text-xl text-slate-500 mb-8">{steps[4].subtitle}</p>
            <div className="max-w-md mx-auto mb-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-right space-y-4">
                <div className="flex items-center justify-between">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>نوع النشاط: {businessTypes.find(t => t.id === formData.businessType)?.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>واتس آب: متصل</span>
                </div>
                <div className="flex items-center justify-between">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>الردود التلقائية: {formData.quickReplies.length} مفعلين</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="btn-primary px-10 py-4 text-xl font-bold"
            >
              {loading ? 'جاري الإعداد...' : 'ابدأ الآن 🚀'}
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= step.id ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {step.id}
                </div>
                {index < steps.length - 1 && <div className={`w-12 md:w-24 h-1 mx-2 ${currentStep > step.id ? 'bg-sky-600' : 'bg-slate-100'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg ${currentStep === 1 ? 'opacity-0' : 'border border-slate-300 text-slate-700 hover:bg-slate-100'}`}
          >
            <ArrowRight className="w-5 h-5" /> السابق
          </button>
          {currentStep < steps.length && (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 font-semibold"
            >
              التالي <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;