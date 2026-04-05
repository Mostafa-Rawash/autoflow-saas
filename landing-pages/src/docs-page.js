// Documentation Page Generator for AutoFlow Landing Pages

const docs = {
  ar: {
    sections: [
      {
        title: 'البدء السريع',
        icon: '🚀',
        articles: [
          {
            slug: 'getting-started',
            title: 'البدء مع AutoFlow',
            content: `
              <h2>مرحباً بك في AutoFlow!</h2>
              <p>AutoFlow منصة أتمتة اتصالات ذكية للنشاطات العربية. هذا الدليل سيساعدك على البدء في دقائق.</p>
              
              <h3>الخطوة 1: إنشاء حساب</h3>
              <p>سجل في AutoFlow من خلال:</p>
              <ul>
                <li>زيارة لوحة التحكم</li>
                <li>إدخال بريدك الإلكتروني وكلمة المرور</li>
                <li>تأكيد حسابك</li>
              </ul>
              
              <h3>الخطوة 2: توصيل واتس آب</h3>
              <p>بعد إنشاء الحساب:</p>
              <ol>
                <li>اذهب إلى "القنوات" في لوحة التحكم</li>
                <li>اضغط على "توصيل واتس آب"</li>
                <li>امسح كود QR من هاتفك</li>
                <li>انتظر التأكيد</li>
              </ol>
              
              <h3>الخطوة 3: إنشاء أول رد تلقائي</h3>
              <p>لإنشاء رد تلقائي:</p>
              <ol>
                <li>اذهب إلى "الردود التلقائية"</li>
                <li>اضغط "قاعدة جديدة"</li>
                <li>أدخل الكلمات المفتاحية (مثل: مرحبا، أسعار)</li>
                <li>اكتب الرد</li>
                <li>احفظ القاعدة</li>
              </ol>
              
              <h3>الخطوة 4: تخصيص الإعدادات</h3>
              <p>يمكنك:</p>
              <ul>
                <li>تحديث معلومات نشاطك</li>
                <li>تعيين ساعات العمل</li>
                <li>إنشاء قوالب رسائل</li>
                <li>دعوة فريقك</li>
              </ul>
              
              <p><strong>ملاحظة:</strong> كل الميزات تعمل في وضع العرض حتى توصيل واتس آب الفعلي.</p>
            `
          },
          {
            slug: 'dashboard-overview',
            title: 'نظرة عامة على لوحة التحكم',
            content: `
              <h2>لوحة التحكم</h2>
              <p>لوحة التحكم هي مركز قيادة نشاطك في AutoFlow.</p>
              
              <h3>الأقسام الرئيسية</h3>
              
              <h4>📊 لوحة التحكم الرئيسية</h4>
              <ul>
                <li>إحصائيات المحادثات</li>
                <li>عدد الرسائل</li>
                <li>معدل الرضا</li>
                <li>أحدث المحادثات</li>
              </ul>
              
              <h4>💬 المحادثات</h4>
              <ul>
                <li>عرض كل المحادثات</li>
                <li>فلترة حسب الحالة</li>
                <li>الرد يدوياً</li>
                <li>تحويل لفريقك</li>
              </ul>
              
              <h4>⚡ الردود التلقائية</h4>
              <ul>
                <li>إنشاء قواعد الرد</li>
                <li>تحديد الكلمات المفتاحية</li>
                <li>تفعيل/تعطيل القواعد</li>
              </ul>
              
              <h4>📝 القوالب</h4>
              <ul>
                <li>قوالب رسائل جاهزة</li>
                <li>متغيرات قابلة للتخصيص</li>
                <li>تصنيفات منظمة</li>
              </ul>
              
              <h4>📱 القنوات</h4>
              <ul>
                <li>حالة التوصيل</li>
                <li>إعداد قنوات جديدة</li>
                <li>فصل قنوات</li>
              </ul>
              
              <h4>👑 الاشتراك</h4>
              <ul>
                <li>عرض الخطة الحالية</li>
                <li>ترقية الخطة</li>
                <li>سجل الفواتير</li>
              </ul>
            `
          }
        ]
      },
      {
        title: 'الردود التلقائية',
        icon: '⚡',
        articles: [
          {
            slug: 'auto-reply-setup',
            title: 'إعداد الردود التلقائية',
            content: `
              <h2>نظام الردود التلقائية</h2>
              <p>الردود التلقائية تسمح لك بالرد على العملاء تلقائياً بناءً على كلمات مفتاحية.</p>
              
              <h3>أنواع المطابقة</h3>
              <ul>
                <li><strong>مطابق تماماً:</strong> الرسالة يجب أن تكون مطابقة 100%</li>
                <li><strong>يحتوي على:</strong> الرسالة تحتوي على الكلمة</li>
                <li><strong>يبدأ بـ:</strong> الرسالة تبدأ بالكلمة</li>
                <li><strong>نمط منتظم:</strong> للمستخدمين المتقدمين</li>
              </ul>
              
              <h3>أفضل الممارسات</h3>
              <ol>
                <li>استخدم عدة كلمات مفتاحية لكل قاعدة</li>
                <li>اجعل الردود قصيرة ومفيدة</li>
                <li>قدم خيارات للعميل</li>
                <li>راجع الأداء أسبوعياً</li>
              </ol>
              
              <h3>مثال عملي</h3>
              <div class="bg-gray-800 rounded p-4">
                <p><strong>الكلمات:</strong> سعر، أسعار، كام</p>
                <p><strong>الرد:</strong> أسعارنا تبدأ من 2000 جنيه/شهر. للتفاصيل تواصل على 01099129550</p>
              </div>
            `
          }
        ]
      },
      {
        title: 'القوالب',
        icon: '📝',
        articles: [
          {
            slug: 'templates-guide',
            title: 'دليل القوالب',
            content: `
              <h2>قوالب الرسائل</h2>
              <p>القوالب توفر عليك وقت كتابة نفس الرسائل مرة تلو الأخرى.</p>
              
              <h3>المتغيرات المتاحة</h3>
              <ul>
                <li><code>{business_name}</code> - اسم النشاط</li>
                <li><code>{date}</code> - التاريخ</li>
                <li><code>{time}</code> - الوقت</li>
                <li><code>{customer_name}</code> - اسم العميل</li>
              </ul>
              
              <h3>تصنيفات القوالب</h3>
              <ul>
                <li><strong>ترحيب:</strong> للترحيب بالعملاء الجدد</li>
                <li><strong>معلومات:</strong> معلومات عامة عن النشاط</li>
                <li><strong>حجز:</strong> تأكيد وتفاصيل الحجوزات</li>
                <li><strong>متابعة:</strong> متابعة بعد الخدمة</li>
                <li><strong>عروض:</strong> عروض وتخفيضات</li>
              </ul>
              
              <h3>مثال قالب</h3>
              <div class="bg-gray-800 rounded p-4">
                <p>أهلاً بك في {business_name}! ساعات العمل من 9 ص إلى 10 م. للحجز اتصال على 01099129550</p>
              </div>
            `
          }
        ]
      },
      {
        title: 'الفواتير والاشتراك',
        icon: '💳',
        articles: [
          {
            slug: 'pricing-plans',
            title: 'خطط الأسعار',
            content: `
              <h2>خطط AutoFlow</h2>
              
              <h3>الخطة الأساسية - 2,000 جنيه/شهر</h3>
              <ul>
                <li>قناة واتس آب واحدة</li>
                <li>500 محادثة/شهر</li>
                <li>ردود تلقائية</li>
                <li>دعم بالإيميل</li>
              </ul>
              
              <h3>الخطة الاحترافية - 4,000 جنيه/شهر</h3>
              <ul>
                <li>3 قنوات</li>
                <li>2,000 محادثة/شهر</li>
                <li>ذكاء اصطناعي متقدم</li>
                <li>فريق من 5 مستخدمين</li>
              </ul>
              
              <h3>خطة المؤسسات - 8,000 جنيه/شهر</h3>
              <ul>
                <li>8 قنوات</li>
                <li>محادثات غير محدودة</li>
                <li>API مخصص</li>
                <li>دعم VIP</li>
              </ul>
              
              <h3>طريقة الدفع</h3>
              <ul>
                <li>بطاقات الائتمان</li>
                <li>فوري</li>
                <li>تحويل بنكي</li>
                <li>محافظ إلكترونية</li>
              </ul>
            `
          }
        ]
      }
    ]
  },
  en: {
    sections: [
      {
        title: 'Quick Start',
        icon: '🚀',
        articles: [
          {
            slug: 'getting-started',
            title: 'Getting Started with AutoFlow',
            content: `
              <h2>Welcome to AutoFlow!</h2>
              <p>AutoFlow is an intelligent communication automation platform for businesses. This guide will help you get started in minutes.</p>
              
              <h3>Step 1: Create Account</h3>
              <p>Sign up for AutoFlow by:</p>
              <ul>
                <li>Visiting the dashboard</li>
                <li>Entering your email and password</li>
                <li>Confirming your account</li>
              </ul>
              
              <h3>Step 2: Connect WhatsApp</h3>
              <p>After creating your account:</p>
              <ol>
                <li>Go to "Channels" in dashboard</li>
                <li>Click "Connect WhatsApp"</li>
                <li>Scan QR code from your phone</li>
                <li>Wait for confirmation</li>
              </ol>
              
              <h3>Step 3: Create First Auto-Reply</h3>
              <p>To create an auto-reply:</p>
              <ol>
                <li>Go to "Auto-Replies"</li>
                <li>Click "New Rule"</li>
                <li>Enter keywords (e.g., hello, prices)</li>
                <li>Write the response</li>
                <li>Save the rule</li>
              </ol>
            `
          }
        ]
      }
    ]
  }
};

function generateDocsPage(lang) {
  const isRTL = lang === 'ar';
  const langDocs = docs[lang] || docs.ar;
  
  const sectionsHTML = langDocs.sections.map(section => `
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-3xl">${section.icon}</span>
        <h2 class="text-2xl font-bold">${section.title}</h2>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        ${section.articles.map(article => `
          <a href="/docs/${article.slug}/${lang}/" class="card-tech rounded-xl p-6 hover:scale-105 transition-transform block">
            <h3 class="font-bold text-lg mb-2">${article.title}</h3>
            <p class="text-gray-400 text-sm">اضغط للقراءة</p>
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
          <h1 class="text-4xl md:text-5xl font-black mb-4">${isRTL ? 'التوثيق والدليل' : 'Documentation'}</h1>
          <p class="text-xl text-gray-400">${isRTL ? 'كل ما تحتاج معرفته عن AutoFlow' : 'Everything you need to know about AutoFlow'}</p>
        </div>
        
        <!-- Search -->
        <div class="max-w-xl mx-auto mb-12">
          <input type="text" placeholder="${isRTL ? 'ابحث في التوثيق...' : 'Search documentation...'}" class="w-full bg-dark-800 border border-dark-600 rounded-xl py-4 px-6 text-lg focus:border-primary-500 outline-none">
        </div>
        
        <!-- Sections -->
        ${sectionsHTML}
        
        <!-- Help CTA -->
        <div class="glass rounded-2xl p-8 text-center">
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
  langDocs.sections.forEach(section => {
    const found = section.articles.find(a => a.slug === slug);
    if (found) article = found;
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
            ${article.content}
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