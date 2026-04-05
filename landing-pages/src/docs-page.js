// Comprehensive Documentation Page Generator for AutoFlow Landing Pages - SEO Enhanced

const docs = {
  ar: {
    sections: [
      {
        title: '🚀 البدء السريع',
        articles: [
          { slug: 'getting-started', title: 'البدء مع AutoFlow - دليلك الأول', readTime: '5 دقائق' },
          { slug: 'account-setup', title: 'إعداد الحساب وتخصيصه', readTime: '4 دقائق' },
          { slug: 'dashboard-overview', title: 'جولة في لوحة التحكم', readTime: '6 دقائق' },
          { slug: 'first-auto-reply', title: 'إنشاء أول رد تلقائي', readTime: '5 دقائق' },
          { slug: 'connect-whatsapp', title: 'توصيل واتس آب خطوة بخطوة', readTime: '4 دقائق' }
        ]
      },
      {
        title: '⚡ الردود التلقائية',
        articles: [
          { slug: 'auto-reply-basics', title: 'أساسيات الردود التلقائية', readTime: '7 دقائق' },
          { slug: 'keyword-matching', title: 'أنواع المطابقة: exact vs contains vs regex', readTime: '6 دقائق' },
          { slug: 'keyword-best-practices', title: 'أفضل ممارسات اختيار الكلمات المفتاحية', readTime: '5 دقائق' },
          { slug: 'auto-reply-templates', title: 'قوالب ردود جاهزة لكل نشاط', readTime: '8 دقائق' },
          { slug: 'fallback-responses', title: 'الردود البديلة عند عدم وجود تطابق', readTime: '4 دقائق' }
        ]
      },
      {
        title: '📝 القوالب والمتغيرات',
        articles: [
          { slug: 'templates-guide', title: 'دليل القوالب الشامل', readTime: '8 دقائق' },
          { slug: 'template-variables', title: 'المتغيرات وكيف استخدامها', readTime: '6 دقائق' },
          { slug: 'template-categories', title: 'تصنيفات القوالب وأفضل استخداماتها', readTime: '5 دقائق' },
          { slug: 'arabic-templates', title: 'نصائح لكتابة قوالب عربية فعالة', readTime: '6 دقائق' }
        ]
      },
      {
        title: '💬 المحادثات',
        articles: [
          { slug: 'conversations-overview', title: 'إدارة المحادثات', readTime: '5 دقائق' },
          { slug: 'conversation-status', title: 'حالات المحادثات ومعناها', readTime: '4 دقائق' },
          { slug: 'manual-reply', title: 'الرد اليدوي على العملاء', readTime: '4 دقائق' },
          { slug: 'conversation-assignment', title: 'توزيع المحادثات على الفريق', readTime: '5 دقائق' }
        ]
      },
      {
        title: '📊 التحليلات والتقارير',
        articles: [
          { slug: 'analytics-dashboard', title: 'فهم لوحة التحليلات', readTime: '7 دقائق' },
          { slug: 'performance-metrics', title: 'مقاييس الأداء الرئيسية', readTime: '6 دقائق' },
          { slug: 'export-reports', title: 'تصدير التقارير', readTime: '4 دقائق' },
          { slug: 'improve-response-time', title: 'تحسين وقت الرد', readTime: '5 دقائق' }
        ]
      },
      {
        title: '👥 الفريق والصلاحيات',
        articles: [
          { slug: 'team-invite', title: 'دعوة أعضاء الفريق', readTime: '4 دقائق' },
          { slug: 'roles-permissions', title: 'الأدوار والصلاحيات', readTime: '6 دقائق' },
          { slug: 'team-workflow', title: 'سير عمل الفريق', readTime: '5 دقائق' }
        ]
      },
      {
        title: '📱 القنوات',
        articles: [
          { slug: 'channels-overview', title: 'نظرة عامة على القنوات', readTime: '5 دقائق' },
          { slug: 'whatsapp-channel', title: 'إعداد قناة واتس آب', readTime: '6 دقائق' },
          { slug: 'channel-status', title: 'حالة القناة والأخطاء الشائعة', readTime: '5 دقائق' }
        ]
      },
      {
        title: '💳 الاشتراك والفواتير',
        articles: [
          { slug: 'pricing-plans', title: 'خطط الأسعار', readTime: '5 دقائق' },
          { slug: 'upgrade-downgrade', title: 'ترقية أو تخفيض الخطة', readTime: '4 دقائق' },
          { slug: 'payment-methods', title: 'طرق الدفع المتاحة', readTime: '5 دقائق' },
          { slug: 'invoices-history', title: 'سجل الفواتير', readTime: '4 دقائق' }
        ]
      },
      {
        title: '⚙️ الإعدادات',
        articles: [
          { slug: 'account-settings', title: 'إعدادات الحساب', readTime: '4 دقائق' },
          { slug: 'business-profile', title: 'ملف النشاط التجاري', readTime: '5 دقائق' },
          { slug: 'working-hours', title: 'ساعات العمل', readTime: '4 دقائق' },
          { slug: 'notifications-settings', title: 'إعدادات الإشعارات', readTime: '4 دقائق' }
        ]
      },
      {
        title: '🔒 الأمان والخصوصية',
        articles: [
          { slug: 'security-basics', title: 'أساسيات الأمان', readTime: '5 دقائق' },
          { slug: 'two-factor-auth', title: 'تفعيل المصادقة الثنائية', readTime: '4 دقائق' },
          { slug: 'data-privacy', title: 'خصوصية البيانات', readTime: '6 دقائق' },
          { slug: 'session-management', title: 'إدارة الجلسات', readTime: '4 دقائق' }
        ]
      },
      {
        title: '🔗 التكاملات',
        articles: [
          { slug: 'integrations-overview', title: 'نظرة عامة على التكاملات', readTime: '5 دقائق' },
          { slug: 'api-integration', title: 'تكامل API', readTime: '8 دقائق' },
          { slug: 'webhooks', title: 'إعداد Webhooks', readTime: '6 دقائق' },
          { slug: 'zapier-integration', title: 'تكامل Zapier', readTime: '7 دقائق' }
        ]
      },
      {
        title: '❓ استكشاف الأخطاء',
        articles: [
          { slug: 'common-errors', title: 'الأخطاء الشائعة وحلها', readTime: '7 دقائق' },
          { slug: 'whatsapp-disconnect', title: 'حل مشكلة انقطاع واتس آب', readTime: '5 دقائق' },
          { slug: 'auto-reply-not-working', title: 'الرد التلقائي لا يعمل', readTime: '4 دقائق' },
          { slug: 'support-contact', title: 'التواصل مع الدعم', readTime: '3 دقائق' }
        ]
      }
    ]
  },
  en: {
    sections: [
      {
        title: '🚀 Quick Start',
        articles: [
          { slug: 'getting-started', title: 'Getting Started with AutoFlow', readTime: '5 min' },
          { slug: 'dashboard-overview', title: 'Dashboard Overview', readTime: '6 min' },
          { slug: 'first-auto-reply', title: 'Creating Your First Auto-Reply', readTime: '5 min' },
          { slug: 'connect-whatsapp', title: 'Connecting WhatsApp Step by Step', readTime: '4 min' }
        ]
      },
      {
        title: '⚡ Auto-Replies',
        articles: [
          { slug: 'auto-reply-basics', title: 'Auto-Reply Basics', readTime: '7 min' },
          { slug: 'keyword-matching', title: 'Matching Types: exact vs contains vs regex', readTime: '6 min' },
          { slug: 'templates-guide', title: 'Template Guide', readTime: '8 min' }
        ]
      },
      {
        title: '💳 Subscription',
        articles: [
          { slug: 'pricing-plans', title: 'Pricing Plans', readTime: '5 min' },
          { slug: 'payment-methods', title: 'Available Payment Methods', readTime: '5 min' }
        ]
      },
      {
        title: '❓ Troubleshooting',
        articles: [
          { slug: 'common-errors', title: 'Common Errors and Solutions', readTime: '7 min' },
          { slug: 'support-contact', title: 'Contacting Support', readTime: '3 min' }
        ]
      }
    ]
  }
};

const docContent = {
  'getting-started': {
    ar: `
      <h2>مرحباً بك في AutoFlow!</h2>
      <p>AutoFlow منصة أتمتة اتصالات ذكية للنشاطات العربية. هذا الدليل سيساعدك على البدء في دقائق.</p>
      
      <h3>الخطوة 1: إنشاء حساب</h3>
      <p>سجل في AutoFlow من خلال:</p>
      <ol>
        <li>زيارة لوحة التحكم على <a href="http://52.249.222.161:8081">autoflow.com</a></li>
        <li>إدخال بريدك الإلكتروني وكلمة المرور</li>
        <li>تأكيد حسابك من الإيميل</li>
        <li>إكمال الإعدادات الأولية</li>
      </ol>
      
      <h3>الخطوة 2: توصيل واتس آب</h3>
      <p>بعد إنشاء الحساب:</p>
      <ol>
        <li>اذهب إلى "القنوات" في لوحة التحكم</li>
        <li>اضغط على "توصيل واتس آب"</li>
        <li>افتح واتس آب على هاتفك</li>
        <li>اذهب إلى الإعدادات > الأجهزة المرتبطة</li>
        <li>اضغط "ربط جهاز" وامسح كود QR</li>
        <li>انتظر التأكيد</li>
      </ol>
      
      <h3>الخطوة 3: إنشاء أول رد تلقائي</h3>
      <p>لإنشاء رد تلقائي:</p>
      <ol>
        <li>اذهب إلى "الردود التلقائية"</li>
        <li>اضغط "قاعدة جديدة"</li>
        <li>أدخل اسم القاعدة (مثل: "ترحيب")</li>
        <li>أضف الكلمات المفتاحية (مرحبا، السلام عليكم، hi)</li>
        <li>اكتب الرد: "أهلاً بك! كيف يمكنني مساعدتك؟"</li>
        <li>اختر نوع المطابقة: "يحتوي على"</li>
        <li>احفظ القاعدة</li>
      </ol>
      
      <h3>الخطوة 4: تخصيص الإعدادات</h3>
      <p>يمكنك:</p>
      <ul>
        <li>تحديث معلومات نشاطك من "الإعدادات"</li>
        <li>تعيين ساعات العمل</li>
        <li>إنشاء قوالب رسائل</li>
        <li>دعوة فريقك</li>
      </ul>
      
      <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mt-6">
        <h4 class="font-bold text-green-400">✅ تهانينا!</h4>
        <p>أكملت الإعدادات الأساسية. الآن يمكنك البدء في استقبال الردود التلقائية.</p>
      </div>
    `
  },
  'auto-reply-basics': {
    ar: `
      <h2>ما هي الردود التلقائية؟</h2>
      <p>الردود التلقائية تسمح لك بالرد على العملاء تلقائياً بناءً على كلمات مفتاحية في رسائلهم.</p>
      
      <h3>كيف تعمل؟</h3>
      <ol>
        <li>العميل يرسل رسالة</li>
        <li>AutoFlow يبحث عن كلمات مفتاحية</li>
        <li>إذا وجد تطابق، يرسل الرد التلقائي</li>
        <li>إذا لم يجد، يمكنه إرسال رد بديل أو تحويل للبشر</li>
      </ol>
      
      <h3>متى تستخدم الردود التلقائية؟</h3>
      <ul>
        <li>الأسئلة المتكررة (ساعات العمل، الأسعار، الموقع)</li>
        <li>الترحيب بالعملاء الجدد</li>
        <li>تأكيد الحجوزات والطلبات</li>
        <li>الردود خارج ساعات العمل</li>
      </ul>
      
      <h3>أفضل الممارسات</h3>
      <ol>
        <li>اجعل الردود قصيرة ومفيدة</li>
        <li>استخدم متغيرات لتخصيص الردود</li>
        <li>قدم خيارات للعميل</li>
        <li>راجع الأداء أسبوعياً</li>
        <li>حدث الردود عند تغيير الأسعار أو الخدمات</li>
      </ol>
    `
  },
  'keyword-matching': {
    ar: `
      <h2>أنواع المطابقة</h2>
      <p>AutoFlow يدعم 4 أنواع من المطابقة للكلمات المفتاحية:</p>
      
      <h3>1. مطابق تماماً (Exact)</h3>
      <p>الرسالة يجب أن تكون مطابقة 100% للكلمة المفتاحية.</p>
      <div class="bg-gray-800 rounded p-4">
        <p><strong>الكلمة:</strong> "سعر"</p>
        <p><strong>التطابق:</strong> ✅ "سعر" | ❌ "الأسعار" | ❌ "ما هو السعر"</p>
      </div>
      
      <h3>2. يحتوي على (Contains)</h3>
      <p>الرسالة تحتوي على الكلمة المفتاحية في أي مكان.</p>
      <div class="bg-gray-800 rounded p-4">
        <p><strong>الكلمة:</strong> "سعر"</p>
        <p><strong>التطابق:</strong> ✅ "سعر" | ✅ "الأسعار" | ✅ "ما هو السعر"</p>
      </div>
      
      <h3>3. يبدأ بـ (StartsWith)</h3>
      <p>الرسالة تبدأ بالكلمة المفتاحية.</p>
      <div class="bg-gray-800 rounded p-4">
        <p><strong>الكلمة:</strong> "مرحبا"</p>
        <p><strong>التطابق:</strong> ✅ "مرحبا بك" | ❌ "أهلا مرحبا" | ❌ "مرحب"</p>
      </div>
      
      <h3>4. نمط منتظم (Regex)</h3>
      <p>للمستخدمين المتقدمين - يسمح بأنماط معقدة.</p>
      <div class="bg-gray-800 rounded p-4">
        <p><strong>النمط:</strong> "^حجز\\s+\\d+"</p>
        <p><strong>التطابق:</strong> ✅ "حجز 5 أشخاص" | ✅ "حجز 2" | ❌ "أريد حجز"</p>
      </div>
      
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-6">
        <h4 class="font-bold text-blue-400">💡 نصيحة</h4>
        <p>استخدم "يحتوي على" للأسئلة العامة، و"مطابق تماماً" للكلمات المحددة.</p>
      </div>
    `
  },
  'pricing-plans': {
    ar: `
      <h2>خطط AutoFlow</h2>
      
      <h3>الخطة الأساسية - 2,000 جنيه/شهر</h3>
      <ul>
        <li>قناة واتس آب واحدة</li>
        <li>500 محادثة/شهر</li>
        <li>ردود تلقائية غير محدودة</li>
        <li>قوالب رسائل</li>
        <li>تقارير أساسية</li>
        <li>دعم بالإيميل</li>
      </ul>
      
      <h3>الخطة الاحترافية - 4,000 جنيه/شهر</h3>
      <ul>
        <li>3 قنوات</li>
        <li>2,000 محادثة/شهر</li>
        <li>ذكاء اصطناعي متقدم</li>
        <li>فريق من 5 مستخدمين</li>
        <li>رسائل جماعية</li>
        <li>تقارير متقدمة</li>
        <li>دعم أولوي</li>
      </ul>
      
      <h3>خطة المؤسسات - 8,000 جنيه/شهر</h3>
      <ul>
        <li>8 قنوات</li>
        <li>محادثات غير محدودة</li>
        <li>API مخصص</li>
        <li>فريق غير محدود</li>
        <li>تكامل مع أنظمتك</li>
        <li>مدير حساب مخصص</li>
        <li>دعم VIP 24/7</li>
      </ul>
      
      <h3>الخصومات</h3>
      <ul>
        <li><strong>سنوي:</strong> خصم 20%</li>
        <li><strong>إطلاق:</strong> خصم 60% أول 3 أشهر</li>
        <li><strong>إحالة:</strong> شهر مجاني لك ولصديقك</li>
      </ul>
    `
  }
};

function generateDocContent(slug, lang) {
  const isRTL = lang === 'ar';
  return docContent[slug]?.[lang] || docContent[slug]?.['ar'] || `
    <h2>${isRTL ? 'محتوى التوثيق' : 'Documentation Content'}</h2>
    <p>${isRTL ? 'هذا الدليل يساعدك على فهم الميزة واستخدامها بشكل فعال.' : 'This guide helps you understand and effectively use this feature.'}</p>
    
    <h3>${isRTL ? 'الخطوات' : 'Steps'}</h3>
    <ol>
      <li>${isRTL ? 'اذهب إلى لوحة التحكم' : 'Go to the dashboard'}</li>
      <li>${isRTL ? 'اختار الإعدادات المطلوبة' : 'Select the required settings'}</li>
      <li>${isRTL ? 'احفظ التغييرات' : 'Save changes'}</li>
    </ol>
    
    <p><a href="https://wa.me/201099129550" class="btn-primary">${isRTL ? 'تحتاج مساعدة؟' : 'Need help?'} →</a></p>
  `;
}

function generateDocsPage(lang) {
  const isRTL = lang === 'ar';
  const langDocs = docs[lang] || docs.ar;
  
  const sectionsHTML = langDocs.sections.map(section => `
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-3xl">${section.title.split(' ')[0]}</span>
        <h2 class="text-2xl font-bold">${section.title.substring(section.title.indexOf(' ') + 1)}</h2>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${section.articles.map(article => `
          <a href="/docs/${article.slug}/${lang}/" class="card-tech rounded-xl p-5 hover:scale-105 transition-transform block">
            <h3 class="font-bold mb-2">${article.title}</h3>
            <p class="text-gray-400 text-sm flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              ${article.readTime}
            </p>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    ${generateHeader(lang, 'docs')}
    
    <main class="pt-24 pb-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <!-- Hero -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-black mb-4">${isRTL ? 'مركز التوثيق' : 'Documentation Center'}</h1>
          <p class="text-xl text-gray-400">${isRTL ? 'كل ما تحتاج معرفته عن AutoFlow' : 'Everything you need to know about AutoFlow'}</p>
        </div>
        
        <!-- Search -->
        <div class="max-w-xl mx-auto mb-12">
          <input type="text" placeholder="${isRTL ? 'ابحث في التوثيق...' : 'Search documentation...'}" class="w-full bg-dark-800 border border-dark-600 rounded-xl py-4 px-6 text-lg focus:border-primary-500 outline-none">
        </div>
        
        <!-- Sections -->
        ${sectionsHTML}
        
        <!-- Help CTA -->
        <div class="glass rounded-2xl p-8 text-center mt-12">
          <h3 class="text-2xl font-bold mb-4">${isRTL ? 'محتاج مساعدة؟' : 'Need Help?'}</h3>
          <p class="text-gray-400 mb-6">${isRTL ? 'فريقنا جاهز لمساعدتك' : 'Our team is ready to help'}</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/201099129550" target="_blank" class="btn-gradient px-6 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              واتس آب
            </a>
            <a href="mailto:mostafa@rawash.com" class="border border-gray-600 px-6 py-3 rounded-xl font-semibold text-gray-300 hover:border-primary-500 hover:text-white inline-flex items-center justify-center">
              ${isRTL ? 'إيميل' : 'Email'}
            </a>
          </div>
        </div>
      </div>
    </main>
    
    ${generateFooter(lang)}
    ${generateWhatsAppFloat()}
  `;
}

function generateDocDetailPage(slug, lang) {
  const isRTL = lang === 'ar';
  const langDocs = docs[lang] || docs.ar;
  
  let article = null;
  let sectionTitle = '';
  langDocs.sections.forEach(section => {
    const found = section.articles.find(a => a.slug === slug);
    if (found) {
      article = found;
      sectionTitle = section.title;
    }
  });
  
  if (!article) return '';

  return `
    ${generateHeader(lang, 'docs')}
    
    <main class="pt-24 pb-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <a href="/${lang}/" class="hover:text-white">${isRTL ? 'الرئيسية' : 'Home'}</a>
          <span>/</span>
          <a href="/docs/${lang}/" class="hover:text-white">${isRTL ? 'التوثيق' : 'Docs'}</a>
          <span>/</span>
          <span class="text-gray-300">${article.title}</span>
        </div>
        
        <!-- Doc Content -->
        <article class="glass rounded-2xl p-8">
          <h1 class="text-3xl md:text-4xl font-black mb-8">${article.title}</h1>
          <div class="prose prose-invert max-w-none">
            ${generateDocContent(slug, lang)}
          </div>
        </article>
        
        <!-- Navigation -->
        <div class="mt-8 flex justify-between">
          <a href="/docs/${lang}/" class="btn-secondary px-6 py-3 rounded-xl">
            ← ${isRTL ? 'العودة للتوثيق' : 'Back to Docs'}
          </a>
          <a href="https://wa.me/201099129550" target="_blank" class="btn-primary px-6 py-3 rounded-xl">
            ${isRTL ? 'سؤال؟' : 'Question?'}
          </a>
        </div>
      </div>
    </main>
    
    ${generateFooter(lang)}
    ${generateWhatsAppFloat()}
  `;
}

function generateDocsRoutes() {
  const routes = [];
  
  // Main docs pages
  routes.push({
    path: 'docs/ar/index.html',
    content: generateHTMLWrapper(generateDocsPage('ar'))
  });
  routes.push({
    path: 'docs/en/index.html',
    content: generateHTMLWrapper(generateDocsPage('en'))
  });
  
  // Individual doc pages
  Object.keys(docs).forEach(lang => {
    docs[lang].sections.forEach(section => {
      section.articles.forEach(article => {
        routes.push({
          path: `docs/${article.slug}/${lang}/index.html`,
          content: generateHTMLWrapper(generateDocDetailPage(article.slug, lang))
        });
      });
    });
  });
  
  return routes;
}

// Import shared components
const { generateHeader, generateFooter, generateWhatsAppFloat, generateHTMLWrapper } = require('./components/shared-components');

module.exports = {
  generateDocsPage,
  generateDocDetailPage,
  generateDocsRoutes,
  docs
};