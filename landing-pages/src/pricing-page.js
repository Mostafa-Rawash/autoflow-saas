// Pricing page generator
function generatePricingPage(lang) {
  const isRTL = lang === 'ar';
  const t = {
    title: isRTL ? 'خطط الأسعار | AutoFlow' : 'Pricing Plans | AutoFlow',
    home: isRTL ? 'الرئيسية' : 'Home',
    pricing: isRTL ? 'الأسعار' : 'Pricing',
    choosePlan: isRTL ? 'اختار خطتك' : 'Choose Your Plan',
    subtitle: isRTL ? 'خطط مرنة تناسب كل حجم شركتك' : 'Flexible plans for businesses of all sizes',
    monthly: isRTL ? 'شهري' : 'Monthly',
    yearly: isRTL ? 'سنوي (وفر 20%)' : 'Yearly (Save 20%)',
    perMonth: isRTL ? '/شهر' : '/month',
    starter: isRTL ? 'مبتدئ' : 'Starter',
    professional: isRTL ? 'احترافي' : 'Professional',
    enterprise: isRTL ? 'المؤسسات' : 'Enterprise',
    starterDesc: isRTL ? 'للشركات الصغيرة' : 'For small businesses',
    proDesc: isRTL ? 'للشركات النامية' : 'For growing businesses',
    entDesc: isRTL ? 'للشركات الكبيرة' : 'For large organizations',
    popular: isRTL ? '🔥 الأكثر شعبية' : '🔥 Most Popular',
    custom: isRTL ? 'مخصص' : 'Custom',
    getStarted: isRTL ? 'ابدأ الآن' : 'Get Started',
    contactUs: isRTL ? 'تواصل معنا' : 'Contact Us',
    faqTitle: isRTL ? 'أسئلة شائعة عن الأسعار' : 'Pricing FAQ',
    faq1Q: isRTL ? 'هل يمكنني تغيير الخطة؟' : 'Can I change my plan?',
    faq1A: isRTL ? 'نعم، يمكنك الترقية أو تخفيض الخطة في أي وقت من لوحة التحكم.' : 'Yes, you can upgrade or downgrade your plan anytime from your dashboard.',
    faq2Q: isRTL ? 'هل فيه رسوم خفية؟' : 'Are there any hidden fees?',
    faq2A: isRTL ? 'لا، السعر اللي بتشوفه هو السعر النهائي. مفيش رسوم إضافية.' : 'No, the price you see is the final price. No additional fees.',
    faq3Q: isRTL ? 'هل فيه فترة تجريبية؟' : 'Is there a free trial?',
    faq3A: isRTL ? 'أيوه! عندك 14 يوم تجريبية مجانية على أي خطة.' : 'Yes! You get 14 days free trial on any plan.',
    rights: isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved',
    starterFeatures: [
      isRTL ? '500 محادثة/شهر' : '500 conversations/month',
      isRTL ? 'ردود تلقائية' : 'Auto-replies',
      isRTL ? 'لوحة تحكم أساسية' : 'Basic dashboard',
      isRTL ? 'تقارير أساسية' : 'Basic analytics',
      isRTL ? 'دعم بالإيميل' : 'Email support'
    ],
    proFeatures: [
      isRTL ? '2,000 محادثة/شهر' : '2,000 conversations/month',
      isRTL ? 'ذكاء اصطناعي متقدم' : 'Advanced AI',
      isRTL ? 'لوحة تحكم متقدمة' : 'Advanced dashboard',
      isRTL ? 'صندوق فريق (5 مستخدمين)' : 'Team inbox (5 users)',
      isRTL ? 'رسائل جماعية' : 'Broadcast messages',
      isRTL ? 'تحليلات في الوقت الحقيقي' : 'Real-time analytics',
      isRTL ? 'دعم أولوي 24/7' : 'Priority support 24/7'
    ],
    entFeatures: [
      isRTL ? 'محادثات غير محدودة' : 'Unlimited conversations',
      isRTL ? 'مستخدمين غير محدودين' : 'Unlimited users',
      isRTL ? 'لوحة تحكم مخصصة' : 'Custom dashboard',
      isRTL ? 'API مخصص' : 'Custom API',
      isRTL ? 'دعم متعدد الفروع' : 'Multi-branch support',
      isRTL ? 'تحليلات متقدمة + تصدير' : 'Advanced analytics + export',
      isRTL ? 'مدير حساب مخصص' : 'Dedicated account manager'
    ]
  };

  const dir = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'text-right' : 'text-left';
  const flexDir = isRTL ? 'flex-row-reverse' : '';
  const alignEnd = isRTL ? 'right-6' : 'left-6';

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
    .gradient-text { background: linear-gradient(135deg, #00D4AA, #7C3AED); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
    .glass-dark { background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .card-tech { background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s; }
    .card-tech:hover { transform: translateY(-4px); border-color: rgba(0,212,170,0.2); box-shadow: 0 20px 40px rgba(0,212,170,0.1); }
    .btn-gradient { background: linear-gradient(135deg, #00D4AA, #00B894); transition: all 0.3s; }
    .btn-gradient:hover { box-shadow: 0 10px 30px rgba(0,212,170,0.3); transform: translateY(-2px); }
    .btn-outline { border: 2px solid rgba(0,212,170,0.4); transition: all 0.3s; }
    .btn-outline:hover { border-color: #00D4AA; background: rgba(0,212,170,0.1); }
    .gradient-border { position: relative; background: linear-gradient(145deg, #0f0f23, #1a1a2e); }
    .gradient-border::before { content: ''; position: absolute; inset: 0; padding: 1px; background: linear-gradient(135deg, #00D4AA, #7C3AED); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; border-radius: inherit; pointer-events: none; }
    .glow { box-shadow: 0 0 60px rgba(0,212,170,0.2); }
    .tech-grid { background-image: linear-gradient(rgba(0,212,170,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.02) 1px, transparent 1px); background-size: 40px 40px; }
    /* Mobile */
    @media (max-width: 768px) {
      .btn-gradient, .btn-outline { min-height: 48px; }
    }
  </style>
</head>
<body class="bg-[#0a0a1a] text-white overflow-x-hidden">
  <div class="fixed inset-0 -z-10"><div class="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]"></div><div class="absolute inset-0 tech-grid opacity-50"></div></div>
  
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
          <a href="/pricing/${lang}/" class="text-sm text-[#00D4AA]">${t.pricing}</a>
        </nav>
      </div>
    </div>
  </header>

  <section class="pt-28 md:pt-36 pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-black mb-4">${t.choosePlan}</h1>
        <p class="text-xl text-gray-400">${t.subtitle}</p>
      </div>

      <div class="flex justify-center mb-12">
        <div class="glass rounded-full p-1 flex gap-1">
          <button id="monthly-btn" onclick="togglePlan('monthly')" class="px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#00D4AA] to-[#7C3AED] text-white">${t.monthly}</button>
          <button id="yearly-btn" onclick="togglePlan('yearly')" class="px-6 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white">${t.yearly}</button>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div class="card-tech rounded-2xl p-6 md:p-8 ${textAlign}">
          <h3 class="text-xl font-bold mb-1">${t.starter}</h3>
          <p class="text-gray-400 text-sm mb-6">${t.starterDesc}</p>
          <div class="mb-6"><span class="text-4xl font-black gradient-text monthly">499</span><span class="text-4xl font-black gradient-text yearly hidden">399</span><span class="text-gray-400 text-sm"> ${isRTL ? 'ج.م/شهر' : 'EGP/month'}</span></div>
          <ul class="space-y-3 mb-8 text-sm">${t.starterFeatures.map(f => `<li class="flex items-center gap-3 ${flexDir}"><span class="w-5 h-5 rounded bg-[#00D4AA]/20 flex items-center justify-center"><span class="text-[#00D4AA] text-xs">✓</span></span><span class="text-gray-300">${f}</span></li>`).join('')}</ul>
          <a href="mailto:mostafa@rawash.com" class="btn-outline block w-full text-center px-6 py-3 rounded-xl font-semibold">${t.getStarted}</a>
        </div>

        <div class="gradient-border rounded-2xl p-6 md:p-8 glow ${textAlign} relative">
          <div class="absolute -top-3 ${alignEnd} bg-gradient-to-r from-[#00D4AA] to-[#7C3AED] px-4 py-1 rounded-full text-xs font-bold">${t.popular}</div>
          <h3 class="text-xl font-bold mb-1">${t.professional}</h3>
          <p class="text-gray-400 text-sm mb-6">${t.proDesc}</p>
          <div class="mb-6"><span class="text-4xl font-black gradient-text monthly">1,299</span><span class="text-4xl font-black gradient-text yearly hidden">999</span><span class="text-gray-400 text-sm"> ${isRTL ? 'ج.م/شهر' : 'EGP/month'}</span></div>
          <ul class="space-y-3 mb-8 text-sm">${t.proFeatures.map(f => `<li class="flex items-center gap-3 ${flexDir}"><span class="w-5 h-5 rounded bg-[#00D4AA]/20 flex items-center justify-center"><span class="text-[#00D4AA] text-xs">✓</span></span><span class="text-gray-300">${f}</span></li>`).join('')}</ul>
          <a href="mailto:mostafa@rawash.com" class="btn-gradient block w-full text-center px-6 py-3 rounded-xl font-semibold text-white">${t.getStarted}</a>
        </div>

        <div class="card-tech rounded-2xl p-6 md:p-8 ${textAlign}">
          <h3 class="text-xl font-bold mb-1">${t.enterprise}</h3>
          <p class="text-gray-400 text-sm mb-6">${t.entDesc}</p>
          <div class="mb-6"><span class="text-4xl font-black gradient-text">${t.custom}</span></div>
          <ul class="space-y-3 mb-8 text-sm">${t.entFeatures.map(f => `<li class="flex items-center gap-3 ${flexDir}"><span class="w-5 h-5 rounded bg-[#00D4AA]/20 flex items-center justify-center"><span class="text-[#00D4AA] text-xs">✓</span></span><span class="text-gray-300">${f}</span></li>`).join('')}</ul>
          <a href="mailto:mostafa@rawash.com" class="btn-outline block w-full text-center px-6 py-3 rounded-xl font-semibold">${t.contactUs}</a>
        </div>
      </div>

      <div class="mt-20 max-w-4xl mx-auto">
        <h2 class="text-2xl md:text-3xl font-bold text-center mb-8">${t.faqTitle}</h2>
        <div class="space-y-4">
          <div class="card-tech rounded-xl p-6"><h3 class="font-semibold mb-2">${t.faq1Q}</h3><p class="text-gray-400 text-sm">${t.faq1A}</p></div>
          <div class="card-tech rounded-xl p-6"><h3 class="font-semibold mb-2">${t.faq2Q}</h3><p class="text-gray-400 text-sm">${t.faq2A}</p></div>
          <div class="card-tech rounded-xl p-6"><h3 class="font-semibold mb-2">${t.faq3Q}</h3><p class="text-gray-400 text-sm">${t.faq3A}</p></div>
        </div>
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p class="text-gray-500 text-sm">© ${new Date().getFullYear()} AutoFlow by Ensoulify. ${t.rights}</p>
    </div>
  </footer>

  <script>
    function togglePlan(type) {
      const mb = document.getElementById('monthly-btn'), yb = document.getElementById('yearly-btn');
      const mp = document.querySelectorAll('.monthly'), yp = document.querySelectorAll('.yearly');
      if (type === 'monthly') {
        mb.classList.add('bg-gradient-to-r', 'from-[#00D4AA]', 'to-[#7C3AED]', 'text-white'); mb.classList.remove('text-gray-400');
        yb.classList.remove('bg-gradient-to-r', 'from-[#00D4AA]', 'to-[#7C3AED]', 'text-white'); yb.classList.add('text-gray-400');
        mp.forEach(e => e.classList.remove('hidden')); yp.forEach(e => e.classList.add('hidden'));
      } else {
        yb.classList.add('bg-gradient-to-r', 'from-[#00D4AA]', 'to-[#7C3AED]', 'text-white'); yb.classList.remove('text-gray-400');
        mb.classList.remove('bg-gradient-to-r', 'from-[#00D4AA]', 'to-[#7C3AED]', 'text-white'); mb.classList.add('text-gray-400');
        yp.forEach(e => e.classList.remove('hidden')); mp.forEach(e => e.classList.add('hidden'));
      }
    }
  </script>
</body>
</html>`;
}

module.exports = { generatePricingPage };