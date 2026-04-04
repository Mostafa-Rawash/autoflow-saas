function generateHTML(content, businessType, lang) {
  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${content.meta.title}</title>
  <meta name="description" content="${content.meta.description}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    ${isRTL ? 'body { font-family: "Cairo", sans-serif; }' : 'body { font-family: "Inter", sans-serif; }'}
    html { scroll-behavior: smooth; }
    
    /* Gradient Text */
    .gradient-text {
      background: linear-gradient(135deg, #00D4AA 0%, #7C3AED 50%, #00D4AA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Glass Effect */
    .glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .glass-dark {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    /* Glow Effects */
    .glow {
      box-shadow: 0 0 60px rgba(0, 212, 170, 0.2);
    }
    
    .glow-purple {
      box-shadow: 0 0 60px rgba(124, 58, 237, 0.2);
    }
    
    /* Tech Card */
    .card-tech {
      background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .card-tech:hover {
      transform: translateY(-4px);
      border-color: rgba(0, 212, 170, 0.2);
      box-shadow: 0 20px 40px rgba(0, 212, 170, 0.1);
    }
    
    /* Gradient Button */
    .btn-gradient {
      background: linear-gradient(135deg, #00D4AA 0%, #00B894 100%);
      transition: all 0.3s ease;
    }
    
    .btn-gradient:hover {
      background: linear-gradient(135deg, #00E5BB 0%, #00D4AA 100%);
      box-shadow: 0 10px 30px rgba(0, 212, 170, 0.3);
      transform: translateY(-2px);
    }
    
    .btn-gradient:active {
      transform: translateY(0);
    }
    
    /* Outline Button */
    .btn-outline {
      border: 2px solid rgba(0, 212, 170, 0.4);
      transition: all 0.3s ease;
    }
    
    .btn-outline:hover {
      border-color: #00D4AA;
      background: rgba(0, 212, 170, 0.1);
    }
    
    /* Animations */
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
    
    .animate-pulse-glow {
      animation: pulseGlow 3s ease-in-out infinite;
    }
    
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 170, 0.2); }
      50% { box-shadow: 0 0 40px rgba(0, 212, 170, 0.4); }
    }
    
    /* Gradient Border */
    .gradient-border {
      position: relative;
      background: linear-gradient(145deg, #0f0f23 0%, #1a1a2e 100%);
    }
    
    .gradient-border::before {
      content: '';
      position: absolute;
      inset: 0;
      padding: 1px;
      background: linear-gradient(135deg, #00D4AA, #7C3AED, #00D4AA);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      border-radius: inherit;
      pointer-events: none;
    }
    
    /* Tech Grid Background */
    .tech-grid {
      background-image: 
        linear-gradient(rgba(0, 212, 170, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 212, 170, 0.02) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0a0a1a;
    }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #00D4AA 0%, #7C3AED 100%);
      border-radius: 3px;
    }
    
    /* Mobile Optimizations */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 1.75rem;
        line-height: 1.2;
      }
      .section-title {
        font-size: 1.5rem;
        line-height: 1.3;
      }
      .card-tech {
        padding: 0.875rem;
      }
      .glass {
        padding: 0.875rem;
      }
      /* Improve touch targets */
      .btn-gradient, .btn-outline {
        min-height: 48px;
        padding-top: 0.875rem;
        padding-bottom: 0.875rem;
      }
      /* Better spacing */
      section {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
      }
      /* Improve phone mockup on mobile */
      .phone-mockup {
        max-width: 280px;
        margin: 0 auto;
      }
      /* Better grid for features */
      .features-grid {
        grid-template-columns: 1fr;
      }
      /* Improve stats */
      .stat-item {
        padding: 0.75rem;
      }
      .stat-number {
        font-size: 1.75rem;
      }
    }
    
    /* Extra small screens */
    @media (max-width: 375px) {
      .hero-title {
        font-size: 1.5rem;
      }
      .section-title {
        font-size: 1.25rem;
      }
    }
    
    /* Touch-friendly */
    @media (hover: none) {
      .card-tech:hover {
        transform: none;
      }
      .btn-gradient:hover {
        transform: none;
      }
    }
    
    /* Safe area for notched phones */
    @supports (padding-bottom: env(safe-area-inset-bottom)) {
      .safe-bottom {
        padding-bottom: env(safe-area-inset-bottom);
      }
    }
  </style>
</head>
<body class="bg-[#0a0a1a] text-white overflow-x-hidden">
  
  <!-- Animated Background -->
  <div class="fixed inset-0 -z-10 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]"></div>
    <div class="absolute inset-0 tech-grid opacity-50"></div>
    <div class="absolute top-0 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-[#00D4AA] rounded-full filter blur-[120px] md:blur-[150px] opacity-10 animate-float"></div>
    <div class="absolute bottom-0 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-[#7C3AED] rounded-full filter blur-[120px] md:blur-[150px] opacity-10 animate-float" style="animation-delay: -3s;"></div>
  </div>

  <!-- HEADER -->
  <header class="fixed top-0 left-0 right-0 z-50 glass-dark safe-bottom">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex justify-between items-center h-14 md:h-16">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2">
          <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#7C3AED] flex items-center justify-center">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
          </div>
          <span class="text-lg md:text-xl font-bold gradient-text">AutoFlow</span>
        </a>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-6 lg:gap-8">
          <a href="#features" class="text-sm text-gray-400 hover:text-[#00D4AA] transition-colors">${isRTL ? 'المميزات' : 'Features'}</a>
          <a href="#pricing" class="text-sm text-gray-400 hover:text-[#00D4AA] transition-colors">${isRTL ? 'الأسعار' : 'Pricing'}</a>
          <a href="#faq" class="text-sm text-gray-400 hover:text-[#00D4AA] transition-colors">${isRTL ? 'الأسئلة' : 'FAQ'}</a>
          <a href="#cta" class="btn-gradient px-5 py-2 rounded-lg text-sm font-medium text-white">${isRTL ? 'ابدأ الآن' : 'Get Started'}</a>
        </nav>
        
        <!-- Mobile Menu Button -->
        <button class="md:hidden p-2 text-gray-400 hover:text-white" onclick="toggleMobileMenu()" aria-label="Menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
      
      <!-- Mobile Navigation -->
      <nav id="mobile-menu" class="hidden md:hidden pb-4">
        <div class="flex flex-col gap-1 pt-2 border-t border-gray-800">
          <a href="#features" class="py-3 px-2 text-gray-300 hover:text-[#00D4AA] transition-colors rounded-lg">${isRTL ? 'المميزات' : 'Features'}</a>
          <a href="#pricing" class="py-3 px-2 text-gray-300 hover:text-[#00D4AA] transition-colors rounded-lg">${isRTL ? 'الأسعار' : 'Pricing'}</a>
          <a href="#faq" class="py-3 px-2 text-gray-300 hover:text-[#00D4AA] transition-colors rounded-lg">${isRTL ? 'الأسئلة' : 'FAQ'}</a>
          <a href="#cta" class="btn-gradient mt-2 py-3 rounded-lg text-center font-medium">${isRTL ? 'ابدأ الآن' : 'Get Started'}</a>
        </div>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="pt-20 md:pt-28 pb-8 md:pb-16 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid lg:grid-cols-2 gap-6 lg:gap-16 items-center">
        <div class="${isRTL ? 'text-right lg:order-2' : 'text-left'} order-2 lg:order-1">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass mb-4 md:mb-6 animate-pulse-glow">
            <span class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00D4AA] rounded-full"></span>
            <span class="text-xs md:text-sm text-gray-300">${isRTL ? '🚀 +500 شركة فعالة' : '🚀 500+ Active Businesses'}</span>
          </div>
          
          <!-- Title -->
          <h1 class="hero-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4 md:mb-6">
            <span class="text-white">${isRTL ? 'أتمت' : 'Automate'}</span>
            <span class="gradient-text"> ${isRTL ? 'واتس آب' : 'WhatsApp'}</span>
            <br>
            <span class="text-gray-400">${isRTL ? 'بذكاء اصطناعي' : 'with AI Power'}</span>
          </h1>
          
          <!-- Subtitle -->
          <p class="text-base md:text-xl text-gray-400 mb-8 leading-relaxed">
            ${content.hero.subheadline}
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}">
            <a href="#cta" class="btn-gradient px-5 py-3 md:px-6 md:py-3.5 rounded-xl text-base font-semibold text-center inline-flex items-center justify-center gap-2">
              ${content.hero.cta}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </a>
            <a href="#features" class="btn-outline px-5 py-3 md:px-6 md:py-3.5 rounded-xl text-base font-semibold text-center text-gray-300">
              ${isRTL ? 'اكتشف المزيد' : 'Learn More'}
            </a>
          </div>
        </div>
        
        <!-- Phone Mockup -->
        <div class="${isRTL ? 'lg:order-1' : ''} order-1 lg:order-2 relative max-w-[280px] md:max-w-xs mx-auto lg:max-w-none">
          <div class="relative phone-mockup">
            <div class="glass rounded-2xl p-4 md:p-5 animate-float glow">
              <div class="bg-[#0f0f23] rounded-xl md:rounded-2xl p-3 md:p-4">
                <!-- Chat Header -->
                <div class="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-800">
                  <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#7C3AED] flex items-center justify-center text-lg md:text-xl flex-shrink-0">
                    🤖
                  </div>
                  <div class="${isRTL ? 'text-right' : 'text-left'} flex-1 min-w-0">
                    <p class="font-semibold text-sm md:text-base truncate">AutoFlow AI</p>
                    <div class="flex items-center gap-1">
                      <span class="w-1.5 h-1.5 bg-[#00D4AA] rounded-full"></span>
                      <span class="text-xs text-[#00D4AA]">${isRTL ? 'نشط' : 'Active'}</span>
                    </div>
                  </div>
                  <span class="px-2 py-1 rounded-full bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-medium">AI</span>
                </div>
                <!-- Chat Messages -->
                <div class="space-y-2 md:space-y-3 text-xs md:text-sm">
                  <div class="flex ${isRTL ? 'justify-start' : 'justify-start'}">
                    <div class="bg-gray-800/50 rounded-xl rounded-bl-sm px-3 py-2 md:px-4 md:py-3 max-w-[85%]">
                      <p class="text-gray-300">${isRTL ? 'مرحباً، أوقات العمل؟' : 'Hi, working hours?'}</p>
                    </div>
                  </div>
                  <div class="flex ${isRTL ? 'justify-end' : 'justify-end'}">
                    <div class="bg-gradient-to-br from-[#00D4AA]/20 to-[#7C3AED]/20 border border-[#00D4AA]/30 rounded-xl rounded-br-sm px-3 py-2 md:px-4 md:py-3 max-w-[85%]">
                      <div class="flex items-center gap-1 mb-1">
                        <span class="w-1 h-1 bg-[#00D4AA] rounded-full"></span>
                        <span class="text-xs text-[#00D4AA]">${isRTL ? 'رد تلقائي' : 'AI'}</span>
                      </div>
                      <p class="text-white">${isRTL ? 'نعمل 9ص-9م 🕘' : '9AM-9PM 🕘'}</p>
                    </div>
                  </div>
                  <div class="flex ${isRTL ? 'justify-start' : 'justify-start'}">
                    <div class="bg-gray-800/50 rounded-xl rounded-bl-sm px-3 py-2 md:px-4 md:py-3 max-w-[85%]">
                      <p class="text-gray-300">${isRTL ? 'عايز أحجز' : 'Book please'}</p>
                    </div>
                  </div>
                  <div class="flex ${isRTL ? 'justify-end' : 'justify-end'}">
                    <div class="bg-gradient-to-br from-[#00D4AA]/20 to-[#7C3AED]/20 border border-[#00D4AA]/30 rounded-xl rounded-br-sm px-3 py-2 md:px-4 md:py-3 max-w-[85%]">
                      <p class="text-white">✅ ${isRTL ? 'تم الحجز 3م' : 'Booked 3PM'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Floating Badges -->
            <div class="absolute -top-2 ${isRTL ? '-left-2' : '-right-2'} glass rounded-lg px-2 py-1 md:px-3 md:py-1.5 flex items-center gap-1 md:gap-2 animate-pulse-glow text-xs md:text-sm">
              <span class="text-lg md:text-xl">⚡</span>
              <span class="font-medium">${isRTL ? '0.3 ثانية' : '0.3s'}</span>
            </div>
            <div class="absolute -bottom-2 ${isRTL ? '-right-2' : '-left-2'} glass rounded-lg px-2 py-1 md:px-3 md:py-1.5 flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <span class="text-lg md:text-xl">🔄</span>
              <span class="font-medium">24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-6 md:py-12 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div class="glass rounded-xl md:rounded-2xl p-3 md:p-5 text-center card-tech">
          <p class="text-2xl md:text-3xl lg:text-4xl font-black gradient-text">500+</p>
          <p class="text-gray-400 text-xs md:text-sm mt-1">${isRTL ? 'شركة' : 'Companies'}</p>
        </div>
        <div class="glass rounded-xl md:rounded-2xl p-3 md:p-5 text-center card-tech">
          <p class="text-2xl md:text-3xl lg:text-4xl font-black gradient-text">2M+</p>
          <p class="text-gray-400 text-xs md:text-sm mt-1">${isRTL ? 'رسالة/شهر' : 'Messages/Mo'}</p>
        </div>
        <div class="glass rounded-xl md:rounded-2xl p-3 md:p-5 text-center card-tech">
          <p class="text-2xl md:text-3xl lg:text-4xl font-black gradient-text">98%</p>
          <p class="text-gray-400 text-xs md:text-sm mt-1">${isRTL ? 'رضا' : 'Satisfaction'}</p>
        </div>
        <div class="glass rounded-xl md:rounded-2xl p-3 md:p-5 text-center card-tech">
          <p class="text-2xl md:text-3xl lg:text-4xl font-black gradient-text">24/7</p>
          <p class="text-gray-400 text-xs md:text-sm mt-1">${isRTL ? 'تشغيل' : 'Uptime'}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Problem Section -->
  <section class="py-12 md:py-20 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-8 md:mb-16">
        <h2 class="section-title text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4">
          ${content.problem.title}
        </h2>
        <p class="text-base md:text-xl text-gray-400">
          ${isRTL ? 'المشاكل اللي بتحصل كل يوم' : 'Daily challenges that hurt your business'}
        </p>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
        ${content.problem.items.map((item, i) => `
        <div class="card-tech rounded-xl md:rounded-2xl p-4 md:p-6 ${isRTL ? 'text-right' : 'text-left'}">
          <div class="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center mb-3 md:mb-4 ${isRTL ? 'mr-0 ml-auto' : ''}">
            <span class="text-xl md:text-3xl">${item.icon}</span>
          </div>
          <h3 class="text-sm md:text-lg font-semibold mb-1 md:mb-2">${item.title}</h3>
          <p class="text-gray-400 text-xs md:text-sm line-clamp-2 md:line-clamp-none">${item.description}</p>
        </div>
        `).join('')}
      </div>
      <div class="glass rounded-xl md:rounded-2xl p-4 md:p-6 max-w-3xl mx-auto border-l-4 border-yellow-500 ${isRTL ? 'border-r-4 border-l-0' : ''}">
        <p class="text-sm md:text-lg font-semibold text-center">${content.problem.truth}</p>
      </div>
    </div>
  </section>

  <!-- Solution Section -->
  <section class="py-12 md:py-20 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div class="${isRTL ? 'text-right lg:order-2' : 'text-left'}">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass mb-4 md:mb-6 border border-[#00D4AA]/30">
            <span class="text-[#00D4AA] text-sm md:text-base">💡</span>
            <span class="text-xs md:text-sm text-[#00D4AA] font-medium">${isRTL ? 'الحل' : 'The Solution'}</span>
          </div>
          <h2 class="section-title text-2xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6">
            ${content.solution.title}
          </h2>
          <p class="text-base md:text-xl text-gray-400 mb-4 md:mb-6 leading-relaxed">
            ${content.solution.description}
          </p>
          <div class="glass rounded-lg md:rounded-xl p-3 md:p-4 mb-6 md:mb-8 border border-[#00D4AA]/20">
            <p class="text-sm md:text-lg text-[#00D4AA] font-semibold">💪 ${content.solution.benefit}</p>
          </div>
          <ul class="space-y-2 md:space-y-3">
            ${content.solution.features.map(feature => `
            <li class="flex items-start gap-2 md:gap-3 ${isRTL ? 'flex-row-reverse' : ''}">
              <span class="w-5 h-5 md:w-6 md:h-6 rounded bg-[#00D4AA]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-[#00D4AA] text-xs">✓</span>
              </span>
              <span class="text-gray-300 text-sm md:text-base">${feature}</span>
            </li>
            `).join('')}
          </ul>
        </div>
        <div class="${isRTL ? 'lg:order-1' : ''}">
          <div class="gradient-border rounded-xl md:rounded-2xl p-4 md:p-8 glow-purple">
            <h3 class="text-lg md:text-2xl font-bold mb-4 md:mb-6">${isRTL ? '🚀 النتايج' : '🚀 Results'}</h3>
            <div class="space-y-3 md:space-y-4">
              <div class="glass rounded-lg md:rounded-xl p-3 md:p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs md:text-sm text-gray-400">${isRTL ? 'قبل' : 'Before'}</span>
                  <span class="text-red-400 font-bold text-sm md:text-base">${isRTL ? '50% مفيش رد' : '50% Unanswered'}</span>
                </div>
                <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="w-1/2 h-full bg-red-500 rounded-full"></div>
                </div>
              </div>
              <div class="glass rounded-lg md:rounded-xl p-3 md:p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs md:text-sm text-gray-400">${isRTL ? 'بعد' : 'After'}</span>
                  <span class="text-[#00D4AA] font-bold text-sm md:text-base">${isRTL ? '100% رد فوري' : '100% Instant Reply'}</span>
                </div>
                <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="w-full h-full bg-gradient-to-r from-[#00D4AA] to-[#7C3AED] rounded-full"></div>
                </div>
              </div>
              <div class="bg-gradient-to-br from-[#00D4AA]/20 to-[#7C3AED]/20 rounded-lg md:rounded-xl p-3 md:p-4 border border-[#00D4AA]/30">
                <p class="text-xs md:text-sm text-gray-400">${isRTL ? 'تحسن' : 'Improvement'}</p>
                <p class="text-xl md:text-3xl font-black gradient-text">+300% ${isRTL ? 'رضا' : 'Satisfaction'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-12 md:py-20 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-8 md:mb-16">
        <h2 class="section-title text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4">
          ${content.features.title}
        </h2>
        <p class="text-base md:text-xl text-gray-400 max-w-2xl mx-auto">
          ${isRTL ? 'كل المميزات المتقدمة' : 'Advanced features you need'}
        </p>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        ${content.features.items.map((item, i) => `
        <div class="card-tech rounded-xl md:rounded-2xl p-4 md:p-8 ${isRTL ? 'text-right' : 'text-left'}">
          <div class="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-gradient-to-br from-[#00D4AA]/20 to-[#7C3AED]/20 border border-[#00D4AA]/20 flex items-center justify-center mb-4 md:mb-6 ${isRTL ? 'mr-0 ml-auto' : ''}">
            <span class="text-2xl md:text-4xl">${item.icon}</span>
          </div>
          <h3 class="text-base md:text-xl font-bold mb-2 md:mb-3">${item.title}</h3>
          <p class="text-gray-400 text-xs md:text-base">${item.description}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- How It Works Section -->
  <section class="py-12 md:py-20 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-8 md:mb-16">
        <h2 class="section-title text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4">
          ${content.howItWorks.title}
        </h2>
        <p class="text-base md:text-xl text-gray-400">
          ${isRTL ? '3 خطوات بسيطة' : '3 simple steps'}
        </p>
      </div>
      <div class="max-w-4xl mx-auto">
        ${content.howItWorks.steps.map((step, i) => `
        <div class="flex items-start gap-4 md:gap-6 mb-6 md:mb-8 ${isRTL ? 'flex-row-reverse' : ''} last:mb-0">
          <div class="w-14 h-14 md:w-20 md:h-20 rounded-lg md:rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#7C3AED] flex items-center justify-center text-white text-xl md:text-3xl font-black flex-shrink-0 glow">
            ${step.number}
          </div>
          <div class="flex-1 card-tech rounded-xl md:rounded-2xl p-4 md:p-6 ${isRTL ? 'text-right' : 'text-left'}">
            <h3 class="text-base md:text-xl font-bold mb-1 md:mb-2">${step.title}</h3>
            <p class="text-gray-400 text-sm md:text-base">${step.description}</p>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Use Cases Section -->
  <section class="py-12 md:py-20 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <h2 class="section-title text-2xl md:text-4xl lg:text-5xl font-black text-center mb-8 md:mb-12">
        ${content.useCases.title}
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
        ${content.useCases.items.map(item => `
        <div class="card-tech rounded-lg md:rounded-xl p-3 md:p-4 text-center">
          <div class="w-8 h-8 md:w-10 md:h-10 rounded bg-[#00D4AA]/20 flex items-center justify-center mx-auto mb-2">
            <span class="text-[#00D4AA] text-sm md:text-base">✓</span>
          </div>
          <p class="text-xs md:text-sm text-gray-300 font-medium">${item}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="py-12 md:py-20 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-8 md:mb-16">
        <h2 class="section-title text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4">
          ${isRTL ? 'تجارب العملاء' : 'Client Stories'}
        </h2>
        <p class="text-base md:text-xl text-gray-400">
          ${isRTL ? 'قصص نجاح حقيقية' : 'Real success stories'}
        </p>
      </div>
      <div class="grid md:grid-cols-3 gap-4 md:gap-6">
        ${content.testimonials.map((t, i) => `
        <div class="card-tech rounded-xl md:rounded-2xl p-4 md:p-6 ${isRTL ? 'text-right' : 'text-left'}">
          <div class="flex items-center gap-1 mb-3 md:mb-4 ${isRTL ? 'justify-end' : ''}">
            ${[1,2,3,4,5].map(() => `<span class="text-yellow-400 text-sm md:text-base">★</span>`).join('')}
          </div>
          <p class="text-gray-300 mb-4 md:mb-6 text-sm md:text-base italic">"${t.quote}"</p>
          <div class="flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} border-t border-gray-800 pt-4">
            <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
              ${t.name.charAt(0)}
            </div>
            <div>
              <p class="font-semibold text-sm md:text-base">${t.name}</p>
              <p class="text-xs md:text-sm text-[#00D4AA]">${t.role}</p>
              <p class="text-xs text-gray-500">${t.location}</p>
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="pricing" class="py-12 md:py-20 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-8 md:mb-16">
        <h2 class="section-title text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4">
          ${content.pricing.title}
        </h2>
        <p class="text-base md:text-xl text-gray-400">
          ${isRTL ? 'اختار الخطة المناسبة' : 'Choose your plan'}
        </p>
      </div>
      <div class="grid md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
        ${content.pricing.tiers.map((tier, i) => `
        <div class="relative ${tier.popular ? 'gradient-border rounded-xl md:rounded-2xl p-4 md:p-8 glow' : 'card-tech rounded-xl md:rounded-2xl p-4 md:p-8'} ${isRTL ? 'text-right' : 'text-left'}">
          ${tier.popular ? `
          <div class="absolute -top-3 ${isRTL ? 'right-4 md:right-8' : 'left-4 md:left-8'} bg-gradient-to-r from-[#00D4AA] to-[#7C3AED] px-3 py-1 md:px-4 md:py-1 rounded-full text-xs md:text-sm font-bold whitespace-nowrap">
            ${isRTL ? '🔥 الأكثر طلباً' : '🔥 Popular'}
          </div>
          ` : ''}
          <h3 class="text-lg md:text-2xl font-bold mb-1 md:mb-2">${tier.name}</h3>
          <p class="text-gray-400 text-xs md:text-base mb-4 md:mb-6">${tier.tagline}</p>
          <ul class="space-y-2 md:space-y-3 mb-6 md:mb-8">
            ${tier.features.map(f => `
            <li class="flex items-center gap-2 md:gap-3 ${isRTL ? 'flex-row-reverse' : ''}">
              <span class="w-4 h-4 md:w-5 md:h-5 rounded bg-[#00D4AA]/20 flex items-center justify-center flex-shrink-0">
                <span class="text-[#00D4AA] text-xs">✓</span>
              </span>
              <span class="text-gray-300 text-xs md:text-sm">${f}</span>
            </li>
            `).join('')}
          </ul>
          <a href="#cta" class="${tier.popular ? 'btn-gradient' : 'btn-outline'} block w-full text-center px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-semibold text-sm md:text-base">
            ${isRTL ? 'ابدأ الآن' : 'Get Started'}
          </a>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section id="faq" class="py-12 md:py-20 relative">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-8 md:mb-16">
        <h2 class="section-title text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4">
          ${isRTL ? 'الأسئلة الشائعة' : 'FAQ'}
        </h2>
      </div>
      <div class="space-y-3 md:space-y-4">
        ${content.faq.map((item, i) => `
        <div class="card-tech rounded-lg md:rounded-xl overflow-hidden">
          <button class="w-full px-4 py-4 md:px-6 md:py-5 ${isRTL ? 'text-right' : 'text-left'} flex justify-between items-center gap-4" onclick="toggleFAQ(${i})">
            <span class="font-semibold text-sm md:text-base">${item.question}</span>
            <span class="text-[#00D4AA] text-lg md:text-2xl flex-shrink-0" id="faq-icon-${i}">+</span>
          </button>
          <div class="px-4 pb-4 md:px-6 md:pb-5 hidden border-t border-gray-800" id="faq-answer-${i}">
            <p class="text-gray-400 text-sm md:text-base pt-3 md:pt-4">${item.answer}</p>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section id="cta" class="py-16 md:py-24 relative">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <div class="gradient-border rounded-2xl md:rounded-3xl p-6 md:p-12 glow">
        <h2 class="text-2xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6">
          ${content.finalCta.headline}
        </h2>
        <p class="text-base md:text-xl text-gray-400 mb-6 md:mb-10">
          ${content.finalCta.subheadline}
        </p>
        <div class="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}">
          <a href="mailto:mostafa@rawash.com?subject=${encodeURIComponent(content.finalCta.cta)}" class="btn-gradient px-6 py-3 md:px-10 md:py-4 rounded-lg md:rounded-xl text-base md:text-lg font-semibold inline-flex items-center justify-center gap-2">
            ${content.finalCta.cta}
            <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </a>
          <a href="https://wa.me/201099129550" target="_blank" class="glass px-6 py-3 md:px-10 md:py-4 rounded-lg md:rounded-xl text-base md:text-lg font-semibold border border-[#00D4AA]/30 hover:bg-[#00D4AA]/10 transition inline-flex items-center justify-center gap-2">
            💬 ${isRTL ? 'واتس آب' : 'WhatsApp'}
          </a>
        </div>
        <p class="text-gray-500 mt-4 md:mt-6 text-xs md:text-sm">
          ✅ ${content.finalCta.reassurance}
        </p>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="py-12 md:py-16 border-t border-gray-800 safe-bottom">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1 ${isRTL ? 'text-center md:text-right' : 'text-center md:text-left'}">
          <a href="/" class="flex items-center justify-center md:justify-start gap-3 mb-4 ${isRTL ? 'md:flex-row-reverse' : ''}">
            <div class="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#7C3AED] flex items-center justify-center">
              <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </div>
            <span class="text-lg md:text-xl font-bold gradient-text">AutoFlow</span>
          </a>
          <p class="text-gray-500 text-xs md:text-sm mb-4">
            ${isRTL ? 'أتمتة ذكية للواتس آب' : 'AI-powered WhatsApp automation'}
          </p>
          <!-- Social Icons -->
          <div class="flex justify-center md:justify-start gap-3 ${isRTL ? 'md:flex-row-reverse' : ''}">
            <a href="#" class="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition text-sm md:text-base">
              📘
            </a>
            <a href="#" class="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition text-sm md:text-base">
              📸
            </a>
            <a href="#" class="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition text-sm md:text-base">
              🐦
            </a>
            <a href="#" class="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition text-sm md:text-base">
              💼
            </a>
          </div>
        </div>
        
        <!-- Features -->
        <div class="${isRTL ? 'text-right' : 'text-left'}">
          <h3 class="font-semibold mb-3 md:mb-4 text-[#00D4AA] text-sm md:text-base">${isRTL ? 'المميزات' : 'Features'}</h3>
          <ul class="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-400">
            <li><a href="#features" class="hover:text-white transition">${isRTL ? 'ردود تلقائية' : 'Auto-Replies'}</a></li>
            <li><a href="#features" class="hover:text-white transition">${isRTL ? 'ذكاء اصطناعي' : 'AI Engine'}</a></li>
            <li><a href="#features" class="hover:text-white transition">${isRTL ? 'تحليلات' : 'Analytics'}</a></li>
            <li><a href="#pricing" class="hover:text-white transition">${isRTL ? 'الأسعار' : 'Pricing'}</a></li>
          </ul>
        </div>
        
        <!-- Support -->
        <div class="${isRTL ? 'text-right' : 'text-left'}">
          <h3 class="font-semibold mb-3 md:mb-4 text-[#00D4AA] text-sm md:text-base">${isRTL ? 'الدعم' : 'Support'}</h3>
          <ul class="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-400">
            <li><a href="#faq" class="hover:text-white transition">${isRTL ? 'الأسئلة' : 'FAQ'}</a></li>
            <li><a href="mailto:mostafa@rawash.com" class="hover:text-white transition">${isRTL ? 'تواصل' : 'Contact'}</a></li>
            <li><a href="#" class="hover:text-white transition">${isRTL ? 'مساعدة' : 'Help'}</a></li>
            <li><a href="#" class="hover:text-white transition">${isRTL ? 'توثيق' : 'Docs'}</a></li>
          </ul>
        </div>
        
        <!-- Contact -->
        <div class="${isRTL ? 'text-right' : 'text-left'}">
          <h3 class="font-semibold mb-3 md:mb-4 text-[#00D4AA] text-sm md:text-base">${isRTL ? 'تواصل' : 'Connect'}</h3>
          <ul class="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-400">
            <li class="flex items-center gap-2 ${isRTL ? 'justify-end' : ''}">
              <span>📧</span>
              <span class="break-all">mostafa@rawash.com</span>
            </li>
            <li class="flex items-center gap-2 ${isRTL ? 'justify-end' : ''}">
              <span>📱</span>
              <span>+201099129550</span>
            </li>
            <li class="pt-1">
              <a href="https://ensoulify.com" class="text-[#00D4AA] hover:underline" target="_blank">ensoulify.com ↗</a>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
        <p class="text-xs md:text-sm text-gray-500 text-center md:text-left">© ${new Date().getFullYear()} AutoFlow by Ensoulify. ${isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
        <p class="text-xs md:text-sm text-gray-500">${isRTL ? 'تطوير Mostafa Rawash' : 'Built by Mostafa Rawash'}</p>
      </div>
    </div>
  </footer>

  <script>
    function toggleFAQ(index) {
      const answer = document.getElementById('faq-answer-' + index);
      const icon = document.getElementById('faq-icon-' + index);
      if (answer.classList.contains('hidden')) {
        answer.classList.remove('hidden');
        icon.textContent = '−';
      } else {
        answer.classList.add('hidden');
        icon.textContent = '+';
      }
    }
    function toggleMobileMenu() {
      const menu = document.getElementById('mobile-menu');
      menu.classList.toggle('hidden');
    }
    // Close mobile menu when clicking on links
    document.querySelectorAll('#mobile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.add('hidden');
      });
    });
  </script>
  
  <!-- WhatsApp Floating Button -->
  <a href="https://wa.me/201099129550" target="_blank" class="fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-bounce" style="animation-duration: 2s;">
    <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    </svg>
  </a>
</body>
</html>`;
}

module.exports = { generateHTML };