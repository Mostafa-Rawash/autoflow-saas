// WhatsApp Customer Support Automation Landing Page
// Uses centralized components from shared-components.js

const {
  generatePricingSection,
  generateFAQSection,
  generateTestimonialsSection,
  generateCTASection,
  generateHeader,
  generateFooter,
  generateWhatsAppFloat,
  generateHTMLWrapper
} = require('./components/shared-components');

function generateServicePage(lang) {
  const isRTL = lang === 'ar';
  const color = '#25D366';
  
  const content = {
    hero: {
      title: isRTL 
        ? 'رد على عملائك على واتس آب في ثانية واحدة - تلقائياً'
        : 'Reply to Your WhatsApp Customers in One Second - Automatically',
      subtitle: isRTL
        ? 'زيّد مبيعاتك ووفّر وقتك مع نظام ردود ذكي يرد على العملاء 24 ساعة'
        : 'Increase your sales and save time with a smart reply system that responds to customers 24/7',
      cta: isRTL ? 'ابدأ الآن - مجاناً لمدة 14 يوم' : 'Start Now - Free for 14 Days'
    },
    problems: {
      title: isRTL ? 'هل تواجه هذه المشاكل؟' : 'Are You Facing These Problems?',
      items: isRTL ? [
        { icon: '⏰', title: 'ردود بطيئة', desc: 'العملاء ينتظرون ساعات للرد ويزعلوا' },
        { icon: '📱', title: 'رسائل مفقودة', desc: 'رسايل كتير بتضيع وسط المحادثات' },
        { icon: '🏃', title: 'عملاء بيسيبوك', desc: 'العملاء يروحوا للمنافسين اللي بيردوا أسرع' },
        { icon: '😓', title: 'شغل يدوي', desc: 'بتقعد ساعات بترد على نفس الأسئلة' }
      ] : [
        { icon: '⏰', title: 'Slow Replies', desc: 'Customers wait hours for a reply and get upset' },
        { icon: '📱', title: 'Missed Messages', desc: 'Many messages get lost in conversations' },
        { icon: '🏃', title: 'Losing Customers', desc: 'Customers leave for competitors who reply faster' },
        { icon: '😓', title: 'Manual Work', desc: 'Spending hours answering the same questions' }
      ]
    },
    solution: {
      title: isRTL ? 'الحل موجود!' : 'The Solution is Here!',
      subtitle: isRTL 
        ? 'نظام ذكي بيرد على عملائك تلقائياً - وفريقك يتدخل لما يحب'
        : 'A smart system replies to your customers automatically - and your team can jump in anytime',
      items: isRTL ? [
        'إحنا اللي بنرد على الرسايل بدالك',
        'فريقك يقدر يتدخل في أي وقت',
        'العملاء ميحسّوش إنه روبوت',
        'بتوفر وقت وبتزود مبيعاتك'
      ] : [
        'We reply to messages on your behalf',
        'Your team can jump in anytime',
        'Customers won\'t feel it\'s a bot',
        'You save time and increase sales'
      ]
    },
    features: {
      title: isRTL ? 'مميزات تجعل حياتك أسهل' : 'Features That Make Your Life Easier',
      items: isRTL ? [
        { title: 'ردود تلقائية فورية', desc: 'نرد على العملاء في ثانية واحدة، 24 ساعة' },
        { title: 'محادثات ذكية', desc: 'بنفهم طلب العميل ونوجهه صح' },
        { title: 'صندوق مشترك للفريق', desc: 'كل فريقك يشوف الرسايل في مكان واحد' },
        { title: 'تنظيم العملاء', desc: 'كل عميل ليه ملفه وتاريخه' },
        { title: 'رسائل جماعية', desc: 'أبعت عروض لكل عملائك بضغطة زر' },
        { title: 'تقارير الأداء', desc: 'شوف إحصائيات الردود والمبيعات' }
      ] : [
        { title: 'Instant Auto Replies', desc: 'Reply to customers in one second, 24/7' },
        { title: 'Smart Conversations', desc: 'We understand customer requests and guide them right' },
        { title: 'Shared Team Inbox', desc: 'Your whole team sees messages in one place' },
        { title: 'Customer Organization', desc: 'Every customer has their file and history' },
        { title: 'Broadcast Messages', desc: 'Send offers to all your customers with one click' },
        { title: 'Performance Insights', desc: 'See reply and sales statistics' }
      ]
    },
    howItWorks: {
      title: isRTL ? 'إزاي بيشتغل؟' : 'How Does It Work?',
      steps: isRTL ? [
        { num: '1', title: 'بنحضرلك كل حاجة', desc: 'مش محتاج أي معرفة تقنية' },
        { num: '2', title: 'بنخصص الردود', desc: 'بنكتب الردود اللي تناسب نشاطك' },
        { num: '3', title: 'تبدأ تستقبل وتدير', desc: 'الرسايل بسهولة من موبايلك أو لابتوب' }
      ] : [
        { num: '1', title: 'We Set Everything Up', desc: 'No technical knowledge needed' },
        { num: '2', title: 'We Customize Replies', desc: 'We write replies that suit your business' },
        { num: '3', title: 'You Start Receiving', desc: 'And managing messages easily from your phone or laptop' }
      ]
    },
    useCases: {
      title: isRTL ? 'بيشتغل مع أي نوع نشاط' : 'Works with Any Business Type',
      items: isRTL ? [
        { icon: '🍽️', title: 'مطاعم', desc: 'حجوزات وأوردرات' },
        { icon: '🏥', title: 'عيادات', desc: 'مواعيد واستفسارات' },
        { icon: '🛍️', title: 'متاجر', desc: 'طلبات ومتابعة شحن' },
        { icon: '🔧', title: 'خدمات', desc: 'استفسارات وحجز' }
      ] : [
        { icon: '🍽️', title: 'Restaurants', desc: 'Reservations and orders' },
        { icon: '🏥', title: 'Clinics', desc: 'Appointments and inquiries' },
        { icon: '🛍️', title: 'Shops', desc: 'Orders and shipping tracking' },
        { icon: '🔧', title: 'Services', desc: 'Inquiries and booking' }
      ]
    }
  };

  const title = isRTL ? 'أتمتة خدمة عملاء واتس آب | AutoFlow' : 'WhatsApp Customer Support Automation | AutoFlow';

  // Build the page using centralized components
  const bodyContent = `
    ${generateHeader(lang, 'service')}
    
    <!-- Hero Section -->
    <section class="pt-28 md:pt-44 pb-16 md:pb-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center max-w-4xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <span class="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"></span>
            <span class="text-sm text-gray-300">${isRTL ? '🚀 جرّب مجاناً لمدة 14 يوم' : '🚀 Try Free for 14 Days'}</span>
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span class="gradient-text">${content.hero.title}</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">${content.hero.subtitle}</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/201099129550?text=${encodeURIComponent(isRTL ? 'أريد تجربة النظام مجاناً' : 'I want to try the system for free')}" target="_blank" class="btn-gradient px-10 py-5 rounded-2xl text-lg font-semibold inline-flex items-center justify-center gap-2">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              ${content.hero.cta}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem Section -->
    <section class="py-16 md:py-24 bg-gradient-to-b from-transparent to-[#0a0a1a]/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4">${content.problems.title}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${content.problems.items.map(p => `
          <div class="card-tech rounded-2xl p-6 text-center">
            <div class="text-4xl mb-4">${p.icon}</div>
            <h3 class="font-bold text-lg mb-2">${p.title}</h3>
            <p class="text-gray-400 text-sm">${p.desc}</p>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Solution Section -->
    <section class="py-16 md:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4 gradient-text">${content.solution.title}</h2>
          <p class="text-xl text-gray-400">${content.solution.subtitle}</p>
        </div>
        <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          ${content.solution.items.map(item => `
          <div class="glass rounded-2xl p-6 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </div>
            <p class="text-lg">${item}</p>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 md:py-24 bg-gradient-to-b from-[#0a0a1a]/50 to-transparent">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4">${content.features.title}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${content.features.items.map(f => `
          <div class="card-tech rounded-2xl p-6">
            <div class="w-12 h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h3 class="font-bold text-lg mb-2">${f.title}</h3>
            <p class="text-gray-400 text-sm">${f.desc}</p>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-16 md:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4">${content.howItWorks.title}</h2>
        </div>
        <div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          ${content.howItWorks.steps.map(s => `
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#00D4AA] flex items-center justify-center mx-auto mb-4 text-2xl font-black text-black">${s.num}</div>
            <h3 class="font-bold text-lg mb-2">${s.title}</h3>
            <p class="text-gray-400">${s.desc}</p>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Use Cases Section -->
    <section class="py-16 md:py-24 bg-gradient-to-b from-transparent to-[#0a0a1a]/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4">${content.useCases.title}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${content.useCases.items.map(u => `
          <div class="card-tech rounded-2xl p-6 text-center">
            <div class="text-4xl mb-4">${u.icon} ${u.title}</div>
            <p class="text-gray-400">${u.desc}</p>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    ${generatePricingSection(lang, color)}
    
    ${generateTestimonialsSection(lang)}
    
    ${generateFAQSection(lang)}
    
    ${generateCTASection(lang, isRTL ? 'جاهز تبدأ توفر وقتك وتزود مبيعاتك؟' : 'Ready to Save Time and Increase Sales?', isRTL ? 'ابدأ مجاناً لمدة 14 يوم - بدون أي التزام' : 'Start free for 14 days - no commitment')}
    
    ${generateFooter(lang)}
    
    ${generateWhatsAppFloat(lang)}
  `;

  return generateHTMLWrapper(lang, title, bodyContent);
}

module.exports = { generateServicePage };