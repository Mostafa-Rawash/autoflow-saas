const fs = require('fs');
const path = require('path');
const { generateHTML } = require('./src/templates/template');
const { generatePricingPage } = require('./src/pricing-page');
const { generateServicesPage } = require('./src/services-page');
const { generateFeaturePage } = require('./src/feature-page');
const { generateServicePage } = require('./src/whatsapp-service-page');
const { generateChannelServicePage } = require('./src/channel-service-page');
const { generateArticlesRoutes } = require('./src/articles-page');
const { generateDocsRoutes } = require('./src/docs-page');
const {
  generateHeader,
  generateFooter,
  generateWhatsAppFloat,
  generateHTMLWrapper
} = require('./src/components/shared-components');

const businessTypes = [
  { name: 'restaurant', data: require('./src/data/restaurant') },
  { name: 'clinic', data: require('./src/data/clinic') },
  { name: 'ecommerce', data: require('./src/data/ecommerce') },
  { name: 'realestate', data: require('./src/data/realestate') },
  { name: 'service', data: require('./src/data/service') },
  { name: 'lawyer', data: require('./src/data/lawyer') }
];

const channels = ['whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'email', 'sms', 'api'];

const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('🚀 Building WhatsApp Landing Pages...\n');
console.log('📦 Project: @ensoulify/whatsapp-landing-pages');
console.log('👨‍💻 Developer: Mostafa Rawash <mostafa@rawash.com>\n');

// Generate business landing pages
businessTypes.forEach(({ name, data }) => {
  console.log(`📄 Generating pages for: ${name}`);
  
  const enDir = path.join(distDir, name, 'en');
  const arDir = path.join(distDir, name, 'ar');
  
  if (!fs.existsSync(enDir)) {
    fs.mkdirSync(enDir, { recursive: true });
  }
  if (!fs.existsSync(arDir)) {
    fs.mkdirSync(arDir, { recursive: true });
  }
  
  const enHTML = generateHTML(data.en, name, 'en');
  const arHTML = generateHTML(data.ar, name, 'ar');
  
  fs.writeFileSync(path.join(enDir, 'index.html'), enHTML);
  fs.writeFileSync(path.join(arDir, 'index.html'), arHTML);
  
  console.log(`   ✓ English: /dist/${name}/en/index.html`);
  console.log(`   ✓ Arabic:  /dist/${name}/ar/index.html\n`);
});

// Generate main index page (AutoFlow landing page)
const indexBody = `
  ${generateHeader('ar', 'home')}

  <!-- Hero -->
  <section class="pt-28 md:pt-36 pb-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
      <!-- Live Demo Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-pulse">
        <span class="w-2 h-2 bg-[#00D4AA] rounded-full animate-ping"></span>
        <span class="text-sm text-gray-300">🎉 خصم 60% بمناسبة مرور سنة على الإطلاق</span>
      </div>
      
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
        <span class="text-white">منصة </span><span class="gradient-text">اتصال ذكية</span>
        <br><span class="text-gray-400">توحد كل قنواتك في مكان واحد</span>
      </h1>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
        اربط WhatsApp و Messenger و Instagram وغيرها في لوحة تحكم واحدة مع أتمتة ذكية بالذكاء الاصطناعي
      </p>
      
      <!-- Live Demo Number -->
      <div class="glass rounded-2xl p-6 max-w-md mx-auto mb-10">
        <div class="flex items-center justify-center gap-3 mb-3">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-sm text-gray-300">جرب النظام دلوقتي</span>
        </div>
        <a href="tel:+201099129550" class="text-2xl md:text-3xl font-black hover:text-[#00D4AA] transition-colors" style="color: #00D4AA;">
          📞 +20 109 912 9550
        </a>
        <p class="text-xs text-gray-500 mt-2">اتصل دلوقتي واتكلم مع الذكاء الاصطناعي</p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/pricing/ar/" class="btn-gradient px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-2">
          ابدأ الآن
          <span class="bg-[#F59E0B] text-black text-xs px-2 py-1 rounded-full font-bold">خصم 60%</span>
        </a>
        <a href="https://wa.me/201099129550?text=أريد تجربة مجانية" target="_blank" class="border-2 border-[#00D4AA]/40 px-8 py-4 rounded-xl text-lg font-semibold text-gray-300 hover:bg-[#00D4AA]/10 inline-flex items-center gap-2">
          <svg class="w-6 h-6" style="color: #25D366;" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          تجربة واتس آب مجانية
        </a>
      </div>
    </div>
  </section>

  <!-- Platforms/Channels -->
  <section id="platforms" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black mb-4">قنوات الاتصال المدعومة</h2>
        <p class="text-gray-400">واجه عملاءك من أي قناة من قناة واحدة</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <a href="/channel/whatsapp/ar/" class="glass rounded-2xl p-6 text-center card-tech hover:scale-105 transition-transform block cursor-pointer">
          <div class="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style="background: #25D36620;">
            <svg class="w-7 h-7" style="color: #25D366;" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          </div>
          <h3 class="font-bold text-lg mb-1">WhatsApp</h3>
          <p class="text-gray-400 text-sm">2B+ مستخدم</p>
        </a>
        <a href="/channel/messenger/ar/" class="glass rounded-2xl p-6 text-center card-tech hover:scale-105 transition-transform block cursor-pointer">
          <div class="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style="background: #0084FF20;">
            <svg class="w-7 h-7" style="color: #0084FF;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 22l4.832-1.091A9.945 9.945 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
          </div>
          <h3 class="font-bold text-lg mb-1">Messenger</h3>
          <p class="text-gray-400 text-sm">1.3B+ مستخدم</p>
        </a>
        <a href="/channel/instagram/ar/" class="glass rounded-2xl p-6 text-center card-tech hover:scale-105 transition-transform block cursor-pointer">
          <div class="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style="background: #E4405F20;">
            <svg class="w-7 h-7" style="color: #E4405F;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </div>
          <h3 class="font-bold text-lg mb-1">Instagram</h3>
          <p class="text-gray-400 text-sm">2B+ مستخدم</p>
        </a>
        <a href="/channel/telegram/ar/" class="glass rounded-2xl p-6 text-center card-tech hover:scale-105 transition-transform block cursor-pointer">
          <div class="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style="background: #0088cc20;">
            <svg class="w-7 h-7" style="color: #0088cc;" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 6.823c.14-.005.26.026.37.081.14.068.25.173.31.293.06.12.09.258.09.408v.02l-.01.05-.01.07-1.1 4.8-.17.73-.18.8c-.05.22-.1.43-.15.6-.05.17-.09.3-.13.38-.05.1-.11.14-.18.14-.07 0-.17-.04-.29-.12a1.3 1.3 0 00-.47-.22.87.87 0 00-.49.01c-.17.05-.33.13-.49.24-.16.11-.32.24-.47.38-.15.14-.3.29-.43.44l-.2.22-.1.11-.03.03h-.01l-.01.01-.02.01c-.05.04-.11.05-.18.05a.5.5 0 01-.22-.06.7.7 0 01-.2-.16l-.02-.02-.04-.04-.04-.04c-.1-.12-.22-.26-.34-.42-.12-.16-.24-.34-.35-.53-.11-.19-.21-.39-.3-.6-.09-.21-.16-.43-.21-.66-.05-.23-.08-.47-.08-.71 0-.32.05-.62.16-.9.11-.28.25-.53.44-.74.19-.21.4-.38.66-.51.26-.13.53-.19.83-.19.19 0 .38.03.55.09.17.06.33.14.47.24l.11.7.07.04c.07.04.13.6.2.6.08 0 .14-.04.18-.12l.18-.47.19-.47.17-.42.15-.37.12-.3.08-.19.04-.09.02-.04.01-.02c.06-.13.14-.22.24-.28.1-.06.21-.09.33-.09z"/></svg>
          </div>
          <h3 class="font-bold text-lg mb-1">Telegram</h3>
          <p class="text-gray-400 text-sm">800M+ مستخدم</p>
        </a>
        <a href="/channel/livechat/ar/" class="glass rounded-2xl p-6 text-center card-tech hover:scale-105 transition-transform block cursor-pointer">
          <div class="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style="background: #00D4AA20;">
            <svg class="w-7 h-7" style="color: #00D4AA;" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
          </div>
          <h3 class="font-bold text-lg mb-1">Live Chat</h3>
          <p class="text-gray-400 text-sm">محادثة فورية</p>
        </a>
        <a href="/channel/email/ar/" class="glass rounded-2xl p-6 text-center card-tech hover:scale-105 transition-transform block cursor-pointer">
          <div class="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style="background: #EA433520;">
            <svg class="w-7 h-7" style="color: #EA4335;" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </div>
          <h3 class="font-bold text-lg mb-1">Email</h3>
          <p class="text-gray-400 text-sm">4B+ مستخدم</p>
        </a>
        <a href="/channel/sms/ar/" class="glass rounded-2xl p-6 text-center card-tech hover:scale-105 transition-transform block cursor-pointer">
          <div class="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style="background: #7C3AED20;">
            <svg class="w-7 h-7" style="color: #7C3AED;" fill="currentColor" viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-4.2-5.78v1.75l3.2-2.99L12.8 9v1.7c-3.11.43-4.35 2.56-4.8 4.7 1.11-1.5 2.58-2.18 4.8-2.18z"/></svg>
          </div>
          <h3 class="font-bold text-lg mb-1">SMS</h3>
          <p class="text-gray-400 text-sm">5B+ مستخدم</p>
        </a>
        <a href="/channel/api/ar/" class="glass rounded-2xl p-6 text-center card-tech hover:scale-105 transition-transform block cursor-pointer">
          <div class="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style="background: #F59E0B20;">
            <svg class="w-7 h-7" style="color: #F59E0B;" fill="currentColor" viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
          </div>
          <h3 class="font-bold text-lg mb-1">API</h3>
          <p class="text-gray-400 text-sm">تكامل مخصص</p>
        </a>
      </div>
    </div>
  </section>

  <!-- Integrations -->
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black mb-4">تكاملات مع أنظمتك المفضلة</h2>
        <p class="text-gray-400">اربط AutoFlow مع الأدوات اللي بتستخدمها</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">🛒</div>
          <div class="font-bold text-sm">Shopify</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">📦</div>
          <div class="font-bold text-sm">WooCommerce</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">⚡</div>
          <div class="font-bold text-sm">Zapier</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">🎯</div>
          <div class="font-bold text-sm">HubSpot</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">☁️</div>
          <div class="font-bold text-sm">Salesforce</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">📊</div>
          <div class="font-bold text-sm">Google Sheets</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">📧</div>
          <div class="font-bold text-sm">Gmail</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">📅</div>
          <div class="font-bold text-sm">Google Calendar</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">🗓️</div>
          <div class="font-bold text-sm">Calendly</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">💬</div>
          <div class="font-bold text-sm">Slack</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">🔷</div>
          <div class="font-bold text-sm">Microsoft Teams</div>
        </div>
        <div class="glass rounded-xl p-4 text-center card-tech hover:scale-105 transition-transform">
          <div class="text-2xl mb-2">🔗</div>
          <div class="font-bold text-sm">API مفتوح</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Appointment Scheduling -->
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black mb-4">📅 جدولة مواعيد تلقائية</h2>
        <p class="text-gray-400">خلّي العملاء يحجزوا مواعيدهم بنفسهم 24/7</p>
      </div>
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div class="space-y-6">
          <div class="glass rounded-2xl p-6 flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background: #00D4AA20;">
              <span class="text-2xl">🗓️</span>
            </div>
            <div>
              <h3 class="font-bold text-lg mb-2">حجز فوري</h3>
              <p class="text-gray-400 text-sm">العميل يحجز موعده في ثواني من غير ما حد يتدخل</p>
            </div>
          </div>
          <div class="glass rounded-2xl p-6 flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background: #7C3AED20;">
              <span class="text-2xl">⏰</span>
            </div>
            <div>
              <h3 class="font-bold text-lg mb-2">تذكيرات تلقائية</h3>
              <p class="text-gray-400 text-sm">نرسل تذكير للعميل قبل الموعد بساعات</p>
            </div>
          </div>
          <div class="glass rounded-2xl p-6 flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background: #F59E0B20;">
              <span class="text-2xl">🔄</span>
            </div>
            <div>
              <h3 class="font-bold text-lg mb-2">ربط مع التقويم</h3>
              <p class="text-gray-400 text-sm">Google Calendar، Outlook، Calendly</p>
            </div>
          </div>
        </div>
        <div class="glass rounded-2xl p-8">
          <div class="text-center mb-6">
            <div class="text-4xl mb-2">📆</div>
            <h3 class="font-bold text-xl">مثال: عيادة أسنان</h3>
          </div>
          <div class="space-y-3 text-sm">
            <div class="flex items-center gap-3 text-gray-300">
              <span class="text-green-400">✓</span>
              <span>العميل: "عايز أحجز موعد كشف"</span>
            </div>
            <div class="flex items-center gap-3 text-gray-300">
              <span class="text-green-400">✓</span>
              <span>النظام: "المواعيد المتاحة: 10 ص، 12 م، 3 م"</span>
            </div>
            <div class="flex items-center gap-3 text-gray-300">
              <span class="text-green-400">✓</span>
              <span>العميل: "3 م ممتاز"</span>
            </div>
            <div class="flex items-center gap-3 text-green-400">
              <span class="text-green-400">✓</span>
              <span>تم الحجز! هنبعتلك تذكير قبل الموعد</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- vs Competitors -->
  <section class="py-16 bg-gradient-to-b from-transparent to-[#0a0a1a]/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black mb-4">🔍 AutoFlow vs المنافسين</h2>
        <p class="text-gray-400">ليه AutoFlow هو الاختيار الأفضل؟</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[600px]">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="text-right p-4 text-gray-400 font-normal">الميزة</th>
              <th class="text-center p-4" style="color: #00D4AA;">AutoFlow</th>
              <th class="text-center p-4 text-gray-400">TeleWizard</th>
              <th class="text-center p-4 text-gray-400">غيره</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-800/50">
              <td class="p-4 text-gray-300">واتس آب</td>
              <td class="text-center p-4"><span class="text-green-400 text-xl">✓</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
              <td class="text-center p-4"><span class="text-yellow-400 text-xl">~</span></td>
            </tr>
            <tr class="border-b border-gray-800/50">
              <td class="p-4 text-gray-300">ماسنجر</td>
              <td class="text-center p-4"><span class="text-green-400 text-xl">✓</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
            </tr>
            <tr class="border-b border-gray-800/50">
              <td class="p-4 text-gray-300">إنستجرام</td>
              <td class="text-center p-4"><span class="text-green-400 text-xl">✓</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
            </tr>
            <tr class="border-b border-gray-800/50">
              <td class="p-4 text-gray-300">مكالمات صوتية</td>
              <td class="text-center p-4"><span class="text-green-400 text-xl">✓</span></td>
              <td class="text-center p-4"><span class="text-green-400 text-xl">✓</span></td>
              <td class="text-center p-4"><span class="text-yellow-400 text-xl">~</span></td>
            </tr>
            <tr class="border-b border-gray-800/50">
              <td class="p-4 text-gray-300">لوحة تحكم موحدة</td>
              <td class="text-center p-4"><span class="text-green-400 text-xl">✓</span></td>
              <td class="text-center p-4"><span class="text-yellow-400 text-xl">~</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
            </tr>
            <tr class="border-b border-gray-800/50">
              <td class="p-4 text-gray-300">دعم عربي 100%</td>
              <td class="text-center p-4"><span class="text-green-400 text-xl">✓</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
            </tr>
            <tr class="border-b border-gray-800/50">
              <td class="p-4 text-gray-300">تسعير شفاف</td>
              <td class="text-center p-4"><span class="text-green-400 text-xl">✓</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
            </tr>
            <tr class="border-b border-gray-800/50">
              <td class="p-4 text-gray-300">تجربة مجانية</td>
              <td class="text-center p-4"><span class="text-green-400 text-xl">14 يوم</span></td>
              <td class="text-center p-4"><span class="text-yellow-400 text-xl">~</span></td>
              <td class="text-center p-4"><span class="text-red-400 text-xl">✗</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Data Export -->
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black mb-4">صدر بياناتك بسهولة</h2>
        <p class="text-gray-400">تحليلات متقدمة وتقارير مفصلة</p>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="card-tech rounded-2xl p-6 text-center">
          <div class="text-3xl mb-4">📊</div>
          <h3 class="font-bold text-lg mb-2">Excel/CSV</h3>
          <p class="text-gray-400 text-sm">صدر كل المحادثات والتقارير</p>
        </div>
        <div class="card-tech rounded-2xl p-6 text-center">
          <div class="text-3xl mb-4">📈</div>
          <h3 class="font-bold text-lg mb-2">لوحة تحكم</h3>
          <p class="text-gray-400 text-sm">إحصائيات فورية للردود والمبيعات</p>
        </div>
        <div class="card-tech rounded-2xl p-6 text-center">
          <div class="text-3xl mb-4">🔗</div>
          <h3 class="font-bold text-lg mb-2">API</h3>
          <p class="text-gray-400 text-sm">ربط مع أي نظام خارجي</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Dashboard Preview -->
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black mb-4">📊 لوحة تحكم شاملة</h2>
        <p class="text-gray-400">شوف كل إحصائياتك في مكان واحد</p>
      </div>
      <div class="glass rounded-2xl p-8">
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div class="text-center">
            <div class="text-4xl font-black" style="color: #00D4AA;">2,547</div>
            <div class="text-gray-400 text-sm">محادثة اليوم</div>
            <div class="text-xs text-green-400 mt-1">↑ 12% من أمس</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black" style="color: #7C3AED;">98%</div>
            <div class="text-gray-400 text-sm">معدل الرد</div>
            <div class="text-xs text-green-400 mt-1">↑ 5% هذا الأسبوع</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black" style="color: #F59E0B;">< 30s</div>
            <div class="text-gray-400 text-sm">وقت الرد</div>
            <div class="text-xs text-green-400 mt-1">أسرع بـ 10x</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black" style="color: #00D4AA;">+45%</div>
            <div class="text-gray-400 text-sm">زيادة المبيعات</div>
            <div class="text-xs text-green-400 mt-1">↑ من الشهر اللي فات</div>
          </div>
        </div>
        
        <!-- Channel Breakdown -->
        <div class="bg-[#0a0a1a] rounded-xl p-6 mb-6">
          <h3 class="font-bold mb-4">توزيع المحادثات حسب القناة</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full" style="background: #25D366;"></div>
              <span class="text-sm flex-1">واتس آب</span>
              <div class="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full" style="width: 65%; background: #25D366;"></div>
              </div>
              <span class="text-sm text-gray-400">65%</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full" style="background: #0084FF;"></div>
              <span class="text-sm flex-1">ماسنجر</span>
              <div class="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full" style="width: 20%; background: #0084FF;"></div>
              </div>
              <span class="text-sm text-gray-400">20%</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full" style="background: #E4405F;"></div>
              <span class="text-sm flex-1">إنستجرام</span>
              <div class="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full" style="width: 10%; background: #E4405F;"></div>
              </div>
              <span class="text-sm text-gray-400">10%</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full" style="background: #00D4AA;"></div>
              <span class="text-sm flex-1">أخرى</span>
              <div class="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full" style="width: 5%; background: #00D4AA;"></div>
              </div>
              <span class="text-sm text-gray-400">5%</span>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-[#0a0a1a] rounded-xl p-4 text-center">
            <div class="text-2xl mb-2">📤</div>
            <div class="text-sm font-bold">تصدير CSV</div>
          </div>
          <div class="bg-[#0a0a1a] rounded-xl p-4 text-center">
            <div class="text-2xl mb-2">📈</div>
            <div class="text-sm font-bold">تقارير PDF</div>
          </div>
          <div class="bg-[#0a0a1a] rounded-xl p-4 text-center">
            <div class="text-2xl mb-2">🔔</div>
            <div class="text-sm font-bold">تنبيهات</div>
          </div>
          <div class="bg-[#0a0a1a] rounded-xl p-4 text-center">
            <div class="text-2xl mb-2">👥</div>
            <div class="text-sm font-bold">إدارة الفريق</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <h2 class="text-3xl md:text-4xl font-black mb-6 gradient-text">جاهز تبدأ؟</h2>
      <p class="text-xl text-gray-400 mb-8">ابدأ مجاناً لمدة 14 يوم بدون أي التزام</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="https://wa.me/201099129550?text=أريد تجربة AutoFlow" target="_blank" class="btn-gradient px-10 py-5 rounded-2xl text-lg font-semibold inline-flex items-center justify-center gap-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148.67.15.197.297.767.966.94 1.164.173.199.347.223.644.075.297-.15 1.255-.463 2.39-1.475.883-.788 1.48-1.761 1.653-2.059.173-.297.018-.458-.13-.606-.134-.133-.298-.347-.446-.52-.149-.174-.198-.298-.298-.497-.099-.198-.05-.371.025-.52.075-.149.669-1.612.916-2.207.242-.579.487-.5.669-.51.173-.008.371-.01.57-.01.198 0 .52.074.792.372.272.297 1.04 1.016 1.04 2.479 0 1.462-1.065 2.875-1.213 3.074-.149.198-2.096 3.2-5.077 4.487-.709.306-1.262.489-1.694.625-.712.227-1.36.195-1.871.118-.571-.085-1.758-.719-2.006-1.413-.248-.694-.248-1.29-.173-1.413.074-.124.272-.198.57-.347z"/></svg>
          ابدأ الآن - مجاناً 14 يوم
        </a>
        <a href="/pricing/ar/" class="border-2 border-[#00D4AA]/40 px-10 py-5 rounded-2xl text-lg font-semibold text-gray-300 hover:bg-[#00D4AA]/10">شوف الأسعار</a>
      </div>
    </div>
  </section>

  ${generateFooter('ar')}
  ${generateWhatsAppFloat('ar')}
`;

const indexHTML = generateHTMLWrapper('ar', 'AutoFlow - حلول اتصال ذكية للمستقبل', indexBody);

fs.writeFileSync(path.join(distDir, 'index.html'), indexHTML);
console.log('✅ Generated main index page\n');

// Generate Pricing Page
console.log('📄 Generating pricing page...');

const pricingHTML = {
  ar: generatePricingPage('ar'),
  en: generatePricingPage('en')
};

const pricingDir = path.join(distDir, 'pricing');
if (!fs.existsSync(path.join(pricingDir, 'ar'))) {
  fs.mkdirSync(path.join(pricingDir, 'ar'), { recursive: true });
}
if (!fs.existsSync(path.join(pricingDir, 'en'))) {
  fs.mkdirSync(path.join(pricingDir, 'en'), { recursive: true });
}

fs.writeFileSync(path.join(pricingDir, 'ar', 'index.html'), pricingHTML.ar);
fs.writeFileSync(path.join(pricingDir, 'en', 'index.html'), pricingHTML.en);

console.log('   ✓ Arabic:  /dist/pricing/ar/index.html');
console.log('   ✓ English: /dist/pricing/en/index.html\n');

// Generate Services Page
console.log('📄 Generating services page...');

const servicesHTML = {
  ar: generateServicesPage('ar'),
  en: generateServicesPage('en')
};

const servicesDir = path.join(distDir, 'services');
if (!fs.existsSync(path.join(servicesDir, 'ar'))) {
  fs.mkdirSync(path.join(servicesDir, 'ar'), { recursive: true });
}
if (!fs.existsSync(path.join(servicesDir, 'en'))) {
  fs.mkdirSync(path.join(servicesDir, 'en'), { recursive: true });
}

fs.writeFileSync(path.join(servicesDir, 'ar', 'index.html'), servicesHTML.ar);
fs.writeFileSync(path.join(servicesDir, 'en', 'index.html'), servicesHTML.en);

console.log('   ✓ Arabic:  /dist/services/ar/index.html');
console.log('   ✓ English: /dist/services/en/index.html\n');

// Generate Channel Pages (merged with service pages)
console.log('📄 Generating channel pages...');

channels.forEach(channel => {
  const channelDir = path.join(distDir, 'channel', channel);
  if (!fs.existsSync(path.join(channelDir, 'ar'))) {
    fs.mkdirSync(path.join(channelDir, 'ar'), { recursive: true });
  }
  if (!fs.existsSync(path.join(channelDir, 'en'))) {
    fs.mkdirSync(path.join(channelDir, 'en'), { recursive: true });
  }
  
  const arHTML = generateChannelServicePage(channel, 'ar');
  const enHTML = generateChannelServicePage(channel, 'en');
  
  fs.writeFileSync(path.join(channelDir, 'ar', 'index.html'), arHTML);
  fs.writeFileSync(path.join(channelDir, 'en', 'index.html'), enHTML);
  
  console.log(`   ✓ ${channel}: /dist/channel/${channel}/ar/ and /en/`);
});

console.log('');

// Generate Feature Pages
console.log('📄 Generating feature pages...');

const featureCount = 6; // 6 features per channel
channels.forEach(channel => {
  for (let i = 0; i < featureCount; i++) {
    const featureDir = path.join(distDir, 'channel', channel, 'feature', String(i));
    if (!fs.existsSync(path.join(featureDir, 'ar'))) {
      fs.mkdirSync(path.join(featureDir, 'ar'), { recursive: true });
    }
    if (!fs.existsSync(path.join(featureDir, 'en'))) {
      fs.mkdirSync(path.join(featureDir, 'en'), { recursive: true });
    }
    
    const arHTML = generateFeaturePage(channel, i, 'ar');
    const enHTML = generateFeaturePage(channel, i, 'en');
    
    fs.writeFileSync(path.join(featureDir, 'ar', 'index.html'), arHTML);
    fs.writeFileSync(path.join(featureDir, 'en', 'index.html'), enHTML);
  }
  
  console.log(`   ✓ ${channel}: 6 feature pages generated`);
});

console.log('');

// Generate WhatsApp Service Landing Page
console.log('📄 Generating WhatsApp service landing page...');

const serviceDir = path.join(distDir, 'service', 'whatsapp-support');
if (!fs.existsSync(path.join(serviceDir, 'ar'))) {
  fs.mkdirSync(path.join(serviceDir, 'ar'), { recursive: true });
}
if (!fs.existsSync(path.join(serviceDir, 'en'))) {
  fs.mkdirSync(path.join(serviceDir, 'en'), { recursive: true });
}

const serviceArHTML = generateServicePage('ar');
const serviceEnHTML = generateServicePage('en');

fs.writeFileSync(path.join(serviceDir, 'ar', 'index.html'), serviceArHTML);
fs.writeFileSync(path.join(serviceDir, 'en', 'index.html'), serviceEnHTML);

console.log('   ✓ Arabic:  /dist/service/whatsapp-support/ar/');
console.log('   ✓ English: /dist/service/whatsapp-support/en/\n');

// Generate Channel Service Landing Pages
console.log('📄 Generating channel service pages...');

channels.forEach(channel => {
  const channelServiceDir = path.join(distDir, 'service', channel);
  if (!fs.existsSync(path.join(channelServiceDir, 'ar'))) {
    fs.mkdirSync(path.join(channelServiceDir, 'ar'), { recursive: true });
  }
  if (!fs.existsSync(path.join(channelServiceDir, 'en'))) {
    fs.mkdirSync(path.join(channelServiceDir, 'en'), { recursive: true });
  }
  
  const arHTML = generateChannelServicePage(channel, 'ar');
  const enHTML = generateChannelServicePage(channel, 'en');
  
  fs.writeFileSync(path.join(channelServiceDir, 'ar', 'index.html'), arHTML);
  fs.writeFileSync(path.join(channelServiceDir, 'en', 'index.html'), enHTML);
  
  console.log(`   ✓ ${channel}: /dist/service/${channel}/ar/ and /en/`);
});

console.log('');

// Generate Articles Pages
console.log('📄 Generating articles pages...');

const articlesRoutes = generateArticlesRoutes();
articlesRoutes.forEach(route => {
  const routeDir = path.dirname(path.join(distDir, route.path));
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(distDir, route.path), route.content);
});

console.log(`   ✓ ${articlesRoutes.length} article pages generated\n`);

// Generate Docs Pages
console.log('📄 Generating documentation pages...');

const docsRoutes = generateDocsRoutes();
docsRoutes.forEach(route => {
  const routeDir = path.dirname(path.join(distDir, route.path));
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(distDir, route.path), route.content);
});

console.log(`   ✓ ${docsRoutes.length} documentation pages generated\n`);

console.log('✅ Build complete!\n');
console.log('📁 Output directory: ./dist');
console.log('🌐 Open ./dist/index.html to view all landing pages\n');
console.log('📊 Statistics:');
console.log(`   • Business types: ${businessTypes.length}`);
console.log(`   • Total landing pages: ${businessTypes.length * 2} (EN + AR)`);
console.log(`   • Languages: English, Egyptian Arabic (عامية مصرية)\n`);
console.log('💡 To serve the pages locally:');
console.log('   npx serve dist');
console.log('\n💡 To deploy:');
console.log('   Upload the ./dist folder to any static hosting service\n');