// Comprehensive Articles Page Generator for AutoFlow Landing Pages - SEO Enhanced

const articles = {
  ar: [
    // Getting Started Series
    {
      slug: 'whatsapp-automation-guide',
      title: 'دليل أتمتة واتس آب الشامل للمبتدئين',
      excerpt: 'تعلم كيف تقلل وقت الردود بنسبة 80% وتزيد المبيعات باستخدام الردود التلقائية في واتس آب',
      category: 'تعليمي',
      date: '2026-04-05',
      readTime: '8 دقائق',
      image: '📱',
      keywords: ['واتس آب', 'أتمتة', 'ردود تلقائية', 'ذكاء اصطناعي']
    },
    {
      slug: 'whatsapp-business-vs-personal',
      title: 'واتس آب بزنس vs واتس آب شخصي: أيهما أنسب لنشاطك؟',
      excerpt: 'مقارنة شاملة بين واتس آب بزنس وواتس آب الشخصي من حيث المميزات والأسعار والاستخدامات',
      category: 'مقارنات',
      date: '2026-04-04',
      readTime: '6 دقائق',
      image: '⚖️',
      keywords: ['واتس آب بزنس', 'واتس آب شخصي', 'أعمال', 'مقارنة']
    },
    {
      slug: 'whatsapp-api-vs-automation',
      title: 'واتس آب API vs أدوات الأتمتة: ما الفرق؟',
      excerpt: 'فهم الفرق بين واتس آب API Business وأدوات الأتمتة مثل AutoFlow',
      category: 'تقني',
      date: '2026-04-03',
      readTime: '7 دقائق',
      image: '🔌',
      keywords: ['API', 'أتمتة', 'تكامل', 'برمجة']
    },
    
    // Industry-Specific Guides
    {
      slug: 'restaurant-whatsapp-guide',
      title: 'دليل المطاعم: كيف تستخدم واتس آب لزيادة الحجوزات',
      excerpt: '10 استراتيجيات عملية للمطاعم لتقليل المكالمات وزيادة الحجوزات عبر واتس آب',
      category: 'مطاعم',
      date: '2026-04-02',
      readTime: '9 دقائق',
      image: '🍽️',
      keywords: ['مطعم', 'حجز', 'واتس آب', 'طلبات']
    },
    {
      slug: 'clinic-whatsapp-management',
      title: 'إدارة مرضى العيادات عبر واتس آب: دليل شامل',
      excerpt: 'نظام ذكي لحجز المواعيد، تذكير المرضى، ومتابعة الزيارات تلقائياً',
      category: 'عيادات',
      date: '2026-04-01',
      readTime: '8 دقائق',
      image: '🏥',
      keywords: ['عيادة', 'مرضى', 'حجز مواعيد', 'تذكير']
    },
    {
      slug: 'ecommerce-whatsapp-sales',
      title: 'زيادة مبيعات المتاجر الإلكترونية عبر واتس آب',
      excerpt: 'استراتيجيات تحويل الاستفسارات إلى مبيعات وإنهاء السلة المهجورة',
      category: 'تجارة إلكترونية',
      date: '2026-03-31',
      readTime: '10 دقائق',
      image: '🛒',
      keywords: ['تجارة إلكترونية', 'مبيعات', 'سلة مهجورة', 'تحويل']
    },
    {
      slug: 'realestate-whatsapp-leads',
      title: 'توليد وإدارة عملاء العقارات عبر واتس آب',
      excerpt: 'كيف تحول الاستفسارات إلى عملاء فعليين في سوق العقارات',
      category: 'عقارات',
      date: '2026-03-30',
      readTime: '7 دقائق',
      image: '🏠',
      keywords: ['عقارات', 'عملاء', 'توليد عملاء', 'بيع']
    },
    {
      slug: 'lawyer-whatsapp-consultations',
      title: 'إدارة الاستشارات القانونية عبر واتس آب',
      excerpt: 'نظام ذكي للمحامين للرد على الاستفسارات وحجز المواعيد',
      category: 'محاماة',
      date: '2026-03-29',
      readTime: '6 دقائق',
      image: '⚖️',
      keywords: ['محامي', 'استشارة', 'قانون', 'حجز']
    },
    {
      slug: 'service-business-whatsapp',
      title: 'أتمتة خدماتك المهنية عبر واتس آب',
      excerpt: 'دليل للخدمات المهنية: صيانة، تنظيف، نقل، وغيرها',
      category: 'خدمات',
      date: '2026-03-28',
      readTime: '7 دقائق',
      image: '🔧',
      keywords: ['خدمات', 'صيانة', 'أتمتة', 'حجز']
    },
    {
      slug: 'education-whatsapp-courses',
      title: 'إدارة الطلبات والطلاب للمراكز التعليمية',
      excerpt: 'كيف تدير استفسارات الطلاب وتسجيل الدورات تلقائياً',
      category: 'تعليم',
      date: '2026-03-27',
      readTime: '6 دقائق',
      image: '📚',
      keywords: ['تعليم', 'دورات', 'طلاب', 'تسجيل']
    },
    
    // Sales & Marketing
    {
      slug: 'increase-sales-whatsapp',
      title: 'زيادة المبيعات عبر واتس آب: 15 استراتيجية مجربة',
      excerpt: 'استراتيجيات عملية لتحويل المحادثات إلى مبيعات فعلية وزيادة الإيرادات',
      category: 'مبيعات',
      date: '2026-03-26',
      readTime: '12 دقائق',
      image: '💰',
      keywords: ['مبيعات', 'إيرادات', 'تحويل', 'استراتيجية']
    },
    {
      slug: 'whatsapp-marketing-campaigns',
      title: 'حملات واتس آب التسويقية: من الفكرة للتنفيذ',
      excerpt: 'دليل تشغيل حملات تسويقية ناجحة عبر واتس آب بدون إزعاج العملاء',
      category: 'تسويق',
      date: '2026-03-25',
      readTime: '9 دقائق',
      image: '📢',
      keywords: ['تسويق', 'حملات', 'واتس آب', 'عملاء']
    },
    {
      slug: 'broadcast-messages-best-practices',
      title: 'أفضل ممارسات الرسائل الجماعية في واتس آب',
      excerpt: 'كيف ترسل رسائل جماعية فعالة بدون حظر أو إزعاج',
      category: 'تسويق',
      date: '2026-03-24',
      readTime: '7 دقائق',
      image: '📨',
      keywords: ['رسائل جماعية', 'حظر', 'تسويق', 'واتس آب']
    },
    
    // Customer Experience
    {
      slug: 'customer-support-automation',
      title: 'أتمتة خدمة العملاء: دليل تقليل وقت الرد',
      excerpt: 'كيف تقلل وقت الرد من ساعات إلى ثواني مع الحفاظ على جودة الخدمة',
      category: 'خدمة عملاء',
      date: '2026-03-23',
      readTime: '8 دقائق',
      image: '🎯',
      keywords: ['خدمة عملاء', 'وقت رد', 'أتمتة', 'رضا']
    },
    {
      slug: 'whatsapp-response-time',
      title: 'لماذا وقت الرد السريع مهم؟ إحصائيات وأرقام',
      excerpt: 'إحصائيات عن تأثير وقت الرد على معدل التحويل ورضا العملاء',
      category: 'إحصائيات',
      date: '2026-03-22',
      readTime: '5 دقائق',
      image: '⏱️',
      keywords: ['وقت رد', 'إحصائيات', 'تحويل', 'رضا عملاء']
    },
    {
      slug: 'customer-satisfaction-whatsapp',
      title: 'زيادة رضا العملاء عبر الردود التلقائية الذكية',
      excerpt: 'كيف تجعل الردود التلقائية تشعر العملاء بأنهم يتعاملون مع بشري',
      category: 'رضا عملاء',
      date: '2026-03-21',
      readTime: '6 دقائق',
      image: '😊',
      keywords: ['رضا عملاء', 'ردود تلقائية', 'تجربة', 'ذكاء']
    },
    
    // Technical Guides
    {
      slug: 'whatsapp-qr-code-setup',
      title: 'توصيل واتس آب عبر كود QR: دليل خطوة بخطوة',
      excerpt: 'شرح مفصل لتوصيل واتس آب بالأتمتة عبر مسح كود QR',
      category: 'تقني',
      date: '2026-03-20',
      readTime: '5 دقائق',
      image: '📱',
      keywords: ['QR', 'توصيل', 'واتس آب', 'إعداد']
    },
    {
      slug: 'whatsapp-session-management',
      title: 'إدارة جلسات واتس آب: نصائح للحفاظ على الاتصال',
      excerpt: 'كيف تحافظ على اتصال واتس آب مستقر بدون انقطاع',
      category: 'تقني',
      date: '2026-03-19',
      readTime: '6 دقائق',
      image: '🔌',
      keywords: ['جلسة', 'اتصال', 'استقرار', 'واتس آب']
    },
    {
      slug: 'keywords-setup-guide',
      title: 'إعداد الكلمات المفتاحية للردود التلقائية',
      excerpt: 'دليل اختيار الكلمات المفتاحية الصحيحة لتفعيل الردود التلقائية',
      category: 'تعليمي',
      date: '2026-03-18',
      readTime: '7 دقائق',
      image: '🔑',
      keywords: ['كلمات مفتاحية', 'ردود تلقائية', 'إعداد', 'تفعيل']
    },
    
    // ROI & Business
    {
      slug: 'whatsapp-roi-calculator',
      title: 'حساب العائد من الاستثمار في أتمتة واتس آب',
      excerpt: 'كيف تحسب توفير الوقت والمال من استخدام أدوات الأتمتة',
      category: 'أعمال',
      date: '2026-03-17',
      readTime: '8 دقائق',
      image: '📊',
      keywords: ['ROI', 'عائد', 'توفير', 'استثمار']
    },
    {
      slug: 'cost-saving-whatsapp',
      title: 'توفير التكاليف عبر أتمتة واتس آب: دراسات حالة',
      excerpt: 'قصص واقعية لأصحاب نشاطات وفرت وقت ومال باستخدام AutoFlow',
      category: 'دراسات حالة',
      date: '2026-03-16',
      readTime: '9 دقائق',
      image: '💡',
      keywords: ['توفير', 'تكاليف', 'قصص', 'نجاح']
    },
    {
      slug: 'small-business-whatsapp',
      title: 'دليل النشاطات الصغيرة: كيف تبدأ بأتمتة واتس آب',
      excerpt: 'نصائح للنشاطات الصغيرة وريادات الأعمال للبدء بالأتمتة',
      category: 'ريادة أعمال',
      date: '2026-03-15',
      readTime: '6 دقائق',
      image: '🚀',
      keywords: ['نشاط صغير', 'ريادة', 'أتمتة', 'بداية']
    },
    
    // Arabic Content
    {
      slug: 'arabic-whatsapp-templates',
      title: 'نماذج رسائل واتس آب بالعربية لكل المناسات',
      excerpt: 'مجموعة من نماذج الردود الجاهزة بالعربية لاستخدامها في الردود التلقائية',
      category: 'قوالب',
      date: '2026-03-14',
      readTime: '10 دقائق',
      image: '📝',
      keywords: ['عربية', 'قوالب', 'رسائل', 'ردود']
    },
    {
      slug: 'egyptian-dialect-whatsapp',
      title: 'استخدام اللهجة المصرية في ردود واتس آب',
      excerpt: 'لماذا اللهجة المصرية فعالة أكثر في التواصل مع العملاء المصريين',
      category: 'لغة',
      date: '2026-03-13',
      readTime: '5 دقائق',
      image: '🇪🇬',
      keywords: ['مصر', 'لهجة', 'عربية', 'تواصل']
    },
    
    // Comparison Articles
    {
      slug: 'autoflow-vs-competitors',
      title: 'AutoFlow vs المنافسين: مقارنة شاملة',
      excerpt: 'مقارنة AutoFlow مع أدوات أتمتة واتس آب الأخرى من حيث المميزات والسعر',
      category: 'مقارنات',
      date: '2026-03-12',
      readTime: '10 دقائق',
      image: '⚖️',
      keywords: ['AutoFlow', 'منافسين', 'مقارنة', 'أدوات']
    },
    {
      slug: 'automation-vs-call-center',
      title: 'الأتمتة الذكية vs مركز الاتصال التقليدي',
      excerpt: 'مقارنة تكاليف وفوائد الأتمتة مقابل توظيف فريق ردود',
      category: 'مقارنات',
      date: '2026-03-11',
      readTime: '7 دقائق',
      image: '🏢',
      keywords: ['أتمتة', 'مركز اتصال', 'تكاليف', 'فريق']
    }
  ],
  en: [
    {
      slug: 'whatsapp-automation-guide',
      title: 'Complete Guide to WhatsApp Automation for Beginners',
      excerpt: 'Learn how to reduce response time by 80% and increase sales with WhatsApp auto-replies',
      category: 'Tutorial',
      date: '2026-04-05',
      readTime: '8 min',
      image: '📱',
      keywords: ['WhatsApp', 'automation', 'auto-reply', 'AI']
    },
    {
      slug: 'whatsapp-business-api-guide',
      title: 'WhatsApp Business API: Complete Implementation Guide',
      excerpt: 'Everything you need to know about WhatsApp Business API and automation tools',
      category: 'Technical',
      date: '2026-04-04',
      readTime: '10 min',
      image: '🔌',
      keywords: ['API', 'Business', 'integration', 'automation']
    },
    {
      slug: 'increase-sales-whatsapp',
      title: 'Increase Sales Through WhatsApp: 15 Proven Strategies',
      excerpt: 'Practical strategies to convert conversations into actual sales',
      category: 'Sales',
      date: '2026-04-03',
      readTime: '12 min',
      image: '💰',
      keywords: ['sales', 'revenue', 'conversion', 'strategy']
    },
    {
      slug: 'customer-support-automation',
      title: 'Automating Customer Support: Complete Guide',
      excerpt: 'How to reduce response time from hours to seconds while maintaining quality',
      category: 'Support',
      date: '2026-04-02',
      readTime: '8 min',
      image: '🎯',
      keywords: ['support', 'response time', 'automation', 'satisfaction']
    },
    {
      slug: 'restaurant-whatsapp-guide',
      title: 'Restaurant Guide: Using WhatsApp to Increase Reservations',
      excerpt: '10 practical strategies for restaurants to reduce calls and increase bookings',
      category: 'Restaurant',
      date: '2026-04-01',
      readTime: '9 min',
      image: '🍽️',
      keywords: ['restaurant', 'reservation', 'WhatsApp', 'orders']
    }
  ]
};

const articleContent = {
  'whatsapp-automation-guide': {
    ar: `
      <h2>ما هي أتمتة واتس آب؟</h2>
      <p>أتمتة واتس آب تعني استخدام برامج الذكاء الاصطناعي للرد تلقائياً على رسائل العملاء بدون تدخل بشري. هذا يوفر عليك ساعات من العمل اليومي ويزيد رضا العملاء.</p>
      
      <h3>لماذا تحتاج أتمتة واتس آب؟</h3>
      <ul>
        <li><strong>توفير الوقت:</strong> لا حاجة للرد على نفس السؤال 100 مرة - توفير 3-5 ساعات يومياً</li>
        <li><strong>ردود أسرع:</strong> العملاء يحصلون على رد في ثواني بدلاً من ساعات - زيادة رضا العملاء بـ 40%</li>
        <li><strong>خدمة 24/7:</strong> النظام يعمل حتى وأنت نايم - لا تفوتك فرص بيع</li>
        <li><strong>زيادة المبيعات:</strong> ردود سريعة تعني عملاء أسعد ومبيعات أكثر بـ 30%</li>
        <li><strong>تقليل التكاليف:</strong> لا حاجة لتوظيف فريق ردود إضافي</li>
      </ul>
      
      <h3>كيف تبدأ؟</h3>
      <p>ابدأ بتحديد الأسئلة الأكثر تكراراً من عملائك. ثم أنشئ ردود تلقائية لهذه الأسئلة. AutoFlow يجعل هذه العملية سهلة جداً:</p>
      <ol>
        <li>سجل في AutoFlow</li>
        <li>وصل واتس آب الخاص بك</li>
        <li>أنشئ قواعد الرد التلقائي</li>
        <li>اختبر وحسّن</li>
      </ol>
      
      <h3>أفضل الممارسات</h3>
      <ol>
        <li>اجعل الردود شخصية قدر الإمكان - استخدم اسم العميل</li>
        <li>قدم خيارات واضحة للعملاء</li>
        <li>استخدم اللهجة المصرية للعملاء المصريين</li>
        <li>راقب الأداء وحسّن باستمرار</li>
        <li>حول للبشر عند الحاجة</li>
      </ol>
      
      <h3>نتائج حقيقية</h3>
      <p>أصحاب النشاطات الذين استخدموا AutoFlow:</p>
      <ul>
        <li>توفير 3-5 ساعات يومياً</li>
        <li>زيادة المبيعات بـ 30-40%</li>
        <li>رضا العملاء وصل لـ 94%</li>
        <li>وقت الرد انخفض من 2 ساعة لـ 45 ثانية</li>
      </ul>
      
      <p><a href="https://wa.me/201099129550" class="btn-primary">ابدأ تجربتك المجانية الآن →</a></p>
    `,
    en: `
      <h2>What is WhatsApp Automation?</h2>
      <p>WhatsApp automation means using AI software to automatically reply to customer messages without human intervention. This saves you hours of daily work and increases customer satisfaction.</p>
      
      <h3>Why Do You Need WhatsApp Automation?</h3>
      <ul>
        <li><strong>Save Time:</strong> No need to answer the same question 100 times - save 3-5 hours daily</li>
        <li><strong>Faster Responses:</strong> Customers get replies in seconds instead of hours - 40% higher satisfaction</li>
        <li><strong>24/7 Service:</strong> The system works even while you sleep - never miss a sales opportunity</li>
        <li><strong>More Sales:</strong> Faster replies mean happier customers and 30% more sales</li>
        <li><strong>Reduce Costs:</strong> No need to hire additional support team</li>
      </ul>
      
      <p><a href="https://wa.me/201099129550" class="btn-primary">Start Your Free Trial Now →</a></p>
    `
  }
};

function generateArticleContent(slug, lang) {
  const isRTL = lang === 'ar';
  const article = articles[lang]?.find(a => a.slug === slug) || articles.ar.find(a => a.slug === slug);
  
  if (!article) return '';
  
  // Use specific content if available, otherwise generate generic content
  let content = articleContent[slug]?.[lang] || generateGenericContent(article, lang);
  
  return `
    <article>
      <p class="text-xl text-gray-300 mb-8">${article.excerpt}</p>
      ${content}
    </article>
  `;
}

function generateGenericContent(article, lang) {
  const isRTL = lang === 'ar';
  
  return `
    <h2>${isRTL ? 'مقدمة' : 'Introduction'}</h2>
    <p>${article.excerpt}</p>
    
    <h3>${isRTL ? 'النقاط الرئيسية' : 'Key Points'}</h3>
    <ul>
      <li>${isRTL ? 'توفير الوقت والجهد' : 'Save time and effort'}</li>
      <li>${isRTL ? 'تحسين تجربة العملاء' : 'Improve customer experience'}</li>
      <li>${isRTL ? 'زيادة الكفاءة' : 'Increase efficiency'}</li>
      <li>${isRTL ? 'تقليل التكاليف' : 'Reduce costs'}</li>
    </ul>
    
    <h3>${isRTL ? 'الخطوات التالية' : 'Next Steps'}</h3>
    <p>${isRTL ? 'تواصل معنا لتجربة مجانية وتعرف على كيف يمكن لـ AutoFlow مساعدة نشاطك.' : 'Contact us for a free trial and learn how AutoFlow can help your business.'}</p>
    
    <p><a href="https://wa.me/201099129550" class="btn-primary">${isRTL ? 'ابدأ الآن' : 'Start Now'} →</a></p>
  `;
}

function generateArticlesPage(lang) {
  const isRTL = lang === 'ar';
  const langArticles = articles[lang] || articles.ar;
  
  // Group by category
  const categories = {};
  langArticles.forEach(article => {
    if (!categories[article.category]) {
      categories[article.category] = [];
    }
    categories[article.category].push(article);
  });

  const articlesList = langArticles.slice(0, 20).map(article => `
    <a href="/articles/${article.slug}/${lang}/" class="card-tech rounded-xl p-6 hover:scale-105 transition-transform block">
      <div class="flex items-start gap-4">
        <div class="text-4xl">${article.image}</div>
        <div class="flex-1">
          <span class="text-xs px-2 py-1 rounded-full glass">${article.category}</span>
          <h3 class="font-bold text-lg mt-2 mb-2">${article.title}</h3>
          <p class="text-gray-400 text-sm mb-3 line-clamp-2">${article.excerpt}</p>
          <div class="flex items-center gap-4 text-xs text-gray-500">
            <span>${article.date}</span>
            <span>•</span>
            <span>${article.readTime}</span>
          </div>
        </div>
      </div>
    </a>
  `).join('');

  return `
    ${generateHeader(lang, 'articles')}
    
    <main class="pt-24 pb-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <!-- Hero -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-black mb-4">${isRTL ? 'مركز المعرفة' : 'Knowledge Center'}</h1>
          <p class="text-xl text-gray-400">${isRTL ? 'أكثر من 20 مقال تعليمي حول أتمتة واتس آب' : '20+ educational articles about WhatsApp automation'}</p>
        </div>
        
        <!-- Search -->
        <div class="max-w-xl mx-auto mb-12">
          <input type="text" placeholder="${isRTL ? 'ابحث في المقالات...' : 'Search articles...'}" class="w-full bg-dark-800 border border-dark-600 rounded-xl py-4 px-6 text-lg focus:border-primary-500 outline-none">
        </div>
        
        <!-- Articles List -->
        <div class="space-y-4 mb-12">
          ${articlesList}
        </div>
        
        <!-- Load More -->
        <div class="text-center">
          <button class="btn-secondary px-8 py-3 rounded-xl">${isRTL ? 'تحميل المزيد' : 'Load More'}</button>
        </div>
        
        <!-- CTA -->
        <div class="mt-12 glass rounded-2xl p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">${isRTL ? 'جاهز تبدأ؟' : 'Ready to Start?'}</h2>
          <p class="text-gray-400 mb-6">${isRTL ? 'تواصل معنا لتجربة مجانية 14 يوم' : 'Contact us for a 14-day free trial'}</p>
          <a href="https://wa.me/201099129550" target="_blank" class="btn-gradient px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            ${isRTL ? 'تواصل واتس آب' : 'WhatsApp Us'}
          </a>
        </div>
      </div>
    </main>
    
    ${generateFooter(lang)}
    ${generateWhatsAppFloat()}
  `;
}

function generateArticleDetailPage(slug, lang) {
  const article = articles[lang]?.find(a => a.slug === slug) || articles.ar.find(a => a.slug === slug);
  const isRTL = lang === 'ar';
  
  if (!article) return '';

  const langArticles = articles[lang] || articles.ar;
  const relatedArticles = langArticles
    .filter(a => a.slug !== slug && a.category === article.category)
    .slice(0, 3);

  const relatedHTML = relatedArticles.length > 0 ? `
    <div class="mt-12">
      <h3 class="text-xl font-bold mb-4">${isRTL ? 'مقالات ذات صلة' : 'Related Articles'}</h3>
      <div class="grid md:grid-cols-3 gap-4">
        ${relatedArticles.map(a => `
          <a href="/articles/${a.slug}/${lang}/" class="glass rounded-lg p-4 hover:scale-105 transition-transform block">
            <span class="text-2xl">${a.image}</span>
            <h4 class="font-bold mt-2">${a.title}</h4>
            <p class="text-gray-400 text-sm mt-1">${a.readTime}</p>
          </a>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
    ${generateHeader(lang, 'articles')}
    
    <main class="pt-24 pb-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <a href="/${lang}/" class="hover:text-white">${isRTL ? 'الرئيسية' : 'Home'}</a>
          <span>/</span>
          <a href="/articles/${lang}/" class="hover:text-white">${isRTL ? 'المقالات' : 'Articles'}</a>
          <span>/</span>
          <span class="text-gray-300">${article.title}</span>
        </div>
        
        <!-- Article -->
        <article class="glass rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-6">
            <span class="text-5xl">${article.image}</span>
            <div>
              <span class="text-xs px-2 py-1 rounded-full glass">${article.category}</span>
              <h1 class="text-3xl md:text-4xl font-black mt-2">${article.title}</h1>
            </div>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-gray-500 mb-8">
            <span>${article.date}</span>
            <span>•</span>
            <span>${article.readTime}</span>
            ${article.keywords ? `<span>•</span><span>${article.keywords.join(', ')}</span>` : ''}
          </div>
          
          <div class="prose prose-invert max-w-none">
            ${generateArticleContent(slug, lang)}
          </div>
        </article>
        
        ${relatedHTML}
        
        <!-- Navigation -->
        <div class="mt-8 flex justify-between">
          <a href="/articles/${lang}/" class="btn-secondary px-6 py-3 rounded-xl">
            ← ${isRTL ? 'العودة للمقالات' : 'Back to Articles'}
          </a>
          <a href="https://wa.me/201099129550" target="_blank" class="btn-primary px-6 py-3 rounded-xl">
            ${isRTL ? 'سؤال؟ تواصل' : 'Question? Ask'}
          </a>
        </div>
      </div>
    </main>
    
    ${generateFooter(lang)}
    ${generateWhatsAppFloat()}
  `;
}

function generateArticlesRoutes() {
  const routes = [];
  
  // Main articles pages
  routes.push({
    path: 'articles/ar/index.html',
    content: generateHTMLWrapper(generateArticlesPage('ar'))
  });
  routes.push({
    path: 'articles/en/index.html',
    content: generateHTMLWrapper(generateArticlesPage('en'))
  });
  
  // Individual article pages
  Object.keys(articles).forEach(lang => {
    articles[lang].forEach(article => {
      routes.push({
        path: `articles/${article.slug}/${lang}/index.html`,
        content: generateHTMLWrapper(generateArticleDetailPage(article.slug, lang))
      });
    });
  });
  
  return routes;
}

// Import shared components
const { generateHeader, generateFooter, generateWhatsAppFloat, generateHTMLWrapper } = require('./components/shared-components');

module.exports = {
  generateArticlesPage,
  generateArticleDetailPage,
  generateArticlesRoutes,
  articles
};