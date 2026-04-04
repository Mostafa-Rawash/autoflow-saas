// Generic Channel Service Landing Page Generator
// Creates high-converting landing pages for each channel
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

function generateChannelServicePage(channel, lang) {
  const isRTL = lang === 'ar';
  
  const channels = {
    whatsapp: {
      name: 'WhatsApp',
      nameAr: 'واتس آب',
      color: '#25D366',
      icon: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>',
      stats: { users: '2B+', messages: '100B/day', countries: '180+' },
      hero: {
        title: isRTL ? 'رد على عملائك على واتس آب في ثانية واحدة - تلقائياً' : 'Reply to Your WhatsApp Customers in One Second - Automatically',
        subtitle: isRTL ? 'زيّد مبيعاتك ووفّر وقتك مع نظام ردود ذكي يرد على العملاء 24 ساعة' : 'Increase your sales and save time with a smart reply system that responds to customers 24/7'
      },
      howItWorks: isRTL ? [
        { step: '1', title: 'إحنا هنقعدلك كل حاجة', desc: 'نربط واتس آب بيزنس عندك' },
        { step: '2', title: 'نظبط الردود الصح', desc: 'نخصص الرسايل على حسب نشاطك' },
        { step: '3', title: 'تبدأ تستقبل وتردف', desc: 'النظام يرد تلقائي وانت تتدخل لما تحب' }
      ] : [
        { step: '1', title: 'We Set Everything Up', desc: 'We connect your WhatsApp Business' },
        { step: '2', title: 'We Customize Replies', desc: 'Tailor messages to your business' },
        { step: '3', title: 'Start Receiving & Replying', desc: 'Auto replies with your intervention anytime' }
      ],
      problems: isRTL ? [
        { icon: '⏰', title: 'ردود بطيئة', desc: 'العملاء ينتظرون ساعات للرد ويزعلوا' },
        { icon: '📱', title: 'رسائل مفقودة', desc: 'رسايل كتير بتضيع وسط المحادثات' },
        { icon: '🏃', title: 'عملاء بيسيبوك', desc: 'العملاء يروحوا للمنافسين اللي بيردوا أسرع' },
        { icon: '😓', title: 'شغل يدوي', desc: 'بتقعد ساعات بترد على نفس الأسئلة' }
      ] : [
        { icon: '⏰', title: 'Slow Replies', desc: 'Customers wait hours for a reply and get upset' },
        { icon: '📱', title: 'Missed Messages', desc: 'Many messages get lost in conversations' },
        { icon: '🏃', title: 'Losing Customers', desc: 'Customers leave for competitors who reply faster' },
        { icon: '😓', title: 'Manual Work', desc: 'Spending hours answering the same questions' }
      ],
      solution: isRTL ? [
        'إحنا اللي بنرد على الرسايل بدالك',
        'فريقك يقدر يتدخل في أي وقت',
        'العملاء ميحسّوش إنه روبوت',
        'بتوفر وقت وبتزود مبيعاتك'
      ] : [
        'We reply to messages on your behalf',
        'Your team can jump in anytime',
        'Customers won\'t feel it\'s a bot',
        'You save time and increase sales'
      ],
      features: isRTL ? [
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
      ],
      useCases: isRTL ? [
        { icon: '🍽️', title: 'مطاعم', desc: 'حجوزات وأوردرات', link: 'restaurant' },
        { icon: '🏥', title: 'عيادات', desc: 'مواعيد واستفسارات', link: 'clinic' },
        { icon: '🛍️', title: 'متاجر', desc: 'طلبات ومتابعة شحن', link: 'ecommerce' },
        { icon: '🔧', title: 'خدمات', desc: 'استفسارات وحجز', link: 'service' }
      ] : [
        { icon: '🍽️', title: 'Restaurants', desc: 'Reservations and orders', link: 'restaurant' },
        { icon: '🏥', title: 'Clinics', desc: 'Appointments and inquiries', link: 'clinic' },
        { icon: '🛍️', title: 'Shops', desc: 'Orders and shipping tracking', link: 'ecommerce' },
        { icon: '🔧', title: 'Services', desc: 'Inquiries and booking', link: 'service' }
      ]
    },
    messenger: {
      name: 'Messenger',
      nameAr: 'ماسنجر',
      color: '#0084FF',
      icon: '<path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 22l4.832-1.091A9.945 9.945 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.845 0-3.596-.508-5.083-1.387l-.363-.217-3.76.853.853-3.76-.217-.363A8.013 8.013 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>',
      stats: { users: '1.3B+', messages: '20B/month', pages: '200M+' },
      hero: {
        title: isRTL ? 'رد على عملائك على ماسنجر في ثانية واحدة - تلقائياً' : 'Reply to Your Messenger Customers in One Second - Automatically',
        subtitle: isRTL ? 'وصل عملاء فيسبوك بسرعة وزود مبيعاتك' : 'Reach Facebook customers faster and increase your sales'
      },
      howItWorks: isRTL ? [
        { step: '1', title: 'نربط صفحتك', desc: 'نوصل ماسنجر بصفحة فيسبوك' },
        { step: '2', title: 'نظبط الرسايل', desc: 'نجهز ردود تناسب نشاطك' },
        { step: '3', title: 'تبدأ ترد تلقائي', desc: 'النظام يرد وانت تتدخل لما تحب' }
      ] : [
        { step: '1', title: 'We Connect Your Page', desc: 'Link Messenger to your Facebook page' },
        { step: '2', title: 'We Set Up Messages', desc: 'Prepare replies that suit your business' },
        { step: '3', title: 'Start Auto Replying', desc: 'System replies with your intervention anytime' }
      ],
      problems: isRTL ? [
        { icon: '⏰', title: 'ردود بطيئة', desc: 'رسايل ماسنجر بتستنى ساعات' },
        { icon: '📱', title: 'رسائل كتير', desc: 'مش عارف تتابع كل المحادثات' },
        { icon: '🏃', title: 'عملاء بيتصلوا', desc: 'العملاء يسيبوك لما ميردوش' },
        { icon: '😓', title: 'فريق مش متنظم', desc: 'كل واحد بيرد لوحده' }
      ] : [
        { icon: '⏰', title: 'Slow Replies', desc: 'Messenger messages wait for hours' },
        { icon: '📱', title: 'Too Many Messages', desc: 'Can\'t track all conversations' },
        { icon: '🏃', title: 'Customers Leave', desc: 'Customers leave when you don\'t reply' },
        { icon: '😓', title: 'Unorganized Team', desc: 'Everyone replies alone' }
      ],
      solution: isRTL ? [
        'نرد على رسايل ماسنجر تلقائياً',
        'فريقك يشوف كل المحادثات في مكان واحد',
        'رسائل غنية بصور وأزرار',
        'تكامل مع إعلانات فيسبوك'
      ] : [
        'We reply to Messenger messages automatically',
        'Your team sees all conversations in one place',
        'Rich messages with images and buttons',
        'Integration with Facebook ads'
      ],
      features: isRTL ? [
        { title: 'ردود تلقائية فورية', desc: 'نرد على العملاء في ثانية، 24 ساعة' },
        { title: 'رسائل غنية', desc: 'صور، أزرار، قوائم تفاعلية' },
        { title: 'صندوق مشترك', desc: 'كل فريقك في مكان واحد' },
        { title: 'تكامل الإعلانات', desc: 'ربط مع إعلانات فيسبوك' },
        { title: 'متجر فيسبوك', desc: 'بيع مباشر من ماسنجر' },
        { title: 'تقارير الأداء', desc: 'إحصائيات مفصلة' }
      ] : [
        { title: 'Instant Auto Replies', desc: 'Reply in one second, 24/7' },
        { title: 'Rich Messages', desc: 'Images, buttons, interactive lists' },
        { title: 'Shared Inbox', desc: 'All team in one place' },
        { title: 'Ads Integration', desc: 'Connect with Facebook ads' },
        { title: 'Facebook Shop', desc: 'Sell directly from Messenger' },
        { title: 'Performance Reports', desc: 'Detailed statistics' }
      ],
      useCases: isRTL ? [
        { icon: '🍽️', title: 'مطاعم', desc: 'حجوزات واستفسارات', link: 'restaurant' },
        { icon: '🏥', title: 'عيادات', desc: 'مواعيد طبية', link: 'clinic' },
        { icon: '🛍️', title: 'متاجر', desc: 'طلبات وخدمة عملاء', link: 'ecommerce' },
        { icon: '🎓', title: 'تعليم', desc: 'تسجيل واستفسارات', link: 'service' }
      ] : [
        { icon: '🍽️', title: 'Restaurants', desc: 'Reservations and inquiries', link: 'restaurant' },
        { icon: '🏥', title: 'Clinics', desc: 'Medical appointments', link: 'clinic' },
        { icon: '🛍️', title: 'Shops', desc: 'Orders and customer service', link: 'ecommerce' },
        { icon: '🎓', title: 'Education', desc: 'Registration and inquiries', link: 'service' }
      ]
    },
    instagram: {
      name: 'Instagram',
      nameAr: 'إنستجرام',
      color: '#E4405F',
      icon: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>',
      stats: { users: '2B+', posts: '50B+', reels: '140B+' },
      hero: {
        title: isRTL ? 'رد على رسائل إنستجرام في ثانية واحدة - تلقائياً' : 'Reply to Instagram Messages in One Second - Automatically',
        subtitle: isRTL ? 'حوّل متابعيك لعملاء مع ردود ذكية على DM' : 'Turn your followers into customers with smart DM replies'
      },
      howItWorks: isRTL ? [
        { step: '1', title: 'نربط حسابك', desc: 'نوصل إنستجرام بالمنصة' },
        { step: '2', title: 'نظبط الرسايل', desc: 'نجهز ردود DM وتعليقات' },
        { step: '3', title: 'تبدأ توصل عملاء', desc: 'النظام يرد وانت بتركز على المحتوى' }
      ] : [
        { step: '1', title: 'We Connect Your Account', desc: 'Link Instagram to the platform' },
        { step: '2', title: 'We Set Up Messages', desc: 'Prepare DM and comment replies' },
        { step: '3', title: 'Start Converting Followers', desc: 'System replies while you focus on content' }
      ],
      problems: isRTL ? [
        { icon: '📱', title: 'DM كتير', desc: 'رسائل خاصة كتير مش عارف ترد' },
        { icon: '💬', title: 'تعليقات بستنى', desc: 'العملاء بيسألوا في التعليقات' },
        { icon: '🏃', title: 'متابعين بيتصلوا', desc: 'الناس تسيبك لو ميردتش' },
        { icon: '😓', title: 'وقت ضايع', desc: 'بتقعد ساعات في الردود' }
      ] : [
        { icon: '📱', title: 'Too Many DMs', desc: 'Can\'t reply to all private messages' },
        { icon: '💬', title: 'Comments Waiting', desc: 'Customers ask in comments' },
        { icon: '🏃', title: 'Followers Leave', desc: 'People leave if you don\'t reply' },
        { icon: '😓', title: 'Wasted Time', desc: 'Spending hours on replies' }
      ],
      solution: isRTL ? [
        'نرد على DM تلقائياً',
        'نرد على التعليقات كمان',
        'رسائل ذكية تجذب العملاء',
        'تكامل مع متجر إنستجرام'
      ] : [
        'We reply to DMs automatically',
        'We reply to comments too',
        'Smart messages that attract customers',
        'Integration with Instagram shop'
      ],
      features: isRTL ? [
        { title: 'ردود تلقائية على DM', desc: 'نرد على الرسائل الخاصة فوراً' },
        { title: 'رد على التعليقات', desc: 'نرد على تعليقات المنشورات' },
        { title: 'رسائل ذكية', desc: 'محادثات تجذب العملاء' },
        { title: 'تكامل المتجر', desc: 'بيع من إنستجرام' },
        { title: 'جدولة المحتوى', desc: 'نشر تلقائي' },
        { title: 'تحليلات', desc: 'إحصائيات المتابعين' }
      ] : [
        { title: 'Auto DM Replies', desc: 'Reply to private messages instantly' },
        { title: 'Comment Replies', desc: 'Reply to post comments' },
        { title: 'Smart Messages', desc: 'Conversations that attract customers' },
        { title: 'Shop Integration', desc: 'Sell from Instagram' },
        { title: 'Content Scheduling', desc: 'Auto posting' },
        { title: 'Analytics', desc: 'Follower statistics' }
      ],
      useCases: isRTL ? [
        { icon: '👗', title: 'أزياء', desc: 'استفسارات ومقاسات', link: 'ecommerce' },
        { icon: '🍽️', title: 'مطاعم', desc: 'منيو وحجوزات', link: 'restaurant' },
        { icon: '💄', title: 'تجميل', desc: 'منتجات واستفسارات', link: 'ecommerce' },
        { icon: '🏋️', title: 'رياضة', desc: 'برامج واشتراكات', link: 'service' }
      ] : [
        { icon: '👗', title: 'Fashion', desc: 'Inquiries and sizes', link: 'ecommerce' },
        { icon: '🍽️', title: 'Restaurants', desc: 'Menu and reservations', link: 'restaurant' },
        { icon: '💄', title: 'Beauty', desc: 'Products and inquiries', link: 'ecommerce' },
        { icon: '🏋️', title: 'Fitness', desc: 'Programs and subscriptions', link: 'service' }
      ]
    },
    telegram: {
      name: 'Telegram',
      nameAr: 'تيليجرام',
      color: '#0088cc',
      icon: '<path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 6.823c.14-.005.26.026.37.081.14.068.25.173.31.293.06.12.09.258.09.408v.02l-.01.05-.01.07-1.1 4.8-.17.73-.18.8c-.05.22-.1.43-.15.6-.05.17-.09.3-.13.38-.05.1-.11.14-.18.14-.07 0-.17-.04-.29-.12a1.3 1.3 0 00-.47-.22.87.87 0 00-.49.01c-.17.05-.33.13-.49.24-.16.11-.32.24-.47.38-.15.14-.3.29-.43.44l-.2.22-.1.11-.03.03h-.01l-.01.01-.02.01c-.05.04-.11.05-.18.05a.5.5 0 01-.22-.06.7.7 0 01-.2-.16l-.02-.02-.04-.04-.04-.04c-.1-.12-.22-.26-.34-.42-.12-.16-.24-.34-.35-.53-.11-.19-.21-.39-.3-.6-.09-.21-.16-.43-.21-.66-.05-.23-.08-.47-.08-.71 0-.32.05-.62.16-.9.11-.28.25-.53.44-.74.19-.21.4-.38.66-.51.26-.13.53-.19.83-.19.19 0 .38.03.55.09.17.06.33.14.47.24l.11.07.07.04c.07.04.13.06.2.06.08 0 .14-.04.18-.12l.18-.47.19-.47.17-.42.15-.37.12-.3.08-.19.04-.09.02-.04.01-.02c.06-.13.14-.22.24-.28.1-.06.21-.09.33-.09z"/>',
      stats: { users: '800M+', messages: '15B/day', groups: '2B+' },
      hero: {
        title: isRTL ? 'بوت تيليجرام ذكي يرد على عملائك تلقائياً' : 'Smart Telegram Bot Replies to Your Customers Automatically',
        subtitle: isRTL ? 'أتمت قنواتك ومجموعاتك مع بوت ذكي بالذكاء الاصطناعي' : 'Automate your channels and groups with an AI-powered smart bot'
      },
      howItWorks: isRTL ? [
        { step: '1', title: 'نجهز البوت', desc: 'بنعملك بوت مخصص لنشاطك' },
        { step: '2', title: 'نظبط الأوامر', desc: 'نضبط الردود والأزرار' },
        { step: '3', title: 'النظام يشتغل', desc: 'البوت يرد تلقائي 24 ساعة' }
      ] : [
        { step: '1', title: 'We Build Your Bot', desc: 'Create a custom bot for your business' },
        { step: '2', title: 'We Set Commands', desc: 'Configure replies and buttons' },
        { step: '3', title: 'Bot Goes Live', desc: 'Bot replies automatically 24/7' }
      ],
      problems: isRTL ? [
        { icon: '📱', title: 'رسائل كتير', desc: 'مش عارف ترد على كل الرسايل' },
        { icon: '👥', title: 'مجموعات كبيرة', desc: 'صعب تدير مجموعات كتير' },
        { icon: '🤖', title: 'بوتات معقدة', desc: 'مش عارف تعمل بوت بنفسك' },
        { icon: '😓', title: 'وقت ضايع', desc: 'بتقعد ساعات في الإدارة' }
      ] : [
        { icon: '📱', title: 'Too Many Messages', desc: 'Can\'t reply to all messages' },
        { icon: '👥', title: 'Large Groups', desc: 'Hard to manage many groups' },
        { icon: '🤖', title: 'Complex Bots', desc: 'Can\'t build a bot yourself' },
        { icon: '😓', title: 'Wasted Time', desc: 'Spending hours on management' }
      ],
      solution: isRTL ? [
        'بنعملك بوت ذكي يرد تلقائياً',
        'يدار قنوات ومجموعات لا محدودة',
        'بوت سهل الاستخدام',
        'تكامل مع مواقعك'
      ] : [
        'We build a smart bot that replies automatically',
        'Manage unlimited channels and groups',
        'Easy to use bot',
        'Integration with your websites'
      ],
      features: isRTL ? [
        { title: 'بوت ذكي', desc: 'ذكاء اصطناعي يرد صح' },
        { title: 'قنوات لا محدودة', desc: 'إدارة قنوات ومجموعات' },
        { title: 'وسائط غنية', desc: 'صور، فيديو، ملفات' },
        { title: 'أوامر مخصصة', desc: 'قوائم وأزرار' },
        { title: 'تكامل الويب', desc: 'ربط مع مواقعك' },
        { title: 'مجاني بالكامل', desc: 'بدون أي رسوم' }
      ] : [
        { title: 'Smart Bot', desc: 'AI that replies right' },
        { title: 'Unlimited Channels', desc: 'Manage channels and groups' },
        { title: 'Rich Media', desc: 'Images, videos, files' },
        { title: 'Custom Commands', desc: 'Menus and buttons' },
        { title: 'Web Integration', desc: 'Connect with your sites' },
        { title: 'Completely Free', desc: 'No fees at all' }
      ],
      useCases: isRTL ? [
        { icon: '📢', title: 'قنوات إخبارية', desc: 'نشر تلقائي', link: 'service' },
        { icon: '🏪', title: 'متاجر', desc: 'طلبات وخدمة عملاء', link: 'ecommerce' },
        { icon: '🎓', title: 'تعليم', desc: 'دورات وإعلانات', link: 'service' },
        { icon: '🎮', title: 'مجتمعات', desc: 'مجموعات نقاش', link: 'service' }
      ] : [
        { icon: '📢', title: 'News Channels', desc: 'Auto posting', link: 'service' },
        { icon: '🏪', title: 'Shops', desc: 'Orders and support', link: 'ecommerce' },
        { icon: '🎓', title: 'Education', desc: 'Courses and announcements', link: 'service' },
        { icon: '🎮', title: 'Communities', desc: 'Discussion groups', link: 'service' }
      ]
    },
    livechat: {
      name: 'Live Chat',
      nameAr: 'محادثة مباشرة',
      color: '#00D4AA',
      icon: '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>',
      stats: { users: '41%', messages: '48%', response: '<1min' },
      hero: {
        title: isRTL ? 'محادثة مباشرة على موقعك ترد على الزوار تلقائياً' : 'Live Chat on Your Website Replies to Visitors Automatically',
        subtitle: isRTL ? 'زود تحويلاتك مع محادثة فورية 24 ساعة' : 'Increase your conversions with 24/7 instant chat'
      },
      howItWorks: isRTL ? [
        { step: '1', title: 'نضيف الودجت', desc: 'نركب المحادثة على موقعك' },
        { step: '2', title: 'نظبط الرسايل', desc: 'نجهز الردود التلقائية' },
        { step: '3', title: 'الزوار يتحولوا', desc: 'النظام يرد ويحجز العملاء' }
      ] : [
        { step: '1', title: 'We Add the Widget', desc: 'Install chat on your website' },
        { step: '2', title: 'We Set Up Messages', desc: 'Configure auto replies' },
        { step: '3', title: 'Visitors Convert', desc: 'System replies and captures leads' }
      ],
      problems: isRTL ? [
        { icon: '👥', title: 'زوار بتسيب', desc: 'الناس تدخل وتخرج بسرعة' },
        { icon: '⏰', title: 'مش متواجد دايمًا', desc: 'مش عارف ترد 24 ساعة' },
        { icon: '💰', title: 'تحويلات قليلة', desc: 'زوار كتير بس مش بيشتروا' },
        { icon: '😓', title: 'سؤال متكرر', desc: 'بترد على نفس السؤال كتير' }
      ] : [
        { icon: '👥', title: 'Visitors Leave', desc: 'People enter and leave quickly' },
        { icon: '⏰', title: 'Not Always Available', desc: 'Can\'t reply 24/7' },
        { icon: '💰', title: 'Low Conversions', desc: 'Many visitors but few buyers' },
        { icon: '😓', title: 'Repeated Questions', desc: 'Answering the same question often' }
      ],
      solution: isRTL ? [
        'نرد على زوار موقعك تلقائياً',
        'محادثة فورية 24 ساعة',
        'نحجز العملاء المحتملين',
        'فريقك يتدخل لما يحتاج'
      ] : [
        'We reply to your website visitors automatically',
        '24/7 instant chat',
        'We capture leads',
        'Your team steps in when needed'
      ],
      features: isRTL ? [
        { title: 'ردود فورية', desc: 'نرد في ثانية، 24 ساعة' },
        { title: 'ودجت سهل', desc: 'تركيب في دقائق' },
        { title: 'تخصيص شامل', desc: 'ألوان وشعار' },
        { title: 'ردود مسبقة', desc: 'قوالب جاهزة' },
        { title: 'تحليلات الزوار', desc: 'إحصائيات متقدمة' },
        { title: 'تكامل CRM', desc: 'ربط مع أنظمتك' }
      ] : [
        { title: 'Instant Replies', desc: 'Reply in one second, 24/7' },
        { title: 'Easy Widget', desc: 'Install in minutes' },
        { title: 'Full Customization', desc: 'Colors and logo' },
        { title: 'Pre-defined Replies', desc: 'Ready templates' },
        { title: 'Visitor Analytics', desc: 'Advanced statistics' },
        { title: 'CRM Integration', desc: 'Connect with your systems' }
      ],
      useCases: isRTL ? [
        { icon: '🛍️', title: 'متاجر', desc: 'استفسارات وطلبات', link: 'ecommerce' },
        { icon: '🏢', title: 'شركات', desc: 'خدمة عملاء', link: 'service' },
        { icon: '🎓', title: 'تعليم', desc: 'تسجيل ودورات', link: 'service' },
        { icon: '🏥', title: 'عيادات', desc: 'مواعيد واستفسارات', link: 'clinic' }
      ] : [
        { icon: '🛍️', title: 'Shops', desc: 'Inquiries and orders', link: 'ecommerce' },
        { icon: '🏢', title: 'Companies', desc: 'Customer service', link: 'service' },
        { icon: '🎓', title: 'Education', desc: 'Registration and courses', link: 'service' },
        { icon: '🏥', title: 'Clinics', desc: 'Appointments and inquiries', link: 'clinic' }
      ]
    },
    email: {
      name: 'Email',
      nameAr: 'إيميل',
      color: '#EA4335',
      icon: '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
      stats: { users: '4B+', messages: '300B/day', open: '20%' },
      hero: {
        title: isRTL ? 'نظام ذكي يرد على إيميلاتك تلقائياً' : 'Smart System Replies to Your Emails Automatically',
        subtitle: isRTL ? 'وفّر وقتك مع ردود ذكية على كل الإيميلات' : 'Save your time with smart replies to all emails'
      },
      howItWorks: isRTL ? [
        { step: '1', title: 'نربط الإيميل', desc: 'نوصل حسابك بالمنصة' },
        { step: '2', title: 'نظبط التصنيف', desc: 'نرتب الإيميلات والردود' },
        { step: '3', title: 'النظام يرد', desc: 'يرد تلقائي وأنت تتدخل لما تحب' }
      ] : [
        { step: '1', title: 'We Connect Email', desc: 'Link your account to the platform' },
        { step: '2', title: 'We Set Up Sorting', desc: 'Organize emails and replies' },
        { step: '3', title: 'System Replies', desc: 'Auto replies with your intervention anytime' }
      ],
      problems: isRTL ? [
        { icon: '📧', title: 'إيميلات كتير', desc: 'إنبوكس مليان ومش عارف ترد' },
        { icon: '⏰', title: 'وقت طويل', desc: 'بتقعد ساعات في الردود' },
        { icon: '📋', title: 'تصنيف صعب', desc: 'مش عارف ترتب الإيميلات' },
        { icon: '😓', title: 'سؤال متكرر', desc: 'نفس السؤال كتير' }
      ] : [
        { icon: '📧', title: 'Too Many Emails', desc: 'Inbox full and can\'t reply' },
        { icon: '⏰', title: 'Long Time', desc: 'Spending hours on replies' },
        { icon: '📋', title: 'Hard to Organize', desc: 'Can\'t sort emails' },
        { icon: '😓', title: 'Repeated Questions', desc: 'Same question often' }
      ],
      solution: isRTL ? [
        'نرد على إيميلاتك تلقائياً',
        'نصنف الإيميلات لك',
        'ردود ذكية تناسب نشاطك',
        'تكامل مع Outlook و Gmail'
      ] : [
        'We reply to your emails automatically',
        'We categorize emails for you',
        'Smart replies that suit your business',
        'Integration with Outlook and Gmail'
      ],
      features: isRTL ? [
        { title: 'ردود تلقائية', desc: 'نرد على الإيميلات فوراً' },
        { title: 'تصنيف ذكي', desc: 'ترتيب تلقائي' },
        { title: 'تصفية تلقائية', desc: 'فلترة الإيميلات' },
        { title: 'تكامل Outlook/Gmail', desc: 'ربط سهل' },
        { title: 'تقارير مفصلة', desc: 'إحصائيات الأداء' },
        { title: 'ردود مسبقة', desc: 'قوالب جاهزة' }
      ] : [
        { title: 'Auto Replies', desc: 'Reply to emails instantly' },
        { title: 'Smart Categorization', desc: 'Auto sorting' },
        { title: 'Auto Filtering', desc: 'Filter emails' },
        { title: 'Outlook/Gmail Integration', desc: 'Easy connection' },
        { title: 'Detailed Reports', desc: 'Performance statistics' },
        { title: 'Pre-defined Replies', desc: 'Ready templates' }
      ],
      useCases: isRTL ? [
        { icon: '🏢', title: 'شركات', desc: 'خدمة عملاء', link: 'service' },
        { icon: '🛍️', title: 'متاجر', desc: 'طلبات واستفسارات', link: 'ecommerce' },
        { icon: '🏥', title: 'عيادات', desc: 'مواعيد', link: 'clinic' },
        { icon: '🎓', title: 'تعليم', desc: 'تسجيل ودورات', link: 'service' }
      ] : [
        { icon: '🏢', title: 'Companies', desc: 'Customer service', link: 'service' },
        { icon: '🛍️', title: 'Shops', desc: 'Orders and inquiries', link: 'ecommerce' },
        { icon: '🏥', title: 'Clinics', desc: 'Appointments', link: 'clinic' },
        { icon: '🎓', title: 'Education', desc: 'Registration and courses', link: 'service' }
      ]
    },
    sms: {
      name: 'SMS',
      nameAr: 'رسائل نصية',
      color: '#7C3AED',
      icon: '<path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-4.2-5.78v1.75l3.2-2.99L12.8 9v1.7c-3.11.43-4.35 2.56-4.8 4.7 1.11-1.5 2.58-2.18 4.8-2.18z"/>',
      stats: { users: '5B+', messages: '100B/month', countries: '200+' },
      hero: {
        title: isRTL ? 'أبعت رسائل نصية لعملائك بضغطة زر' : 'Send Text Messages to Your Customers with One Click',
        subtitle: isRTL ? 'تواصل مع عملائك عبر SMS بسهولة وسرعة' : 'Reach your customers via SMS easily and quickly'
      },
      howItWorks: isRTL ? [
        { step: '1', title: 'نظبط الحساب', desc: 'نجهز حساب الإرسال' },
        { step: '2', title: 'نضيف العملاء', desc: 'نرفع قائمة أرقامك' },
        { step: '3', title: 'أبعت رسايلك', desc: 'أرسل للآلاف بضغطة زر' }
      ] : [
        { step: '1', title: 'We Set Up Account', desc: 'Configure sending account' },
        { step: '2', title: 'We Add Customers', desc: 'Upload your contact list' },
        { step: '3', title: 'Send Messages', desc: 'Reach thousands with one click' }
      ],
      problems: isRTL ? [
        { icon: '📱', title: 'تواصل صعب', desc: 'مش عارف توصل لكل العملاء' },
        { icon: '⏰', title: 'وقت طويل', desc: 'بتقعد ساعات في الإرسال' },
        { icon: '💰', title: 'تكلفة عالية', desc: 'إرسال فردي مكلف' },
        { icon: '😓', title: 'مش متأكد', desc: 'مش عارف وصلت ولا لأ' }
      ] : [
        { icon: '📱', title: 'Hard to Reach', desc: 'Can\'t reach all customers' },
        { icon: '⏰', title: 'Long Time', desc: 'Spending hours sending' },
        { icon: '💰', title: 'High Cost', desc: 'Individual sending is expensive' },
        { icon: '😓', title: 'Uncertain', desc: 'Don\'t know if delivered' }
      ],
      solution: isRTL ? [
        'أبعت لآلاف العملاء بضغطة زر',
        'أسعار منافسة',
        'تقارير تسليم فورية',
        'جدولة الرسائل'
      ] : [
        'Send to thousands of customers with one click',
        'Competitive prices',
        'Instant delivery reports',
        'Schedule messages'
      ],
      features: isRTL ? [
        { title: 'إرسال جماعي', desc: 'آلاف الرسائل دفعة واحدة' },
        { title: 'جدولة', desc: 'إرسال في وقت محدد' },
        { title: 'تقارير تسليم', desc: 'تتبع كل رسالة' },
        { title: '200+ دولة', desc: 'تغطية واسعة' },
        { title: 'أسعار منافسة', desc: 'أفضل الأسعار' },
        { title: 'تكامل سهل', desc: 'ربط مع أنظمتك' }
      ] : [
        { title: 'Bulk Sending', desc: 'Thousands of messages at once' },
        { title: 'Scheduling', desc: 'Send at specific time' },
        { title: 'Delivery Reports', desc: 'Track every message' },
        { title: '200+ Countries', desc: 'Wide coverage' },
        { title: 'Competitive Prices', desc: 'Best prices' },
        { title: 'Easy Integration', desc: 'Connect with your systems' }
      ],
      useCases: isRTL ? [
        { icon: '🛍️', title: 'متاجر', desc: 'عروض وخصومات', link: 'ecommerce' },
        { icon: '🏥', title: 'عيادات', desc: 'تذكير بمواعيد', link: 'clinic' },
        { icon: '🍽️', title: 'مطاعم', desc: 'عروض يومية', link: 'restaurant' },
        { icon: '🏦', title: 'بنوك', desc: 'تنبيهات وتأكيدات', link: 'service' }
      ] : [
        { icon: '🛍️', title: 'Shops', desc: 'Offers and discounts', link: 'ecommerce' },
        { icon: '🏥', title: 'Clinics', desc: 'Appointment reminders', link: 'clinic' },
        { icon: '🍽️', title: 'Restaurants', desc: 'Daily offers', link: 'restaurant' },
        { icon: '🏦', title: 'Banks', desc: 'Alerts and confirmations', link: 'service' }
      ]
    },
    api: {
      name: 'Custom API',
      nameAr: 'API مخصص',
      color: '#F59E0B',
      icon: '<path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>',
      stats: { uptime: '99.9%', response: '<100ms', requests: '1M/day' },
      hero: {
        title: isRTL ? 'API مخصص يربط كل أنظمتك بسهولة' : 'Custom API Connects All Your Systems Easily',
        subtitle: isRTL ? 'تكامل سريع وآمن مع أي نظام تستخدمه' : 'Fast and secure integration with any system you use'
      },
      howItWorks: isRTL ? [
        { step: '1', title: 'نجهز الـ API', desc: 'نوفر لك مفاتيح التوثيق' },
        { step: '2', title: 'نربط أنظمتك', desc: 'نكتب كود التكامل' },
        { step: '3', title: 'كل حاجة تشتغل', desc: 'الأنظمة تتكامل بسلاسة' }
      ] : [
        { step: '1', title: 'We Provide API', desc: 'Give you authentication keys' },
        { step: '2', title: 'We Connect Systems', desc: 'Write integration code' },
        { step: '3', title: 'Everything Works', desc: 'Systems integrate seamlessly' }
      ],
      problems: isRTL ? [
        { icon: '🔌', title: 'تكامل صعب', desc: 'مش عارف تربط الأنظمة' },
        { icon: '⏰', title: 'وقت طويل', desc: 'التطوير بياخد وقت' },
        { icon: '🔒', title: 'أمان', desc: 'قلقان من الأمان' },
        { icon: '😓', title: 'تعقيد', desc: 'API معقدة' }
      ] : [
        { icon: '🔌', title: 'Hard Integration', desc: 'Can\'t connect systems' },
        { icon: '⏰', title: 'Long Time', desc: 'Development takes time' },
        { icon: '🔒', title: 'Security', desc: 'Worried about security' },
        { icon: '😓', title: 'Complexity', desc: 'Complex API' }
      ],
      solution: isRTL ? [
        'API سهلة الاستخدام',
        'توثيق شامل',
        'أمان OAuth 2.0',
        'دعم فني متواصل'
      ] : [
        'Easy to use API',
        'Complete documentation',
        'OAuth 2.0 security',
        'Continuous technical support'
      ],
      features: isRTL ? [
        { title: 'RESTful API', desc: 'سهلة ومرونة' },
        { title: 'Webhooks', desc: 'إشعارات لحظية' },
        { title: 'SDK متعدد', desc: 'JavaScript, Python, PHP' },
        { title: 'GraphQL', desc: 'استعلامات مرنة' },
        { title: 'OAuth 2.0', desc: 'أمان متقدم' },
        { title: 'توثيق شامل', desc: 'أمثلة ودليل' }
      ] : [
        { title: 'RESTful API', desc: 'Easy and flexible' },
        { title: 'Webhooks', desc: 'Real-time notifications' },
        { title: 'Multi SDK', desc: 'JavaScript, Python, PHP' },
        { title: 'GraphQL', desc: 'Flexible queries' },
        { title: 'OAuth 2.0', desc: 'Advanced security' },
        { title: 'Full Documentation', desc: 'Examples and guide' }
      ],
      useCases: isRTL ? [
        { icon: '🏢', title: 'شركات', desc: 'تكامل داخلي', link: 'service' },
        { icon: '🛍️', title: 'متاجر', desc: 'ربط مع المتجر', link: 'ecommerce' },
        { icon: '🏥', title: 'عيادات', desc: 'تكامل مع أنظمة', link: 'clinic' },
        { icon: '📱', title: 'تطبيقات', desc: 'ربط التطبيقات', link: 'service' }
      ] : [
        { icon: '🏢', title: 'Companies', desc: 'Internal integration', link: 'service' },
        { icon: '🛍️', title: 'Shops', desc: 'Connect with store', link: 'ecommerce' },
        { icon: '🏥', title: 'Clinics', desc: 'System integration', link: 'clinic' },
        { icon: '📱', title: 'Apps', desc: 'Connect apps', link: 'service' }
      ]
    }
  };
  
  const ch = channels[channel];
  if (!ch) return '';
  
  const title = isRTL ? `${ch.nameAr} - خدمة عملاء آلية | AutoFlow` : `${ch.name} - Automated Customer Service | AutoFlow`;
  
  const bodyContent = `
    ${generateHeader(lang)}
    
    <!-- Hero Section -->
    <section class="pt-28 md:pt-44 pb-16 md:pb-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center max-w-4xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style="color: ${ch.color};">${ch.icon}</svg>
            <span class="text-sm font-medium" style="color: ${ch.color};">${ch.name}</span>
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span class="gradient-text">${ch.hero.title}</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">${ch.hero.subtitle}</p>
          
          <!-- Channel Stats -->
          ${ch.stats ? `
          <div class="flex flex-wrap justify-center gap-6 md:gap-12 mb-10">
            ${Object.entries(ch.stats).map(([key, value]) => `
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-black" style="color: ${ch.color};">${value}</div>
              <div class="text-xs md:text-sm text-gray-500">${isRTL ? { users: 'مستخدم', messages: 'رسالة', countries: 'دولة', pages: 'صفحة', posts: 'منشور', reels: 'ريلز', groups: 'مجموعة', open: 'معدل فتح', response: 'رد', uptime: 'تشغيل', requests: 'طلبات' }[key] || key : key}</div>
            </div>
            `).join('')}
          </div>
          ` : ''}
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/201099129550?text=${encodeURIComponent(isRTL ? 'أريد تجربة خدمة ' + ch.nameAr : 'I want to try ' + ch.name + ' service')}" target="_blank" class="btn-gradient px-10 py-5 rounded-2xl text-lg font-semibold inline-flex items-center justify-center gap-2">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              ${isRTL ? 'ابدأ الآن - مجاناً 14 يوم' : 'Start Now - Free 14 Days'}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem Section -->
    <section class="py-16 md:py-24 bg-gradient-to-b from-transparent to-[#0a0a1a]/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4">${isRTL ? 'هل تواجه هذه المشاكل؟' : 'Are You Facing These Problems?'}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${ch.problems.map(p => `
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
          <h2 class="text-3xl md:text-4xl font-black mb-4 gradient-text">${isRTL ? 'الحل موجود!' : 'The Solution is Here!'}</h2>
        </div>
        <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          ${ch.solution.map(item => `
          <div class="glass rounded-2xl p-6 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background: ${ch.color}20;">
              <svg class="w-6 h-6" style="color: ${ch.color};" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
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
          <h2 class="text-3xl md:text-4xl font-black mb-4">${isRTL ? 'مميزات تجعل حياتك أسهل' : 'Features That Make Your Life Easier'}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${ch.features.map(f => `
          <div class="card-tech rounded-2xl p-6">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background: ${ch.color}20;">
              <svg class="w-6 h-6" style="color: ${ch.color};" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h3 class="font-bold text-lg mb-2">${f.title}</h3>
            <p class="text-gray-400 text-sm">${f.desc}</p>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    ${ch.howItWorks ? `
    <section class="py-16 md:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4">${isRTL ? 'إزاي بيشتغل؟' : 'How It Works?'}</h2>
          <p class="text-gray-400 max-w-2xl mx-auto">${isRTL ? '3 خطوات بسيطة وكل حاجة تشتغل' : '3 simple steps and everything works'}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          ${ch.howItWorks.map((item, idx) => `
          <div class="relative">
            <div class="card-tech rounded-2xl p-6 text-center relative z-10">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black" style="background: ${ch.color}20; color: ${ch.color};">${item.step}</div>
              <h3 class="font-bold text-lg mb-2">${item.title}</h3>
              <p class="text-gray-400 text-sm">${item.desc}</p>
            </div>
            ${idx < 2 ? `<div class="hidden md:block absolute top-1/2 ${isRTL ? '-left-3 right-auto' : '-right-3 left-auto'} transform -translate-y-1/2 z-0"><svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}"/></svg></div>` : ''}
          </div>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- Use Cases Section -->
    <section class="py-16 md:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4">${isRTL ? 'بيشتغل مع أي نوع نشاط' : 'Works with Any Business Type'}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${ch.useCases.map(u => `
          <a href="/${u.link}/${lang}/" class="card-tech rounded-2xl p-6 text-center block hover:scale-105 transition-transform cursor-pointer group">
            <div class="text-4xl mb-4">${u.icon}</div>
            <h3 class="font-bold text-lg mb-1 group-hover:text-[${ch.color}] transition-colors">${u.title}</h3>
            <p class="text-gray-400 text-sm">${u.desc}</p>
            <div class="mt-3 text-xs" style="color: ${ch.color}; opacity: 0.7;">
              ${isRTL ? 'اضغط للتفاصيل ←' : '→ Click for details'}
            </div>
          </a>
          `).join('')}
        </div>
      </div>
    </section>

    ${generatePricingSection(lang, ch.color)}
    
    ${generateTestimonialsSection(lang)}
    
    ${generateFAQSection(lang)}
    
    ${generateCTASection(lang, isRTL ? 'جاهز تبدأ توفر وقتك وتزود مبيعاتك؟' : 'Ready to Save Time and Increase Sales?', isRTL ? 'ابدأ مجاناً لمدة 14 يوم - بدون أي التزام' : 'Start free for 14 days - no commitment', ch.color)}
    
    ${generateFooter(lang)}
    
    ${generateWhatsAppFloat(lang)}
  `;

  return generateHTMLWrapper(lang, title, bodyContent);
}

module.exports = { generateChannelServicePage };