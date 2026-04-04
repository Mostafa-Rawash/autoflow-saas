// Shared Components for Landing Pages
// Centralized, reusable UI components

// ============================================
// PRICING DATA
// ============================================
const pricingPlans = {
  basic: {
    name: { ar: 'أساسي', en: 'Basic' },
    price: '299',
    features: {
      ar: ['ردود تلقائية', '1000 محادثة/شهر', 'فريق من 2', 'تقارير أساسية'],
      en: ['Auto replies', '1000 convos/month', 'Team of 2', 'Basic reports']
    }
  },
  standard: {
    name: { ar: 'قياسي', en: 'Standard' },
    price: '599',
    popular: true,
    features: {
      ar: ['كل مميزات الأساسي', '5000 محادثة/شهر', 'فريق من 5', 'رسائل جماعية', 'تقارير متقدمة'],
      en: ['All Basic features', '5000 convos/month', 'Team of 5', 'Broadcast messages', 'Advanced reports']
    }
  },
  premium: {
    name: { ar: 'متقدم', en: 'Premium' },
    price: '999',
    features: {
      ar: ['كل مميزات القياسي', 'محادثات غير محدودة', 'فريق غير محدود', 'تكامل مع أنظمتك', 'دعم مخصص'],
      en: ['All Standard features', 'Unlimited convos', 'Unlimited team', 'System integration', 'Dedicated support']
    }
  }
};

// ============================================
// PRICING SECTION COMPONENT
// ============================================
function generatePricingSection(lang, color = '#25D366') {
  const isRTL = lang === 'ar';
  
  return `
  <!-- Pricing Section -->
  <section class="py-16 md:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black mb-4">${isRTL ? 'خطط تناسب كل النشاطات' : 'Plans for Every Business'}</h2>
        <p class="text-gray-400">${isRTL ? 'ابدأ مجاناً لمدة 14 يوم' : 'Start free for 14 days'}</p>
      </div>
      <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        ${generatePricingCard('basic', lang, color)}
        ${generatePricingCard('standard', lang, color)}
        ${generatePricingCard('premium', lang, color)}
      </div>
    </div>
  </section>`;
}

function generatePricingCard(planKey, lang, color) {
  const plan = pricingPlans[planKey];
  const isRTL = lang === 'ar';
  const isPopular = plan.popular;
  
  return `
  <div class="card-tech rounded-2xl p-8 ${isPopular ? 'border-2 relative' : ''}" ${isPopular ? `style="border-color: ${color};"` : ''}>
    ${isPopular ? `<div class="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-black" style="background: ${color};">${isRTL ? 'الأكثر شعبية' : 'Most Popular'}</div>` : ''}
    <h3 class="font-bold text-xl mb-2">${plan.name[lang]}</h3>
    <div class="mb-6">
      <span class="text-4xl font-black gradient-text">${plan.price}</span>
      <span class="text-gray-400">/${isRTL ? 'شهر' : 'month'}</span>
    </div>
    <ul class="space-y-3 mb-8">
      ${plan.features[lang].map(f => `<li class="flex items-center gap-2 text-sm text-gray-300"><svg class="w-5 h-5 flex-shrink-0" style="color: ${color};" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>${f}</li>`).join('')}
    </ul>
    <a href="https://wa.me/201099129550" target="_blank" class="${isPopular ? 'btn-gradient' : 'border border-gray-600 text-gray-300 hover:border-[' + color + '] hover:text-white'} block w-full text-center py-3 rounded-xl font-semibold transition-colors" ${isPopular ? '' : `style="border-color: rgba(255,255,255,0.1);"`}>
      ${isPopular ? (isRTL ? 'الأكثر شعبية' : 'Most Popular') : (isRTL ? 'ابدأ الآن' : 'Start Now')}
    </a>
  </div>`;
}

// ============================================
// FAQ SECTION COMPONENT
// ============================================
function generateFAQSection(lang, customFAQs = null) {
  const isRTL = lang === 'ar';
  
  const defaultFAQs = {
    ar: [
      { q: 'هل ده معقد؟', a: 'لا خالص! إحنا بنحضر كل حاجة ليك. مش محتاج أي خبرة تقنية.' },
      { q: 'هل محتاج خبرة تقنية؟', a: 'أبداً! بنساعدك خطوة بخطوة لحد ما النظام يشتغل.' },
      { q: 'فريقي يقدر يرد يدوي؟', a: 'أيوه! الفريق يقدر يتدخل في أي وقت ويرد على أي رسالة.' },
      { q: 'العملاء هيحسوا إنه روبوت؟', a: 'لا! الردود طبيعية جداً ومنسجمة مع نشاطك.' },
      { q: 'أقدر أوقف في أي وقت؟', a: 'أيوه، تقدر تلغي الاشتراك في أي وقت بدون أي رسوم.' }
    ],
    en: [
      { q: 'Is this complicated?', a: 'Not at all! We set everything up for you. No technical experience needed.' },
      { q: 'Do I need technical knowledge?', a: 'No! We help you step by step until the system works.' },
      { q: 'Can my team reply manually?', a: 'Yes! The team can jump in anytime and reply to any message.' },
      { q: 'Will customers feel it\'s a bot?', a: 'No! The replies are very natural and match your business.' },
      { q: 'Can I cancel anytime?', a: 'Yes, you can cancel anytime without any fees.' }
    ]
  };
  
  const faqs = customFAQs || defaultFAQs;
  
  return `
  <!-- FAQ Section -->
  <section class="py-16 md:py-24">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black mb-4">${isRTL ? 'أسئلة شائعة' : 'Frequently Asked Questions'}</h2>
      </div>
      <div class="space-y-4">
        ${faqs[lang].map(item => `
        <div class="glass rounded-xl p-6">
          <h3 class="font-bold text-lg mb-2">${item.q}</h3>
          <p class="text-gray-400">${item.a}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

// ============================================
// TESTIMONIALS SECTION COMPONENT
// ============================================
function generateTestimonialsSection(lang, customTestimonials = null) {
  const isRTL = lang === 'ar';
  
  const defaultTestimonials = {
    ar: [
      { name: 'أحمد محمد', business: 'مطعم كباب حلب', text: 'قبل ما أستخدم النظام كنت بضيع 3 ساعات يومياً في الردود. دلوقتي بيشتغل لوحده وأنا بركز على الشغل.' },
      { name: 'د. سارة أحمد', business: 'عيادة أسنان', text: 'المرضى بيتصلوا في أي وقت والنظام بيرد فوراً. عدد المواعيد زاد 40% في أول شهر.' },
      { name: 'محمد علي', business: 'متجر إلكتروني', text: 'الردود السريعة حولت كتير من الاستفسارات لمبيعات. النظام ده غير حياتي.' }
    ],
    en: [
      { name: 'Ahmed Mohamed', business: 'Kebab Restaurant', text: 'Before using this system, I wasted 3 hours daily on replies. Now it works automatically while I focus on business.' },
      { name: 'Dr. Sarah Ahmed', business: 'Dental Clinic', text: 'Patients contact anytime and the system replies instantly. Appointments increased 40% in the first month.' },
      { name: 'Mohamed Ali', business: 'Online Store', text: 'Fast replies converted many inquiries to sales. This system changed my life.' }
    ]
  };
  
  const testimonials = customTestimonials || defaultTestimonials;
  
  return `
  <!-- Testimonials Section -->
  <section class="py-16 md:py-24 bg-gradient-to-b from-[#0a0a1a]/50 to-transparent">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black mb-4">${isRTL ? 'ماذا يقول عملاؤنا؟' : 'What Our Customers Say'}</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        ${testimonials[lang].map(t => `
        <div class="card-tech rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center text-xl">👤</div>
            <div>
              <h3 class="font-bold">${t.name}</h3>
              <p class="text-gray-400 text-sm">${t.business}</p>
            </div>
          </div>
          <p class="text-gray-300">"${t.text}"</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

// ============================================
// CTA SECTION COMPONENT
// ============================================
function generateCTASection(lang, title, subtitle, color = '#25D366') {
  const isRTL = lang === 'ar';
  
  return `
  <!-- CTA Section -->
  <section class="py-16 md:py-24 bg-gradient-to-b from-transparent to-[#0a0a1a]/50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <div class="glass rounded-2xl p-8 md:p-12 border" style="border-color: ${color}20;">
        <h2 class="text-3xl md:text-4xl font-black mb-4 gradient-text">${title}</h2>
        <p class="text-xl text-gray-400 mb-8">${subtitle}</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://wa.me/201099129550?text=${encodeURIComponent(isRTL ? 'أريد تجربة النظام مجاناً' : 'I want to try the system for free')}" target="_blank" class="btn-gradient px-10 py-5 rounded-2xl text-lg font-semibold inline-flex items-center justify-center gap-2">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            ${isRTL ? 'ابدأ الآن مجاناً' : 'Start Free Now'}
          </a>
        </div>
      </div>
    </div>
  </section>`;
}

// ============================================
// HEADER COMPONENT
// ============================================
function generateHeader(lang, activeLink = '') {
  const isRTL = lang === 'ar';
  
  const channels = [
    { key: 'whatsapp', name: 'WhatsApp', nameAr: 'واتس آب', color: '#25D366' },
    { key: 'messenger', name: 'Messenger', nameAr: 'ماسنجر', color: '#0084FF' },
    { key: 'instagram', name: 'Instagram', nameAr: 'إنستجرام', color: '#E4405F' },
    { key: 'telegram', name: 'Telegram', nameAr: 'تيليجرام', color: '#0088cc' },
    { key: 'livechat', name: 'Live Chat', nameAr: 'محادثة مباشرة', color: '#00D4AA' },
    { key: 'email', name: 'Email', nameAr: 'إيميل', color: '#EA4335' },
    { key: 'sms', name: 'SMS', nameAr: 'رسائل نصية', color: '#7C3AED' },
    { key: 'api', name: 'API', nameAr: 'API', color: '#F59E0B' }
  ];
  
  return `
  <!-- Header -->
  <header class="fixed top-0 left-0 right-0 z-50 glass-dark">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex justify-between items-center h-14 md:h-16">
        <a href="/" class="flex items-center gap-2">
          <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#7C3AED] flex items-center justify-center">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          </div>
          <span class="text-lg md:text-xl font-bold gradient-text">AutoFlow</span>
        </a>
        <nav class="hidden md:flex items-center gap-4">
          <a href="/" class="text-sm ${activeLink === 'home' ? 'text-[#00D4AA]' : 'text-gray-400 hover:text-[#00D4AA]'}">${isRTL ? 'الرئيسية' : 'Home'}</a>
          
          <!-- Services Dropdown -->
          <div class="relative group">
            <button class="text-sm ${activeLink === 'services' ? 'text-[#00D4AA]' : 'text-gray-400 hover:text-[#00D4AA]'} flex items-center gap-1">
              ${isRTL ? 'الخدمات' : 'Services'}
              <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-56 glass rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
              <div class="p-2">
                ${channels.map(ch => `
                <a href="/service/${ch.key}/${lang}/" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div class="w-2 h-2 rounded-full" style="background: ${ch.color};"></div>
                  <span class="text-sm">${isRTL ? ch.nameAr : ch.name}</span>
                </a>
                `).join('')}
              </div>
            </div>
          </div>
          
          <!-- Channels Dropdown -->
          <div class="relative group">
            <button class="text-sm ${activeLink === 'channels' ? 'text-[#00D4AA]' : 'text-gray-400 hover:text-[#00D4AA]'} flex items-center gap-1">
              ${isRTL ? 'القنوات' : 'Channels'}
              <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-56 glass rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
              <div class="p-2 grid grid-cols-2 gap-1">
                ${channels.map(ch => `
                <a href="/channel/${ch.key}/${lang}/" class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <div class="w-2 h-2 rounded-full flex-shrink-0" style="background: ${ch.color};"></div>
                  <span class="text-xs">${isRTL ? ch.nameAr : ch.name}</span>
                </a>
                `).join('')}
              </div>
            </div>
          </div>
          
          <a href="/pricing/${lang}/" class="text-sm ${activeLink === 'pricing' ? 'text-[#00D4AA]' : 'text-gray-400 hover:text-[#00D4AA]'}">${isRTL ? 'الأسعار' : 'Pricing'}</a>
          <a href="https://wa.me/201099129550" target="_blank" class="btn-gradient px-5 py-2 rounded-lg text-sm font-medium text-white">${isRTL ? 'تواصل' : 'Contact'}</a>
        </nav>
        <button class="md:hidden text-gray-400" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      <nav id="mobile-menu" class="hidden md:hidden pb-4 border-t border-gray-800 mt-2 pt-4">
        <a href="/" class="block py-2 ${activeLink === 'home' ? 'text-[#00D4AA]' : 'text-gray-300'}">${isRTL ? 'الرئيسية' : 'Home'}</a>
        
        <!-- Mobile Services -->
        <div class="py-2">
          <button onclick="document.getElementById('mobile-services').classList.toggle('hidden')" class="flex items-center justify-between w-full ${activeLink === 'services' ? 'text-[#00D4AA]' : 'text-gray-300'}">
            ${isRTL ? 'الخدمات' : 'Services'}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div id="mobile-services" class="hidden mt-2 grid grid-cols-2 gap-1 pl-4">
            ${channels.map(ch => `
            <a href="/service/${ch.key}/${lang}/" class="py-1.5 text-xs text-gray-400 hover:text-[${ch.color}]">${isRTL ? ch.nameAr : ch.name}</a>
            `).join('')}
          </div>
        </div>
        
        <!-- Mobile Channels -->
        <div class="py-2">
          <button onclick="document.getElementById('mobile-channels').classList.toggle('hidden')" class="flex items-center justify-between w-full ${activeLink === 'channels' ? 'text-[#00D4AA]' : 'text-gray-300'}">
            ${isRTL ? 'القنوات' : 'Channels'}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div id="mobile-channels" class="hidden mt-2 grid grid-cols-2 gap-1 pl-4">
            ${channels.map(ch => `
            <a href="/channel/${ch.key}/${lang}/" class="py-1.5 text-xs text-gray-400 hover:text-[${ch.color}]">${isRTL ? ch.nameAr : ch.name}</a>
            `).join('')}
          </div>
        </div>
        
        <a href="/pricing/${lang}/" class="block py-2 ${activeLink === 'pricing' ? 'text-[#00D4AA]' : 'text-gray-300'}">${isRTL ? 'الأسعار' : 'Pricing'}</a>
        <a href="https://wa.me/201099129550" target="_blank" class="block mt-2 btn-gradient px-4 py-2 rounded-lg text-center">${isRTL ? 'تواصل' : 'Contact'}</a>
      </nav>
    </div>
  </header>`;
}

// ============================================
// FOOTER COMPONENT
// ============================================
function generateFooter(lang) {
  const isRTL = lang === 'ar';
  
  return `
  <!-- Footer -->
  <footer class="py-12 border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#7C3AED] flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            </div>
            <span class="text-xl font-bold gradient-text">AutoFlow</span>
          </div>
          <p class="text-gray-400 text-sm">${isRTL ? 'منصة اتصال ذكية توحد كل قنواتك في مكان واحد' : 'Smart communication platform that unifies all your channels in one place'}</p>
        </div>
        <div>
          <h4 class="font-bold mb-4">${isRTL ? 'القنوات' : 'Channels'}</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><a href="/channel/whatsapp/ar/" class="hover:text-[#25D366]">WhatsApp</a></li>
            <li><a href="/channel/messenger/ar/" class="hover:text-[#0084FF]">Messenger</a></li>
            <li><a href="/channel/instagram/ar/" class="hover:text-[#E4405F]">Instagram</a></li>
            <li><a href="/channel/telegram/ar/" class="hover:text-[#0088cc]">Telegram</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-4">${isRTL ? 'الخدمات' : 'Services'}</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><a href="/service/whatsapp-support/ar/" class="hover:text-[#00D4AA]">${isRTL ? 'دعم واتس آب' : 'WhatsApp Support'}</a></li>
            <li><a href="/services/ar/" class="hover:text-[#00D4AA]">${isRTL ? 'كل الخدمات' : 'All Services'}</a></li>
            <li><a href="/pricing/ar/" class="hover:text-[#00D4AA]">${isRTL ? 'الأسعار' : 'Pricing'}</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-4">${isRTL ? 'تواصل معنا' : 'Contact Us'}</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><a href="mailto:mostafa@rawash.com" class="hover:text-[#00D4AA]">mostafa@rawash.com</a></li>
            <li><a href="https://wa.me/201099129550" target="_blank" class="hover:text-[#25D366]">+20 109 912 9550</a></li>
          </ul>
        </div>
      </div>
      <div class="text-center pt-8 border-t border-gray-800">
        <p class="text-gray-500 text-sm">© ${new Date().getFullYear()} AutoFlow by Ensoulify. ${isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
      </div>
    </div>
  </footer>`;
}

// ============================================
// WHATSAPP FLOAT BUTTON COMPONENT
// ============================================
function generateWhatsAppFloat(lang) {
  const isRTL = lang === 'ar';
  
  return `
  <!-- WhatsApp Float -->
  <a href="https://wa.me/201099129550" target="_blank" class="fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-bounce" style="animation-duration: 2s;">
    <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    </svg>
  </a>`;
}

// ============================================
// BASE HTML WRAPPER
// ============================================
function generateHTMLWrapper(lang, title, bodyContent) {
  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    ${isRTL ? 'body { font-family: "Cairo", sans-serif; }' : 'body { font-family: "Inter", sans-serif; }'}
    .gradient-text { background: linear-gradient(135deg, #25D366, #00D4AA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
    .glass-dark { background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .card-tech { background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s; }
    .card-tech:hover { transform: translateY(-4px); border-color: rgba(37,211,102,0.2); box-shadow: 0 20px 40px rgba(37,211,102,0.1); }
    .btn-gradient { background: linear-gradient(135deg, #25D366, #00D4AA); transition: all 0.3s; }
    .btn-gradient:hover { box-shadow: 0 10px 30px rgba(37,211,102,0.3); transform: translateY(-2px); }
    .tech-grid { background-image: linear-gradient(rgba(37,211,102,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(37,211,102,0.02) 1px, transparent 1px); background-size: 40px 40px; }
  </style>
</head>
<body class="bg-[#0a0a1a] text-white overflow-x-hidden">
  <div class="fixed inset-0 -z-10"><div class="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]"></div><div class="absolute inset-0 tech-grid opacity-50"></div></div>
  ${bodyContent}
</body>
</html>`;
}

module.exports = {
  pricingPlans,
  generatePricingSection,
  generateFAQSection,
  generateTestimonialsSection,
  generateCTASection,
  generateHeader,
  generateFooter,
  generateWhatsAppFloat,
  generateHTMLWrapper
};