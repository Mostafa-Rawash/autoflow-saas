// Channel page generator using centralized components
const {
  generatePricingSection,
  generateFAQSection,
  generateCTASection,
  generateHeader,
  generateFooter,
  generateWhatsAppFloat,
  generateHTMLWrapper
} = require('./components/shared-components');

function generateChannelPage(channel, lang) {
  const isRTL = lang === 'ar';
  
  const channels = {
    whatsapp: {
      name: 'WhatsApp',
      nameAr: 'واتس آب',
      color: '#25D366',
      icon: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>',
      features: isRTL ? [
        'WhatsApp Business API رسمي',
        'ردود تلقائية ذكية',
        'قوالب رسائل جاهزة',
        'تسمية المحادثات تلقائياً',
        'تقارير تفصيلية',
        'تكامل مع CRM'
      ] : [
        'Official WhatsApp Business API',
        'Smart auto-replies',
        'Message templates',
        'Auto labeling conversations',
        'Detailed analytics',
        'CRM integration'
      ],
      stats: { users: '2B+', messages: '100B/day', countries: '180+' }
    },
    messenger: {
      name: 'Messenger',
      nameAr: 'ماسنجر',
      color: '#0084FF',
      icon: '<path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 22l4.832-1.091A9.945 9.945 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.845 0-3.596-.508-5.083-1.387l-.363-.217-3.76.853.853-3.76-.217-.363A8.013 8.013 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>',
      features: isRTL ? [
        'Facebook Messenger API',
        'ردود فورية 24/7',
        'رسائل غنية بصور وأزرار',
        'تكامل مع إعلانات فيسبوك',
        'متجر فيسبوك',
        'دعم العملاء المتكامل'
      ] : [
        'Facebook Messenger API',
        'Instant 24/7 replies',
        'Rich messages with images & buttons',
        'Facebook Ads integration',
        'Facebook Shop support',
        'Unified customer support'
      ],
      stats: { users: '1.3B+', messages: '20B/month', pages: '200M+' }
    },
    instagram: {
      name: 'Instagram',
      nameAr: 'إنستجرام',
      color: '#E4405F',
      icon: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>',
      features: isRTL ? [
        'Instagram Direct Messages API',
        'ردود على التعليقات تلقائياً',
        'رسائل DM ذكية',
        'تكامل مع المتجر',
        'تحليلات المتابعين',
        'جدولة المحتوى'
      ] : [
        'Instagram Direct Messages API',
        'Auto-reply to comments',
        'Smart DM responses',
        'Shopping integration',
        'Follower analytics',
        'Content scheduling'
      ],
      stats: { users: '2B+', posts: '50B+', reels: '140B+' }
    },
    telegram: {
      name: 'Telegram',
      nameAr: 'تيليجرام',
      color: '#0088cc',
      icon: '<path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 6.823c.14-.005.26.026.37.081.14.068.25.173.31.293.06.12.09.258.09.408v.02l-.01.05-.01.07-1.1 4.8-.17.73-.18.8c-.05.22-.1.43-.15.6-.05.17-.09.3-.13.38-.05.1-.11.14-.18.14-.07 0-.17-.04-.29-.12a1.3 1.3 0 00-.47-.22.87.87 0 00-.49.01c-.17.05-.33.13-.49.24-.16.11-.32.24-.47.38-.15.14-.3.29-.43.44l-.2.22-.1.11-.03.03h-.01l-.01.01-.02.01c-.05.04-.11.05-.18.05a.5.5 0 01-.22-.06.7.7 0 01-.2-.16l-.02-.02-.04-.04-.04-.04c-.1-.12-.22-.26-.34-.42-.12-.16-.24-.34-.35-.53-.11-.19-.21-.39-.3-.6-.09-.21-.16-.43-.21-.66-.05-.23-.08-.47-.08-.71 0-.32.05-.62.16-.9.11-.28.25-.53.44-.74.19-.21.4-.38.66-.51.26-.13.53-.19.83-.19.19 0 .38.03.55.09.17.06.33.14.47.24l.11.07.07.04c.07.04.13.06.2.06.08 0 .14-.04.18-.12l.18-.47.19-.47.17-.42.15-.37.12-.3.08-.19.04-.09.02-.04.01-.02c.06-.13.14-.22.24-.28.1-.06.21-.09.33-.09l-.09.0-.09,0z"/>',
      features: isRTL ? [
        'Telegram Bot API',
        'بوتات ذكية متقدمة',
        'قنوات ومجموعات لا محدودة',
        'رسائل غنية بالوسائط',
        'أوامر مخصصة',
        'تكامل مع مواقع الويب'
      ] : [
        'Telegram Bot API',
        'Advanced smart bots',
        'Unlimited channels & groups',
        'Rich media messages',
        'Custom commands',
        'Web integration'
      ],
      stats: { users: '800M+', messages: '15B/day', bots: '10M+' }
    },
    livechat: {
      name: 'Live Chat',
      nameAr: 'محادثة مباشرة',
      color: '#00D4AA',
      icon: '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>',
      features: isRTL ? [
        'Widget للموقع',
        'دردشة مباشرة فورية',
        'تخصيص الشكل والألوان',
        'ردود تلقائية مسبقة',
        'تقارير الزوار',
        'تكامل مع CRM'
      ] : [
        'Website widget',
        'Instant live chat',
        'Custom look & feel',
        'Pre-defined auto-replies',
        'Visitor analytics',
        'CRM integration'
      ],
      stats: { websites: '500K+', chats: '1B+', satisfaction: '95%' }
    },
    email: {
      name: 'Email',
      nameAr: 'إيميل',
      color: '#EA4335',
      icon: '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
      features: isRTL ? [
        'SMTP/IMAP متكامل',
        'تصفية تلقائية للإيميلات',
        'ردود ذكية على الإيميلات',
        'تصنيف وتأشير تلقائي',
        'تقارير مفصلة',
        'تكامل مع Outlook/Gmail'
      ] : [
        'Full SMTP/IMAP integration',
        'Auto email filtering',
        'Smart email replies',
        'Auto categorization & tagging',
        'Detailed reports',
        'Outlook/Gmail integration'
      ],
      stats: { emails: '300B/day', users: '4B+', spam: '99.9%' }
    },
    sms: {
      name: 'SMS',
      nameAr: 'رسائل نصية',
      color: '#7C3AED',
      icon: '<path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-4.2-5.78v1.75l3.2-2.99L12.8 9v1.7c-3.11.43-4.35 2.56-4.8 4.7 1.11-1.5 2.58-2.18 4.8-2.18z"/>',
      features: isRTL ? [
        'SMS Gateway متكامل',
        'إرسال جماعي للرسائل',
        'رموز مخصصة للدولة',
        'جدولة الرسائل',
        'تقارير التسليم',
        'تكامل مع Twilio/Vonage'
      ] : [
        'Full SMS Gateway',
        'Bulk SMS sending',
        'Custom country codes',
        'Message scheduling',
        'Delivery reports',
        'Twilio/Vonage integration'
      ],
      stats: { messages: '5B/month', countries: '200+', delivery: '99.9%' }
    },
    api: {
      name: 'Custom API',
      nameAr: 'API مخصص',
      color: '#F59E0B',
      icon: '<path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>',
      features: isRTL ? [
        'RESTful API متكامل',
        'Webhooks في الوقت الحقيقي',
        'توثيق شامل',
        'SDK للغات متعددة',
        'دعم GraphQL',
        'أمان OAuth 2.0'
      ] : [
        'Full RESTful API',
        'Real-time webhooks',
        'Complete documentation',
        'Multi-language SDKs',
        'GraphQL support',
        'OAuth 2.0 security'
      ],
      stats: { requests: '10B/month', uptime: '99.99%', latency: '<50ms' }
    }
  };
  
  const ch = channels[channel];
  if (!ch) return '';
  
  const heroTitle = isRTL ? `أتمتة ${ch.nameAr} بالذكاء الاصطناعي` : `AI-Powered ${ch.name} Automation`;
  const heroDesc = isRTL ? `حلول ${ch.nameAr} متكاملة لخدمة عملاء أفضل وأسرع` : `Complete ${ch.name} solutions for better, faster customer service`;
  const title = isRTL ? `${ch.nameAr} | AutoFlow` : `${ch.name} | AutoFlow`;

  const bodyContent = `
    ${generateHeader(lang)}
    
    <!-- Hero -->
    <section class="pt-28 md:pt-40 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="${isRTL ? 'text-right' : 'text-left'}">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: ${ch.color}20;">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style="color: ${ch.color};">${ch.icon}</svg>
              </div>
              <span class="text-sm font-medium" style="color: ${ch.color};">${ch.name}</span>
            </div>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              <span class="gradient-text">${heroTitle}</span>
            </h1>
            <p class="text-xl text-gray-400 mb-8">${heroDesc}</p>
            <div class="flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}">
              <a href="/pricing/ar/" class="btn-gradient px-8 py-4 rounded-xl text-lg font-semibold text-center">${isRTL ? 'ابدأ الآن' : 'Get Started'}</a>
              <a href="https://wa.me/201099129550" target="_blank" class="border-2 px-8 py-4 rounded-xl text-lg font-semibold text-center text-gray-300 hover:bg-white/5" style="border-color: ${ch.color}40;">💬 WhatsApp</a>
            </div>
          </div>
          <div class="relative">
            <div class="glass rounded-2xl p-8 border" style="border-color: ${ch.color}20;">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 rounded-xl flex items-center justify-center" style="background: ${ch.color}20;">
                  <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" style="color: ${ch.color};">${ch.icon}</svg>
                </div>
                <div>
                  <h3 class="text-2xl font-bold">${ch.name}</h3>
                  <p class="text-gray-400">${isRTL ? 'قناة اتصال' : 'Communication Channel'}</p>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div class="bg-[#0a0a1a] rounded-xl p-4 text-center">
                  <p class="text-2xl font-bold gradient-text">${ch.stats.users}</p>
                  <p class="text-xs text-gray-400 mt-1">${isRTL ? 'مستخدمين' : 'Users'}</p>
                </div>
                <div class="bg-[#0a0a1a] rounded-xl p-4 text-center">
                  <p class="text-2xl font-bold gradient-text">${Object.values(ch.stats)[1]}</p>
                  <p class="text-xs text-gray-400 mt-1">${isRTL ? 'رسائل' : 'Messages'}</p>
                </div>
                <div class="bg-[#0a0a1a] rounded-xl p-4 text-center">
                  <p class="text-2xl font-bold gradient-text">${ch.stats.countries || ch.stats.websites || ch.stats.uptime || '99.9%'}</p>
                  <p class="text-xs text-gray-400 mt-1">${isRTL ? 'تغطية' : 'Coverage'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4">${isRTL ? 'مميزات ' + ch.nameAr : ch.name + ' Features'}</h2>
          <p class="text-gray-400">${isRTL ? 'اضغط على أي ميزة لمعرفة المزيد' : 'Click on any feature to learn more'}</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${ch.features.map((f, i) => `
          <a href="/channel/${channel}/feature/${i}/ar/" class="card-tech rounded-2xl p-6 block cursor-pointer group">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background: ${ch.color}20;">
              <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${ch.color};">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg">${f}</h3>
            <p class="text-gray-500 text-xs mt-2 flex items-center gap-1">
              ${isRTL ? 'اعرف المزيد' : 'Learn more'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </p>
          </a>
          `).join('')}
        </div>
      </div>
    </section>

    ${generatePricingSection(lang, ch.color)}
    
    ${generateCTASection(lang, isRTL ? 'جاهز تبدأ مع ' + ch.nameAr + '؟' : 'Ready to Start with ' + ch.name + '?', isRTL ? 'تواصل معنا النهاردة وخود استشارة مجانية' : 'Contact us today for a free consultation', ch.color)}
    
    ${generateFooter(lang)}
    
    ${generateWhatsAppFloat(lang)}
  `;

  return generateHTMLWrapper(lang, title, bodyContent);
}

module.exports = { generateChannelPage };