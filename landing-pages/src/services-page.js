// Services page generator
function generateServicesPage(lang) {
  const isRTL = lang === 'ar';
  const t = {
    title: isRTL ? 'خدماتنا | AutoFlow' : 'Our Services | AutoFlow',
    home: isRTL ? 'الرئيسية' : 'Home',
    services: isRTL ? 'الخدمات' : 'Services',
    heroTitle: isRTL ? 'خدمات اتصال شاملة' : 'Comprehensive Communication Services',
    heroSubtitle: isRTL ? 'حلول متكاملة لكل احتياجاتك' : 'Complete solutions for all your needs',
    
    // Service Categories
    omnichannel: {
      title: isRTL ? 'منصة متعددة القنوات' : 'Omnichannel Platform',
      desc: isRTL ? 'واجه كل عملائك من مكان واحد مهما كانت قناة التواصل' : 'Reach all customers from one place regardless of communication channel',
      features: [
        isRTL ? '💬 WhatsApp Business API' : '💬 WhatsApp Business API',
        isRTL ? '📘 Facebook Messenger' : '📘 Facebook Messenger',
        isRTL ? '📸 Instagram Direct' : '📸 Instagram Direct',
        isRTL ? '🐦 Telegram Bot' : '🐦 Telegram Bot',
        isRTL ? '💬 Live Chat Widget' : '💬 Live Chat Widget',
        isRTL ? '📧 Email Integration' : '📧 Email Integration',
        isRTL ? '📱 SMS Gateway' : '📱 SMS Gateway'
      ]
    },
    
    automation: {
      title: isRTL ? 'أتمتة ذكية بالذكاء الاصطناعي' : 'AI-Powered Automation',
      desc: isRTL ? 'ردود تلقائية ذكية تفهم العملاء وتخدمهم أحسن خدمة' : 'Smart auto-replies that understand customers and serve them best',
      features: [
        isRTL ? '🤖 فهم طبيعي للغة العربية' : '🤖 Natural Arabic Language Understanding',
        isRTL ? '⚡ ردود فورية في أقل من ثانية' : '⚡ Instant replies under 1 second',
        isRTL ? '🎯 تصنيف نوايا العملاء' : '🎯 Customer intent classification',
        isRTL ? '📅 حجوزات تلقائية' : '📅 Automatic booking',
        isRTL ? '🔄 توجيه ذكي للموظفين' : '🔄 Smart routing to staff',
        isRTL ? '📊 تحليل مشاعر العملاء' : '📊 Sentiment analysis'
      ]
    },
    
    dashboard: {
      title: isRTL ? 'لوحة تحكم متقدمة' : 'Advanced Dashboard',
      desc: isRTL ? 'تابع كل شيء من مكان واحد مع تقارير وتحليلات شاملة' : 'Track everything from one place with comprehensive reports',
      features: [
        isRTL ? '📈 إحصائيات في الوقت الحقيقي' : '📈 Real-time statistics',
        isRTL ? '🔍 سجل كامل للمحادثات' : '🔍 Complete conversation history',
        isRTL ? '👥 إدارة فريق موحدة' : '👥 Unified team management',
        isRTL ? '🔔 إشعارات ذكية' : '🔔 Smart notifications',
        isRTL ? '📊 تقارير قابلة للتصدير' : '📊 Exportable reports',
        isRTL ? '⏰ ساعات العمل المرنة' : '⏰ Flexible working hours'
      ]
    },
    
    integrations: {
      title: isRTL ? 'تكاملات لا نهائية' : 'Unlimited Integrations',
      desc: isRTL ? 'اربط مع كل أنظمتك وأدواتك المفضلة بسهولة' : 'Easily connect with all your favorite systems and tools',
      features: [
        isRTL ? '📊 Google Sheets' : '📊 Google Sheets',
        isRTL ? '📅 Google Calendar' : '📅 Google Calendar',
        isRTL ? '🛒 Shopify & WooCommerce' : '🛒 Shopify & WooCommerce',
        isRTL ? '💳 Payment Gateways' : '💳 Payment Gateways',
        isRTL ? '📧 Email Marketing' : '📧 Email Marketing',
        isRTL ? '🔄 Zapier & Make' : '🔄 Zapier & Make',
        isRTL ? '🔗 API مفتوح' : '🔗 Open API'
      ]
    },
    
    export: {
      title: isRTL ? 'تصدير بيانات متعدد' : 'Multi-Format Data Export',
      desc: isRTL ? 'صدّر بياناتك بالصيغة اللي تناسبك' : 'Export your data in the format that suits you',
      features: [
        isRTL ? '📊 Excel & CSV' : '📊 Excel & CSV',
        isRTL ? '📄 تقارير PDF' : '📄 PDF Reports',
        isRTL ? '🔗 JSON & XML' : '🔗 JSON & XML',
        isRTL ? '📧 Email Reports' : '📧 Email Reports',
        isRTL ? '⏰ جدولة تلقائية' : '⏰ Automatic scheduling'
      ]
    },
    
    support: {
      title: isRTL ? 'دعم فني متميز' : 'Premium Technical Support',
      desc: isRTL ? 'فريق دعم متخصص جاهز يساعدك في أي وقت' : 'Dedicated support team ready to help you anytime',
      features: [
        isRTL ? '💬 دعم عبر الواتس آب' : '💬 WhatsApp Support',
        isRTL ? '📧 دعم بالإيميل' : '📧 Email Support',
        isRTL ? '📞 دعم هاتفي' : '📞 Phone Support',
        isRTL ? '📚 توثيق شامل' : '📚 Complete Documentation',
        isRTL ? '🎥 فيديوهات تعليمية' : '🎥 Tutorial Videos',
        isRTL ? '🔧 مساعدة في الإعداد' : '🔧 Setup Assistance'
      ]
    },
    
    cta: {
      title: isRTL ? 'جاهز تبدأ؟' : 'Ready to Start?',
      subtitle: isRTL ? 'تواصل معنا النهاردة وخود استشارة مجانية' : 'Contact us today for a free consultation',
      btn: isRTL ? 'تواصل معنا' : 'Contact Us'
    }
  };

  const dir = isRTL ? 'rtl' : 'ltr';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    ${isRTL ? 'body { font-family: "Cairo", sans-serif; }' : 'body { font-family: "Inter", sans-serif; }'}
    .gradient-text { background: linear-gradient(135deg, #00D4AA, #7C3AED, #F59E0B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-size: 200% 200%; animation: gradient 3s ease infinite; }
    @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
    .glass-dark { background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .card-tech { background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s; }
    .card-tech:hover { transform: translateY(-4px); border-color: rgba(0,212,170,0.2); box-shadow: 0 20px 40px rgba(0,212,170,0.1); }
    .btn-gradient { background: linear-gradient(135deg, #00D4AA, #00B894); transition: all 0.3s; }
    .btn-gradient:hover { box-shadow: 0 10px 30px rgba(0,212,170,0.3); transform: translateY(-2px); }
    .tech-grid { background-image: linear-gradient(rgba(0,212,170,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.02) 1px, transparent 1px); background-size: 40px 40px; }
    @media (max-width: 768px) { .btn-gradient { min-height: 48px; } }
  </style>
</head>
<body class="bg-[#0a0a1a] text-white overflow-x-hidden">
  <div class="fixed inset-0 -z-10"><div class="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]"></div><div class="absolute inset-0 tech-grid opacity-50"></div></div>
  
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
        <nav class="hidden md:flex items-center gap-6">
          <a href="/" class="text-sm text-gray-400 hover:text-[#00D4AA]">${t.home}</a>
          <a href="/services/${lang}/" class="text-sm text-[#00D4AA]">${t.services}</a>
          <a href="/pricing/${lang}/" class="text-sm text-gray-400 hover:text-[#00D4AA]">${isRTL ? 'الأسعار' : 'Pricing'}</a>
          <a href="mailto:mostafa@rawash.com" class="btn-gradient px-5 py-2 rounded-lg text-sm font-medium text-white">${isRTL ? 'تواصل' : 'Contact'}</a>
        </nav>
      </div>
    </div>
  </header>

  <!-- Hero -->
  <section class="pt-28 md:pt-36 pb-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
        <span class="gradient-text">${t.heroTitle}</span>
      </h1>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto">${t.heroSubtitle}</p>
    </div>
  </section>

  <!-- Services -->
  <section class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Omnichannel -->
        <div class="card-tech rounded-2xl p-6 md:p-8">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00D4AA]/20 to-[#7C3AED]/20 flex items-center justify-center mb-6">
            <span class="text-4xl">💬</span>
          </div>
          <h2 class="text-2xl font-bold mb-3">${t.omnichannel.title}</h2>
          <p class="text-gray-400 mb-6">${t.omnichannel.desc}</p>
          <ul class="space-y-2">
            ${t.omnichannel.features.map(f => `<li class="text-sm text-gray-300 flex items-center gap-2">${f}</li>`).join('')}
          </ul>
        </div>

        <!-- Automation -->
        <div class="card-tech rounded-2xl p-6 md:p-8">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-[#00D4AA]/20 flex items-center justify-center mb-6">
            <span class="text-4xl">🤖</span>
          </div>
          <h2 class="text-2xl font-bold mb-3">${t.automation.title}</h2>
          <p class="text-gray-400 mb-6">${t.automation.desc}</p>
          <ul class="space-y-2">
            ${t.automation.features.map(f => `<li class="text-sm text-gray-300 flex items-center gap-2">${f}</li>`).join('')}
          </ul>
        </div>

        <!-- Dashboard -->
        <div class="card-tech rounded-2xl p-6 md:p-8">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#00D4AA]/20 flex items-center justify-center mb-6">
            <span class="text-4xl">📊</span>
          </div>
          <h2 class="text-2xl font-bold mb-3">${t.dashboard.title}</h2>
          <p class="text-gray-400 mb-6">${t.dashboard.desc}</p>
          <ul class="space-y-2">
            ${t.dashboard.features.map(f => `<li class="text-sm text-gray-300 flex items-center gap-2">${f}</li>`).join('')}
          </ul>
        </div>

        <!-- Integrations -->
        <div class="card-tech rounded-2xl p-6 md:p-8">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00D4AA]/20 to-[#F59E0B]/20 flex items-center justify-center mb-6">
            <span class="text-4xl">🔗</span>
          </div>
          <h2 class="text-2xl font-bold mb-3">${t.integrations.title}</h2>
          <p class="text-gray-400 mb-6">${t.integrations.desc}</p>
          <ul class="space-y-2">
            ${t.integrations.features.map(f => `<li class="text-sm text-gray-300 flex items-center gap-2">${f}</li>`).join('')}
          </ul>
        </div>

        <!-- Export -->
        <div class="card-tech rounded-2xl p-6 md:p-8">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-[#F59E0B]/20 flex items-center justify-center mb-6">
            <span class="text-4xl">📤</span>
          </div>
          <h2 class="text-2xl font-bold mb-3">${t.export.title}</h2>
          <p class="text-gray-400 mb-6">${t.export.desc}</p>
          <ul class="space-y-2">
            ${t.export.features.map(f => `<li class="text-sm text-gray-300 flex items-center gap-2">${f}</li>`).join('')}
          </ul>
        </div>

        <!-- Support -->
        <div class="card-tech rounded-2xl p-6 md:p-8">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#7C3AED]/20 flex items-center justify-center mb-6">
            <span class="text-4xl">🛠️</span>
          </div>
          <h2 class="text-2xl font-bold mb-3">${t.support.title}</h2>
          <p class="text-gray-400 mb-6">${t.support.desc}</p>
          <ul class="space-y-2">
            ${t.support.features.map(f => `<li class="text-sm text-gray-300 flex items-center gap-2">${f}</li>`).join('')}
          </ul>
        </div>

      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <div class="glass rounded-2xl p-8 md:p-12 border border-[#00D4AA]/20">
        <h2 class="text-3xl md:text-4xl font-black mb-4">${t.cta.title}</h2>
        <p class="text-xl text-gray-400 mb-8">${t.cta.subtitle}</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="mailto:mostafa@rawash.com" class="btn-gradient px-8 py-4 rounded-xl text-lg font-semibold">${t.cta.btn}</a>
          <a href="https://wa.me/201099129550" target="_blank" class="border-2 border-[#00D4AA]/40 px-8 py-4 rounded-xl text-lg font-semibold text-gray-300 hover:bg-[#00D4AA]/10">💬 WhatsApp</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-12 border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p class="text-gray-500 text-sm">© ${new Date().getFullYear()} AutoFlow by Ensoulify. ${isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
    </div>
  </footer>

  <!-- WhatsApp Float -->
  <a href="https://wa.me/201099129550" target="_blank" class="fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-bounce" style="animation-duration: 2s;">
    <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    </svg>
  </a>
</body>
</html>`;
}

module.exports = { generateServicesPage };