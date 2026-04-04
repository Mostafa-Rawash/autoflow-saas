// Feature page generator using centralized components
const {
  generatePricingSection,
  generateFAQSection,
  generateCTASection,
  generateHeader,
  generateFooter,
  generateWhatsAppFloat,
  generateHTMLWrapper
} = require('./components/shared-components');

function generateFeaturePage(channel, featureIndex, lang) {
  const isRTL = lang === 'ar';
  
  const channels = {
    whatsapp: {
      name: 'WhatsApp',
      nameAr: 'واتس آب',
      color: '#25D366',
      icon: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>',
      features: [
        { name: 'Business API', nameAr: 'Business API', desc: 'WhatsApp Business API رسمي للشركات مع إمكانية إرسال رسائل جماعية وقوالب معتمدة', descEn: 'Official WhatsApp Business API for businesses with bulk messaging and approved templates', benefits: isRTL ? ['إرسال غير محدود', 'قوالب معتمدة', 'دعم 24/7', 'تكامل سهل', 'تقارير تفصيلية', 'أمان عالي'] : ['Unlimited sending', 'Approved templates', '24/7 support', 'Easy integration', 'Detailed reports', 'High security'] },
        { name: 'Auto-replies', nameAr: 'ردود تلقائية', desc: 'ردود ذكية تلقائية بالذكاء الاصطناعي على رسائل العملاء في أي وقت', descEn: 'Smart AI-powered automatic replies to customer messages anytime', benefits: isRTL ? ['ردود فورية', 'تخصيص كامل', 'دعم متعدد اللغات', 'كلمات مفتاحية', 'جدولة الردود', 'إحصائيات'] : ['Instant replies', 'Full customization', 'Multi-language', 'Keywords', 'Scheduling', 'Analytics'] },
        { name: 'Message Templates', nameAr: 'قوالب الرسائل', desc: 'قوالب رسائل جاهزة وموافق عليها من واتس آب للتواصل السريع', descEn: 'Pre-approved WhatsApp message templates for quick communication', benefits: isRTL ? ['قوالب جاهزة', 'موافقة سريعة', 'تخصيص', 'متغيرات ديناميكية', 'أزرار تفاعلية', 'وسائط متعددة'] : ['Ready templates', 'Quick approval', 'Customization', 'Dynamic variables', 'Interactive buttons', 'Multiple media'] },
        { name: 'Auto Labeling', nameAr: 'تسمية تلقائية', desc: 'تصنيف المحادثات تلقائياً حسب الموضوع أو الحالة أو العميل', descEn: 'Auto-categorize conversations by topic, status or customer', benefits: isRTL ? ['تصنيف ذكي', 'تسميات مخصصة', 'فلترة سريعة', 'تقارير', 'تكامل CRM', 'بحث متقدم'] : ['Smart categorization', 'Custom labels', 'Quick filtering', 'Reports', 'CRM integration', 'Advanced search'] },
        { name: 'Analytics', nameAr: 'تحليلات', desc: 'تقارير تفصيلية عن أداء الرسائل ومعدل القراءة والردود', descEn: 'Detailed reports on message performance, read rates and responses', benefits: isRTL ? ['إحصائيات لحظية', 'رسوم بيانية', 'تصدير تقارير', 'مقارنة الفترات', 'KPIs', 'تنبيهات'] : ['Real-time stats', 'Charts', 'Export reports', 'Period comparison', 'KPIs', 'Alerts'] },
        { name: 'CRM Integration', nameAr: 'تكامل CRM', desc: 'ربط واتس آب مع أنظمة إدارة العملاء المختلفة', descEn: 'Connect WhatsApp with various CRM systems', benefits: isRTL ? ['مزامنة تلقائية', 'توثيق المحادثات', 'تاريخ العميل', 'تخصيص الحقول', 'API متكامل', 'دعم Zapier'] : ['Auto sync', 'Conversation logging', 'Customer history', 'Custom fields', 'Full API', 'Zapier support'] }
      ]
    },
    messenger: {
      name: 'Messenger', nameAr: 'ماسنجر', color: '#0084FF',
      icon: '<path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 22l4.832-1.091A9.945 9.945 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.845 0-3.596-.508-5.083-1.387l-.363-.217-3.76.853.853-3.76-.217-.363A8.013 8.013 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>',
      features: [
        { name: 'Messenger API', nameAr: 'Messenger API', desc: 'واجهة برمجة Facebook Messenger الرسمية للتواصل مع العملاء', descEn: 'Official Facebook Messenger programming interface', benefits: isRTL ? ['تكامل رسمي', 'سرعة عالية', 'أمان متقدم', 'تحديثات مستمرة', 'دعم فني', 'توثيق شامل'] : ['Official integration', 'High speed', 'Advanced security', 'Continuous updates', 'Technical support', 'Full documentation'] },
        { name: 'Instant Replies', nameAr: 'ردود فورية', desc: 'ردود تلقائية فورية على رسائل ماسنجر على مدار الساعة', descEn: '24/7 instant automatic replies to Messenger messages', benefits: isRTL ? ['ردود 24/7', 'سرعة فائقة', 'تخصيص', 'ذكاء اصطناعي', 'كلمات مفتاحية', 'إحصائيات'] : ['24/7 replies', 'Ultra fast', 'Customization', 'AI powered', 'Keywords', 'Analytics'] },
        { name: 'Rich Messages', nameAr: 'رسائل غنية', desc: 'رسائل مع صور وأزرار وقوائم تفاعلية لتحسين تجربة العميل', descEn: 'Messages with images, buttons and interactive lists', benefits: isRTL ? ['صور وفيديو', 'أزرار تفاعلية', 'قوائم', 'بطاقات', 'معاينات روابط', 'ملفات'] : ['Images & video', 'Interactive buttons', 'Lists', 'Cards', 'Link previews', 'Files'] },
        { name: 'Facebook Ads', nameAr: 'تكامل الإعلانات', desc: 'ربط الرسائل مع إعلانات فيسبوك لتحويل الزوار لعملاء', descEn: 'Connect messages with Facebook ads to convert visitors', benefits: isRTL ? ['تتبع التحويلات', 'استهداف ذكي', 'إعلانات تفاعلية', 'تقارير ROI', 'إعادة التسويق', 'Click-to-Message'] : ['Conversion tracking', 'Smart targeting', 'Interactive ads', 'ROI reports', 'Retargeting', 'Click-to-Message'] },
        { name: 'Facebook Shop', nameAr: 'متجر فيسبوك', desc: 'دعم التسوق من خلال ماسنجر مع كتالوج المنتجات', descEn: 'Shopping support through Messenger with product catalog', benefits: isRTL ? ['كتالوج منتجات', 'شراء مباشر', 'دفع آمن', 'تتبع الطلبات', 'عروض خاصة', 'توصيات ذكية'] : ['Product catalog', 'Direct purchase', 'Secure payment', 'Order tracking', 'Special offers', 'Smart recommendations'] },
        { name: 'Customer Support', nameAr: 'دعم العملاء', desc: 'نظام دعم عملاء متكامل من خلال ماسنجر', descEn: 'Integrated customer support system through Messenger', benefits: isRTL ? ['تذاكر تلقائية', 'تحويل لموظف', 'تقييم الخدمة', 'SLA', 'قاعدة معرفة', 'تقارير الأداء'] : ['Auto tickets', 'Agent transfer', 'Service rating', 'SLA', 'Knowledge base', 'Performance reports'] }
      ]
    },
    instagram: { name: 'Instagram', nameAr: 'إنستجرام', color: '#E4405F', icon: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>', features: [
        { name: 'DM API', nameAr: 'DM API', desc: 'واجهة برمجة رسائل إنستجرام المباشرة', descEn: 'Instagram Direct Messages API', benefits: isRTL ? ['رسائل مباشرة', 'ردود تلقائية', 'وسائط متعددة', 'تكامل رسمي', 'سرعة عالية', 'أمان'] : ['Direct messages', 'Auto replies', 'Multiple media', 'Official integration', 'High speed', 'Security'] },
        { name: 'Comment Reply', nameAr: 'رد على التعليقات', desc: 'ردود تلقائية ذكية على تعليقات المنشورات', descEn: 'Smart automatic replies to post comments', benefits: isRTL ? ['ردود فورية', 'كلمات مفتاحية', 'رسائل خاصة', 'تصفية تعليقات', 'تحليل المشاعر', 'إحصائيات'] : ['Instant replies', 'Keywords', 'Private messages', 'Comment filtering', 'Sentiment analysis', 'Analytics'] },
        { name: 'DM Automation', nameAr: 'أتمتة الرسائل', desc: 'أتمتة كاملة للرسائل الخاصة مع ردود ذكية', descEn: 'Full automation of private messages', benefits: isRTL ? ['قوالب رسائل', 'جدولة', 'تخصيص', 'ذكاء اصطناعي', 'تسميات', 'بحث'] : ['Message templates', 'Scheduling', 'Customization', 'AI powered', 'Labels', 'Search'] },
        { name: 'Shopping', nameAr: 'تكامل التسوق', desc: 'ربط الرسائل مع متجر إنستجرام للبيع المباشر', descEn: 'Connect with Instagram shop', benefits: isRTL ? ['كتالوج', 'شراء مباشر', 'دفع', 'تتبع طلبات', 'عروض', 'توصيات'] : ['Catalog', 'Direct purchase', 'Payment', 'Order tracking', 'Offers', 'Recommendations'] },
        { name: 'Analytics', nameAr: 'تحليلات المتابعين', desc: 'تحليلات متقدمة للمتابعين والتفاعل', descEn: 'Advanced follower analytics', benefits: isRTL ? ['إحصائيات لحظية', 'رسوم بيانية', 'مقارنات', 'نمو المتابعين', 'أفضل أوقات', 'تقارير'] : ['Real-time stats', 'Charts', 'Comparisons', 'Follower growth', 'Best times', 'Reports'] },
        { name: 'Scheduling', nameAr: 'جدولة المحتوى', desc: 'جدولة المنشورات والقصص مسبقاً', descEn: 'Schedule posts and stories', benefits: isRTL ? ['جدولة سهلة', 'معاينة', 'تقويم', 'تكرار', 'قوالب', 'تنبيهات'] : ['Easy scheduling', 'Preview', 'Calendar', 'Repetition', 'Templates', 'Alerts'] }
      ] },
    telegram: { name: 'Telegram', nameAr: 'تيليجرام', color: '#0088cc', icon: '<path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 6.823c.14-.005.26.026.37.081.14.068.25.173.31.293.06.12.09.258.09.408v.02l-.01.05-.01.07-1.1 4.8-.17.73-.18.8c-.05.22-.1.43-.15.6-.05.17-.09.3-.13.38-.05.1-.11.14-.18.14-.07 0-.17-.04-.29-.12a1.3 1.3 0 00-.47-.22.87.87 0 00-.49.01c-.17.05-.33.13-.49.24-.16.11-.32.24-.47.38-.15.14-.3.29-.43.44l-.2.22-.1.11-.03.03h-.01l-.01.01-.02.01c-.05.04-.11.05-.18.05a.5.5 0 01-.22-.06.7.7 0 01-.2-.16l-.02-.02-.04-.04-.04-.04c-.1-.12-.22-.26-.34-.42-.12-.16-.24-.34-.35-.53-.11-.19-.21-.39-.3-.6-.09-.21-.16-.43-.21-.66-.05-.23-.08-.47-.08-.71 0-.32.05-.62.16-.9.11-.28.25-.53.44-.74.19-.21.4-.38.66-.51.26-.13.53-.19.83-.19.19 0 .38.03.55.09.17.06.33.14.47.24l.11.07.07.04c.07.04.13.06.2.06.08 0 .14-.04.18-.12l.18-.47.19-.47.17-.42.15-.37.12-.3.08-.19.04-.09.02-.04.01-.02c.06-.13.14-.22.24-.28.1-.06.21-.09.33-.09l-.09.0-.09.0z"/>', features: [
        { name: 'Bot API', nameAr: 'Bot API', desc: 'واجهة برمجة بوتات تيليجرام الرسمية', descEn: 'Official Telegram Bot API', benefits: isRTL ? ['مجاني بالكامل', 'لا محدود', 'سهل الاستخدام', 'توثيق شامل', 'تحديثات مستمرة', 'دعم فني'] : ['Completely free', 'Unlimited', 'Easy to use', 'Full documentation', 'Continuous updates', 'Technical support'] },
        { name: 'Smart Bots', nameAr: 'بوتات ذكية', desc: 'بوتات ذكية بالذكاء الاصطناعي', descEn: 'AI-powered smart bots', benefits: isRTL ? ['ذكاء اصطناعي', 'تعلم مستمر', 'تخصيص', 'محادثات متعددة', 'تحليل', 'تقارير'] : ['AI powered', 'Continuous learning', 'Customization', 'Multi-conversation', 'Analysis', 'Reports'] },
        { name: 'Channels & Groups', nameAr: 'قنوات ومجموعات', desc: 'إدارة قنوات ومجموعات لا محدودة الأعضاء', descEn: 'Manage unlimited member channels', benefits: isRTL ? ['أعضاء لا محدود', 'إدارة سهلة', 'مشرفين متعددين', 'إحصائيات', 'جدولة', 'تحليلات'] : ['Unlimited members', 'Easy management', 'Multiple admins', 'Statistics', 'Scheduling', 'Analytics'] },
        { name: 'Rich Media', nameAr: 'وسائط غنية', desc: 'إرسال رسائل غنية بالوسائط', descEn: 'Send rich media messages', benefits: isRTL ? ['صور', 'فيديو', 'ملفات', 'صوت', 'موقع', 'جهة اتصال'] : ['Images', 'Video', 'Files', 'Audio', 'Location', 'Contact'] },
        { name: 'Custom Commands', nameAr: 'أوامر مخصصة', desc: 'إنشاء أوامر مخصصة للبوت', descEn: 'Create custom commands', benefits: isRTL ? ['أوامر سهلة', 'تخصيص كامل', 'قوائم', 'أزرار', 'ردود سريعة', 'اختصارات'] : ['Easy commands', 'Full customization', 'Menus', 'Buttons', 'Quick replies', 'Shortcuts'] },
        { name: 'Web Integration', nameAr: 'تكامل الويب', desc: 'ربط البوت مع مواقع الويب', descEn: 'Connect with websites', benefits: isRTL ? ['Webhook', 'API', 'تكامل سهل', 'تعديل HTML', 'تسجيل دخول', 'إشعارات'] : ['Webhook', 'API', 'Easy integration', 'HTML modification', 'Login', 'Notifications'] }
      ] },
    livechat: { name: 'Live Chat', nameAr: 'محادثة مباشرة', color: '#00D4AA', icon: '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>', features: [
        { name: 'Widget', nameAr: 'Widget للموقع', desc: 'ودجت سهل التركيب لأي موقع', descEn: 'Easy-to-install website widget', benefits: isRTL ? ['تركيب سهل', 'متوافق', 'خفيف', 'تخصيص', 'تجاوب', 'سريع'] : ['Easy install', 'Compatible', 'Lightweight', 'Customization', 'Responsive', 'Fast'] },
        { name: 'Instant Chat', nameAr: 'دردشة فورية', desc: 'دردشة مباشرة فورية مع الزوار', descEn: 'Instant live chat with visitors', benefits: isRTL ? ['وقت حقيقي', 'رسائل فورية', 'إشعارات', 'صوت', 'حالة الكتابة', 'تأكيد قراءة'] : ['Real-time', 'Instant messages', 'Notifications', 'Sound', 'Typing status', 'Read confirmation'] },
        { name: 'Custom Styling', nameAr: 'تخصيص الشكل', desc: 'تخصيص شكل وألوان الودجت', descEn: 'Fully customize widget look', benefits: isRTL ? ['ألوان مخصصة', 'شعار', 'موقع', 'حجم', 'أشكال', 'تأثيرات'] : ['Custom colors', 'Logo', 'Position', 'Size', 'Shapes', 'Effects'] },
        { name: 'Pre-defined Replies', nameAr: 'ردود مسبقة', desc: 'ردود جاهزة مسبقة للرد السريع', descEn: 'Pre-defined ready replies', benefits: isRTL ? ['قوالب', 'اختصارات', 'بحث', 'تصنيفات', 'تخصيص', 'مشاركة'] : ['Templates', 'Shortcuts', 'Search', 'Categories', 'Customization', 'Sharing'] },
        { name: 'Visitor Analytics', nameAr: 'تحليلات الزوار', desc: 'تحليلات متقدمة لزوار الموقع', descEn: 'Advanced visitor analytics', benefits: isRTL ? ['عدد الزوار', 'صفحات', 'مصدر', 'جهاز', 'موقع', 'وقت'] : ['Visitor count', 'Pages', 'Source', 'Device', 'Location', 'Time'] },
        { name: 'CRM Integration', nameAr: 'تكامل CRM', desc: 'ربط المحادثات مع أنظمة CRM', descEn: 'Connect with CRM systems', benefits: isRTL ? ['مزامنة', 'توثيق', 'تاريخ', 'حقول مخصصة', 'API', 'Zapier'] : ['Sync', 'Logging', 'History', 'Custom fields', 'API', 'Zapier'] }
      ] },
    email: { name: 'Email', nameAr: 'إيميل', color: '#EA4335', icon: '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>', features: [
        { name: 'SMTP/IMAP', nameAr: 'SMTP/IMAP', desc: 'تكامل كامل مع بروتوكولات SMTP و IMAP', descEn: 'Full SMTP/IMAP integration', benefits: isRTL ? ['إرسال', 'استقبال', 'تكامل', 'أمان', 'مصداقية', 'تتبع'] : ['Sending', 'Receiving', 'Integration', 'Security', 'Reliability', 'Tracking'] },
        { name: 'Auto Filtering', nameAr: 'تصفية تلقائية', desc: 'تصفية الإيميلات تلقائياً حسب القواعد', descEn: 'Auto-filter emails by rules', benefits: isRTL ? ['قواعد ذكية', 'مجلدات', 'تسميات', 'أولويات', 'سلة مهملات', 'أرشفة'] : ['Smart rules', 'Folders', 'Labels', 'Priorities', 'Spam', 'Archiving'] },
        { name: 'Smart Replies', nameAr: 'ردود ذكية', desc: 'ردود ذكية بالذكاء الاصطناعي', descEn: 'AI-powered smart replies', benefits: isRTL ? ['ذكاء اصطناعي', 'قوالب', 'تخصيص', 'سرعة', 'دقة', 'تعلم'] : ['AI powered', 'Templates', 'Customization', 'Speed', 'Accuracy', 'Learning'] },
        { name: 'Auto Categorization', nameAr: 'تصنيف تلقائي', desc: 'تصنيف الإيميلات تلقائياً', descEn: 'Auto-categorize emails', benefits: isRTL ? ['فئات مخصصة', 'تحليل محتوى', 'تأشير', 'بحث', 'تقارير', 'فلترة'] : ['Custom categories', 'Content analysis', 'Tagging', 'Search', 'Reports', 'Filtering'] },
        { name: 'Reports', nameAr: 'تقارير مفصلة', desc: 'تقارير مفصلة عن أداء الإيميلات', descEn: 'Detailed email reports', benefits: isRTL ? ['إحصائيات', 'معدل فتح', 'معدل رد', 'رسوم بيانية', 'تصدير', 'مقارنات'] : ['Statistics', 'Open rate', 'Reply rate', 'Charts', 'Export', 'Comparisons'] },
        { name: 'Outlook/Gmail', nameAr: 'تكامل Outlook/Gmail', desc: 'تكامل مع Outlook و Gmail', descEn: 'Outlook/Gmail integration', benefits: isRTL ? ['تكامل سهل', 'مزامنة', 'جهات اتصال', 'تقويم', 'ملفات', 'بحث'] : ['Easy integration', 'Sync', 'Contacts', 'Calendar', 'Files', 'Search'] }
      ] },
    sms: { name: 'SMS', nameAr: 'رسائل نصية', color: '#7C3AED', icon: '<path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-4.2-5.78v1.75l3.2-2.99L12.8 9v1.7c-3.11.43-4.35 2.56-4.8 4.7 1.11-1.5 2.58-2.18 4.8-2.18z"/>', features: [
        { name: 'SMS Gateway', nameAr: 'SMS Gateway', desc: 'بوابة SMS متكاملة لإرسال الرسائل النصية', descEn: 'Integrated SMS gateway', benefits: isRTL ? ['إرسال سريع', 'تغطية واسعة', 'أمان', 'API', 'تتبع', 'تقارير'] : ['Fast sending', 'Wide coverage', 'Security', 'API', 'Tracking', 'Reports'] },
        { name: 'Bulk SMS', nameAr: 'إرسال جماعي', desc: 'إرسال رسائل نصية جماعية لآلاف الأرقام', descEn: 'Bulk SMS sending', benefits: isRTL ? ['آلاف الرسائل', 'قوائم', 'استيراد', 'جدولة', 'قوالب', 'تقارير'] : ['Thousands of messages', 'Lists', 'Import', 'Scheduling', 'Templates', 'Reports'] },
        { name: 'Country Codes', nameAr: 'رموز الدول', desc: 'رموز مخصصة للدول المختلفة', descEn: 'Custom country codes', benefits: isRTL ? ['200+ دولة', 'تحويل تلقائي', 'تحقق', 'أسعار منافسة', 'جودة', 'سرعة'] : ['200+ countries', 'Auto conversion', 'Validation', 'Competitive prices', 'Quality', 'Speed'] },
        { name: 'Scheduling', nameAr: 'جدولة الرسائل', desc: 'جدولة الرسائل النصية مسبقاً', descEn: 'Schedule SMS messages', benefits: isRTL ? ['جدولة سهلة', 'تقويم', 'تكرار', 'مناطق زمنية', 'تعديل', 'إلغاء'] : ['Easy scheduling', 'Calendar', 'Repetition', 'Time zones', 'Edit', 'Cancel'] },
        { name: 'Delivery Reports', nameAr: 'تقارير التسليم', desc: 'تقارير تفصيلية عن تسليم الرسائل', descEn: 'Detailed delivery reports', benefits: isRTL ? ['حالة لحظية', 'نسبة التسليم', 'فشل', 'إعادة', 'تصدير', 'إشعارات'] : ['Real-time status', 'Delivery rate', 'Failures', 'Retry', 'Export', 'Notifications'] },
        { name: 'Twilio/Vonage', nameAr: 'تكامل Twilio/Vonage', desc: 'تكامل مع Twilio و Vonage', descEn: 'Twilio/Vonage integration', benefits: isRTL ? ['تكامل سهل', 'مصداقية', 'أسعار', 'دعم فني', 'API', 'توثيق'] : ['Easy integration', 'Reliability', 'Prices', 'Technical support', 'API', 'Documentation'] }
      ] },
    api: { name: 'Custom API', nameAr: 'API مخصص', color: '#F59E0B', icon: '<path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>', features: [
        { name: 'RESTful API', nameAr: 'RESTful API', desc: 'واجهة برمجة RESTful متكاملة', descEn: 'Full RESTful API', benefits: isRTL ? ['سهل الاستخدام', 'توثيق شامل', 'أمان', 'سرعة', 'مرونة', 'تحديثات'] : ['Easy to use', 'Full documentation', 'Security', 'Speed', 'Flexibility', 'Updates'] },
        { name: 'Webhooks', nameAr: 'Webhooks لحظية', desc: 'إشعارات لحظية عبر Webhooks', descEn: 'Real-time webhooks', benefits: isRTL ? ['إشعارات فورية', 'موثوقية', 'سهل الإعداد', 'تخصيص', 'أمان', 'سجلات'] : ['Instant notifications', 'Reliability', 'Easy setup', 'Customization', 'Security', 'Logs'] },
        { name: 'Documentation', nameAr: 'توثيق شامل', desc: 'توثيق شامل ومفصل للـ API', descEn: 'Complete API documentation', benefits: isRTL ? ['أمثلة', 'مراجع', 'دليل', 'فيديوهات', 'تحديثات', 'دعم'] : ['Examples', 'References', 'Guide', 'Videos', 'Updates', 'Support'] },
        { name: 'SDKs', nameAr: 'SDK متعدد اللغات', desc: 'حزم تطوير لغات برمجة متعددة', descEn: 'Multi-language SDKs', benefits: isRTL ? ['JavaScript', 'Python', 'PHP', 'Ruby', 'Java', 'Go'] : ['JavaScript', 'Python', 'PHP', 'Ruby', 'Java', 'Go'] },
        { name: 'GraphQL', nameAr: 'دعم GraphQL', desc: 'دعم كامل لـ GraphQL', descEn: 'Full GraphQL support', benefits: isRTL ? ['استعلامات مرنة', 'سرعة', 'تحكم', 'تخصيص', 'تحديث لحظي', 'أمان'] : ['Flexible queries', 'Speed', 'Control', 'Customization', 'Real-time updates', 'Security'] },
        { name: 'OAuth 2.0', nameAr: 'أمان OAuth 2.0', desc: 'أمان متقدم ببروتوكول OAuth 2.0', descEn: 'OAuth 2.0 security', benefits: isRTL ? ['أمان عالي', 'توثيق', 'صلاحيات', 'تجديد تلقائي', 'سجلات', 'تشفير'] : ['High security', 'Authentication', 'Permissions', 'Auto refresh', 'Logs', 'Encryption'] }
      ] }
  };
  
  const ch = channels[channel];
  if (!ch || !ch.features[featureIndex]) return '';
  
  const feature = ch.features[featureIndex];
  const title = isRTL ? `${feature.nameAr} | ${ch.nameAr} | AutoFlow` : `${feature.name} | ${ch.name} | AutoFlow`;

  const bodyContent = `
    ${generateHeader(lang)}
    
    <!-- Hero -->
    <section class="pt-28 md:pt-40 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="${isRTL ? 'text-right' : 'text-left'}">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6">
              <a href="/channel/${channel}/ar/" class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: ${ch.color}20;">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style="color: ${ch.color};">${ch.icon}</svg>
                </div>
                <span class="text-sm font-medium" style="color: ${ch.color};">${ch.name}</span>
              </a>
              <span class="text-gray-400">→</span>
              <span class="text-sm text-white">${isRTL ? feature.nameAr : feature.name}</span>
            </div>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              <span class="gradient-text">${isRTL ? feature.nameAr : feature.name}</span>
            </h1>
            <p class="text-xl text-gray-400 mb-8">${isRTL ? feature.desc : feature.descEn}</p>
            <div class="flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}">
              <a href="/pricing/ar/" class="btn-gradient px-8 py-4 rounded-xl text-lg font-semibold text-center">${isRTL ? 'ابدأ الآن' : 'Get Started'}</a>
              <a href="https://wa.me/201099129550" target="_blank" class="border-2 px-8 py-4 rounded-xl text-lg font-semibold text-center text-gray-300 hover:bg-white/5" style="border-color: ${ch.color}40;">💬 WhatsApp</a>
            </div>
          </div>
          <div class="relative">
            <div class="glass rounded-2xl p-8 border" style="border-color: ${ch.color}20;">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 rounded-xl flex items-center justify-center" style="background: ${ch.color}20;">
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${ch.color};">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-2xl font-bold">${isRTL ? feature.nameAr : feature.name}</h3>
                  <p class="text-gray-400">${ch.name}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                ${feature.benefits.map((b, i) => `
                <div class="bg-[#0a0a1a] rounded-xl p-4 flex items-center gap-3">
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${ch.color};">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-sm">${b}</span>
                </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4">${isRTL ? 'لماذا تستخدم ' + feature.nameAr + '؟' : 'Why Use ' + feature.name + '?'}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${feature.benefits.map((b, i) => `
          <div class="card-tech rounded-2xl p-6 flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background: ${ch.color}20;">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${ch.color};">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg">${b}</h3>
              <p class="text-gray-400 text-sm mt-1">${isRTL ? 'ميزة فريدة لتحسين تجربتك' : 'Unique feature to improve your experience'}</p>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Other Features -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black mb-4">${isRTL ? 'مميزات أخرى من ' + ch.nameAr : 'Other ' + ch.name + ' Features'}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${ch.features.map((f, i) => i !== featureIndex ? `
          <a href="/channel/${channel}/feature/${i}/ar/" class="card-tech rounded-2xl p-6 block">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: ${ch.color}20;">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${ch.color};">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>
              <h3 class="font-bold">${isRTL ? f.nameAr : f.name}</h3>
            </div>
            <p class="text-gray-400 text-sm">${isRTL ? f.desc.substring(0, 60) + '...' : f.descEn.substring(0, 60) + '...'}</p>
          </a>
          ` : '').join('')}
        </div>
      </div>
    </section>

    ${generatePricingSection(lang, ch.color)}
    
    ${generateCTASection(lang, isRTL ? 'جاهز تبدأ مع ' + feature.nameAr + '؟' : 'Ready to Start with ' + feature.name + '?', isRTL ? 'تواصل معنا النهاردة وخود استشارة مجانية' : 'Contact us today for a free consultation', ch.color)}
    
    ${generateFooter(lang)}
    
    ${generateWhatsAppFloat(lang)}
  `;

  return generateHTMLWrapper(lang, title, bodyContent);
}

module.exports = { generateFeaturePage };