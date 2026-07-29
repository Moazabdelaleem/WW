/**
 * i18n.js — Arabic / English translation module
 *
 * Usage:
 *   import { initI18n, t, getCurrentLang } from './i18n.js';
 *   initI18n();   // call once per page, after DOM ready
 *
 * Any element with a  data-i18n="key"  attribute gets its
 * textContent replaced automatically.  Placeholders and
 * input "placeholder" attributes use  data-i18n-placeholder="key".
 */

const STORAGE_KEY = 'LANG_V1';

// ─────────────────────────────────────────────
//  Translation dictionary
// ─────────────────────────────────────────────
const translations = {
  en: {
    // ── Nav / Header
    'nav.catalog': 'Catalog',
    'nav.designYourOwn': 'Design Your Own',
    'nav.adminPortal': 'Admin Portal',
    'nav.localBadge': 'Local Demo Mode',
    'nav.langToggle': 'عربي',

    // ── Index hero
    'hero.tag': '[Workshop & Catalog Name]',
    'hero.title': 'Custom Furniture & Carpentry Catalog',
    'hero.subtitle': 'Browse products, pick custom dimensions & options, or upload a reference photo for a quick price estimate.',
    'hero.ctaBrowse': 'Browse Catalog ↓',
    'hero.ctaUpload': 'Upload Photo for Quote →',

    // ── Filters sidebar
    'filter.search': 'Search',
    'filter.searchPlaceholder': 'Search tables, chairs...',
    'filter.categories': 'Categories',
    'filter.allFurniture': 'All Furniture',
    'filter.deptLabel': 'Main Category:',
    'filter.deptAll': 'All Categories',
    'filter.deptHome': 'Home Furniture & Living',
    'filter.deptCarpentry': 'Bespoke Carpentry & Doors',
    'filter.deptOffice': 'Executive Office',
    'filter.priceType': 'Price Type',
    'filter.anyPrice': 'Any Price Structure',
    'filter.fixed': 'Fixed Price',
    'filter.range': 'Price Range',
    'filter.onRequest': 'Price on Request',
    'filter.availableOnly': 'Available Only',

    // ── Products area
    'products.allFurniture': 'All Furniture',
    'products.showingCount': 'Showing {n} products',
    'products.loading': 'Loading...',

    // ── Product detail modal
    'detail.close': 'Close',
    'detail.description': 'Description',
    'detail.quantity': 'Quantity',
    'detail.yourName': 'Your name *',
    'detail.phone': 'Phone number *',
    'detail.phonePlaceholder': '01xxxxxxxxx',
    'detail.notes': 'Notes (optional)',
    'detail.notesPlaceholder': 'Delivery address, timing, anything else...',
    'detail.disclaimer': "Order directly via WhatsApp or send a web request.",
    'detail.requestBtn': 'Request this order',
    'detail.whatsappBtn': 'Order via WhatsApp',
    'detail.successMsg': "Request received — we'll call you shortly to confirm.",

    // ── Proposal Pitch Banner
    'proposal.badge': '✨ Live Pitch Demo',
    'proposal.text': 'Interactive Client Showcase · Built for Workshop Growth',
    'proposal.nicheLabel': 'Switch Catalog Niche:',
    'proposal.nicheLiving': '🛋️ Luxury Living Room',
    'proposal.nicheCarpentry': '🚪 Bespoke Carpentry & Doors',
    'proposal.nicheOffice': '🪑 Executive Office',

    // ── Custom request page
    'custom.heroTag': '[Custom Carpentry & Furniture Quote]',
    'custom.heroTitle': 'Upload Design & Get Price Quote',
    'custom.heroSubtitle': 'Describe what you are picturing or upload a photo from Pinterest or Instagram. We will send you a price estimate.',
    'custom.startingPoint': 'Starting point (optional)',
    'custom.noCategory': 'No particular category',
    'custom.descLabel': "Tell us what you're picturing *",
    'custom.descPlaceholder': 'e.g. A corner sofa or custom wooden table with steel legs...',
    'custom.sizeLabel': 'Rough size / dimensions (optional)',
    'custom.sizePlaceholder': 'e.g. 250cm wide x 90cm deep',
    'custom.materialsLabel': 'Materials you like (optional, pick any)',
    'custom.refLabel': 'Upload a reference photo (optional)',
    'custom.refUploadText': 'Drag and drop an image here or click to browse',
    'custom.refUploadHint': 'Upload any image file (Pinterest, Instagram, or photo).',
    'custom.nameLabel': 'Your Name *',
    'custom.namePlaceholder': 'Full Name',
    'custom.phoneLabel': 'Phone *',
    'custom.phonePlaceholder': '01xxxxxxxxx',
    'custom.submitBtn': 'Submit Web Request',
    'custom.whatsappBtn': 'Send Idea via WhatsApp',
    'custom.successTitle': 'Request Sent Successfully',
    'custom.successMsg': 'We will review your uploaded design and get back to you with a price quote.',
    'custom.backToCatalog': 'Back to Catalog',

    // ── Admin login
    'login.subtitle': 'Workshop Admin CMS Portal',
    'login.localHint': 'Local demo mode — no database connected yet. Sign in with',
    'login.emailLabel': 'Email Address',
    'login.passLabel': 'Password',
    'login.signInBtn': 'Sign In',
    'login.configureDB': 'Configure Database Connection',

    // ── Admin dashboard
    'admin.totalProducts': 'Total Products',
    'admin.outOfStock': 'Out of Stock',
    'admin.categories': 'Categories',
    'admin.manageProducts': 'Manage Products',
    'admin.manageCategories': 'Manage Categories',
    'admin.orderRequests': 'Order Requests',
    'admin.customRequests': 'Custom Requests',
    'admin.addProduct': '+ Add Product',
    'admin.searchCatalog': 'Search catalog...',
    'admin.createCategory': 'Create Category',
    'admin.allCategories': 'All Categories',
    'admin.categoryName': 'Category Name',
    'admin.categoryPlaceholder': 'e.g. Dining Tables',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    'admin.allStatuses': 'All statuses',
    'admin.pending': 'Pending',
    'admin.confirmed': 'Confirmed',
    'admin.rejected': 'Rejected',
    'admin.new': 'New',
    'admin.inReview': 'In Review',
    'admin.quoted': 'Quoted',
    'admin.closed': 'Closed',
    'admin.disconnectDB': 'Disconnect DB',
    'admin.signOut': 'Sign Out',

    // ── DB config modal
    'db.title': 'Database Connection',
    'db.desc': 'To browse the catalog and access the Admin panel, please hook up your Supabase project. Enter your credentials below. They are saved securely in your local browser storage.',
    'db.urlLabel': 'Supabase Project URL',
    'db.keyLabel': 'Supabase Anon Key',
    'db.connectBtn': 'Connect Database',
    'db.title': 'Database Connection',
    'db.desc': 'To browse the catalog and access the Admin panel, please hook up your Supabase project. Enter your credentials below. They are saved securely in your local browser storage.',
    'db.urlLabel': 'Supabase Project URL',
    'db.keyLabel': 'Supabase Anon Key',

    // ── Runtime/JS strings
    'common.uncategorized': 'Uncategorized',
    'common.noDescription': 'No description provided.',
    'common.available': 'Available',
    'common.unavailable': 'Out of Stock',
    'common.sending': 'Sending...',
    'common.onRequest': 'On Request',
    'common.fromPrice': 'From {p}',
    'common.pickAny': '(pick any)',
    'common.noCategoryPicked': 'No category picked',
    'common.confirmDisconnect': 'Disconnect database? This will clear your locally configured Supabase credentials.',

    // ── Footer
    'footer.trustDeliveryTitle': 'Direct Workshop Delivery',
    'footer.trustDeliverySub': 'Inspection on delivery before payment',
    'footer.trustWoodTitle': 'Natural Solid Woods',
    'footer.trustWoodSub': '100% Seasoned Beech & Oak timber',
    'footer.trustCustomTitle': 'Custom Dimensions',
    'footer.trustCustomSub': 'Tailored to your exact home space',
    'footer.trustSupportTitle': 'WhatsApp Direct Support',
    'footer.trustSupportSub': 'Fast quotes & photo inquiries',
    'footer.brandDesc': 'Direct workshop furniture & custom carpentry. Built to order with premium hardwoods and delivered straight to your home.',
    'footer.hoursLabel': 'Working Hours:',
    'footer.hoursVal': 'Sat – Thu: 10:00 AM – 10:00 PM',
    'footer.quickLinksTitle': 'Quick Links',
    'footer.linkWhatsApp': 'Direct WhatsApp Order',
    'footer.contactTitle': 'Contact Us',
    'footer.addressVal': 'Main Workshop & Showroom, Industrial Area, Egypt',
    'footer.whatsappChat': 'Chat on WhatsApp (Instant Quote)',
    'footer.copyright': '© 2026 [Workshop Catalog]. All rights reserved.',
    'footer.taglineSub': 'Quality Carpentry & Custom Furniture',
  },

  ar: {
    // ── Nav / Header
    'nav.catalog': 'الكتالوج والمعرض',
    'nav.designYourOwn': 'طلب شغل عمولة / ارفع صورة',
    'nav.adminPortal': 'لوحة الإدارة',
    'nav.localBadge': 'وضع العرض التجريبي',
    'nav.langToggle': 'English',

    // ── Index hero
    'hero.tag': '[معرض وورشة الموبيليا والنجارة]',
    'hero.title': 'كتالوج الموبيليا والنجارة العمولة',
    'hero.subtitle': 'شوف شغل الورشة، حدد مقاسك وخامتك، أو ابعتلنا أي صورة من النت وتاخد سعر العمولة فوراً.',
    'hero.ctaBrowse': 'تصفح الشغل ↓',
    'hero.ctaUpload': 'ابعت صورة وخد السعر ←',

    // ── Filters sidebar
    'filter.search': 'بحث',
    'filter.searchPlaceholder': 'دور ع الأنتريهات، الترابيزات، الدواليب...',
    'filter.categories': 'أقسام الشغل',
    'filter.allFurniture': 'كل الشغل والموبيليا',
    'filter.deptLabel': 'القسم الرئيسي:',
    'filter.deptAll': 'كل الأقسام والمنتجات',
    'filter.deptHome': 'أثاث وموبيليا منزلية',
    'filter.deptCarpentry': 'أبواب ونجارة عمولة',
    'filter.deptOffice': 'مكاتب وأثاث شركات',
    'filter.priceType': 'طريقة التسعير',
    'filter.anyPrice': 'كل الأسعار',
    'filter.fixed': 'سعر نهائي',
    'filter.range': 'يبدأ من',
    'filter.onRequest': 'حسب المقاس والعمولة',
    'filter.availableOnly': 'الجاهز ع التحميل فقط',

    // ── Products area
    'products.allFurniture': 'كل الشغل والموبيليا',
    'products.showingCount': 'معروض {n} موديل',
    'products.loading': 'جارٍ التحميل...',

    // ── Product detail modal
    'detail.close': 'إغلاق',
    'detail.description': 'تفاصيل الموديل',
    'detail.quantity': 'العدد المطلوب',
    'detail.yourName': 'الاسم الكريم *',
    'detail.phone': 'رقم الموبايل *',
    'detail.phonePlaceholder': '01xxxxxxxxx',
    'detail.notes': 'ملاحظات وتفاصيل إضافية (اختياري)',
    'detail.notesPlaceholder': 'العنوان أو المحافظة، وأي مواصفات خاصة تحب نراعيها...',
    'detail.disclaimer': 'اطلب مباشرة ع الواتساب أو ابعت طلبك من الموقع.',
    'detail.requestBtn': 'احجز الموديل ده',
    'detail.whatsappBtn': 'اطلب ع الواتساب على طول',
    'detail.successMsg': 'تم استلام طلبك — وهنتصل بك فوراً للتأكيد والميعاد.',

    // ── Proposal Pitch Banner
    'proposal.badge': '✨ عرض تقديمي مباشر',
    'proposal.text': 'معرض تفاعلي للعملاء • مصمم لزيادة مبيعات الورشة',
    'proposal.nicheLabel': 'تغيير مجال الكتالوج:',
    'proposal.nicheLiving': '🛋️ أنتريهات وركونات فاخرة',
    'proposal.nicheCarpentry': '🚪 أبواب وتجاليد نجارة عمولة',
    'proposal.nicheOffice': '🪑 مكاتب ومساحات عمل',

    // ── Custom request page
    'custom.heroTag': '[تسعير شغل الموبيليا والنجارة العمولة]',
    'custom.heroTitle': 'ابعت الصورة وخد السعر',
    'custom.heroSubtitle': 'عندك صورة ركنة أو انتريه أو دولاب عاجبك على بينترست أو الفيسبوك؟ ابعت الصورة والتفاصيل وتاخد السعر والتنفيذ من الورشة طوالى.',
    'custom.startingPoint': 'نوع الشغل (اختياري)',
    'custom.noCategory': 'بدون قسم معين',
    'custom.descLabel': 'اكتب لنا اللي في دماغك بالتفصيل *',
    'custom.descPlaceholder': 'مثلاً: عايز ركنة حرف L خشب زان قماش كابوتونيه زيتى بنفس المقاسات...',
    'custom.sizeLabel': 'المقاسات المتاحة عندك (اختياري)',
    'custom.sizePlaceholder': 'مثلاً: طول 3 متر × عرض 2 متر',
    'custom.materialsLabel': 'أنواع الخشب والخامات اللي تحبها',
    'custom.refLabel': 'ارفع صورة الموديل اللي عاجبك (اختياري)',
    'custom.refUploadText': 'اسحب الصورة هنا أو انقر عشان تختارها',
    'custom.refUploadHint': 'ارفع أي صورة من موبايلك، بينترست، أو الفيسبوك.',
    'custom.nameLabel': 'الاسم الكريم *',
    'custom.namePlaceholder': 'الاسم بالكامل',
    'custom.submitBtn': 'إرسال طلب تسعير',
    'custom.whatsappBtn': 'أرسل الفكرة عبر واتساب',
    'custom.successTitle': 'تم إرسال الطلب بنجاح',
    'custom.successMsg': 'سنراجع تصميمك ونرد عليك بتسعير مناسب.',
    'custom.backToCatalog': 'العودة إلى الكتالوج',

    // ── Admin login
    'login.subtitle': 'بوابة إدارة الورشة',
    'login.localHint': 'وضع العرض التجريبي — لم يتم ربط قاعدة بيانات بعد. سجّل الدخول بـ',
    'login.emailLabel': 'البريد الإلكتروني',
    'login.passLabel': 'كلمة المرور',
    'login.signInBtn': 'تسجيل الدخول',
    'login.configureDB': 'إعداد اتصال قاعدة البيانات',

    // ── Admin dashboard
    'admin.totalProducts': 'إجمالي المنتجات',
    'admin.outOfStock': 'غير متاح',
    'admin.categories': 'الفئات',
    'admin.manageProducts': 'إدارة المنتجات',
    'admin.manageCategories': 'إدارة الفئات',
    'admin.orderRequests': 'طلبات الشراء',
    'admin.customRequests': 'طلبات التصميم',
    'admin.addProduct': '+ إضافة منتج',
    'admin.searchCatalog': 'بحث في الكتالوج...',
    'admin.createCategory': 'إنشاء فئة',
    'admin.allCategories': 'جميع الفئات',
    'admin.categoryName': 'اسم الفئة',
    'admin.categoryPlaceholder': 'مثال: طاولات طعام',
    'admin.save': 'حفظ',
    'admin.cancel': 'إلغاء',
    'admin.allStatuses': 'جميع الحالات',
    'admin.pending': 'معلق',
    'admin.confirmed': 'مؤكد',
    'admin.rejected': 'مرفوض',
    'admin.new': 'جديد',
    'admin.inReview': 'قيد المراجعة',
    'admin.quoted': 'تم التسعير',
    'admin.closed': 'مغلق',
    'admin.disconnectDB': 'قطع الاتصال بالقاعدة',
    'admin.signOut': 'تسجيل الخروج',

    // ── DB config modal
    'db.title': 'إعداد قاعدة البيانات',
    'db.desc': 'لتصفح الكتالوج والوصول إلى لوحة الإدارة، يرجى ربط مشروع Supabase الخاص بك. بياناتك محفوظة بأمان في المتصفح.',
    'db.urlLabel': 'رابط مشروع Supabase',
    'db.keyLabel': 'مفتاح Anon',
    'db.connectBtn': 'اتصال بقاعدة البيانات',
    'db.title': 'إعداد قاعدة البيانات',
    'db.desc': 'لتصفح الكتالوج والوصول إلى لوحة الإدارة، يرجى ربط مشروع Supabase الخاص بك. بياناتك محفوظة بأمان في المتصفح.',
    'db.urlLabel': 'رابط مشروع Supabase',
    'db.keyLabel': 'مفتاح Anon',

    'common.uncategorized': 'غير مصنّف',
    'common.noDescription': 'لا يوجد وصف.',
    'common.available': 'متاح',
    'common.unavailable': 'غير متاح',
    'common.sending': 'جارٍ الإرسال...',
    'common.onRequest': 'عند الطلب',
    'common.fromPrice': 'يبدأ من {p}',
    'common.pickAny': '(اختر ما تشاء)',
    'common.noCategoryPicked': 'بدون فئة محددة',
    'common.confirmDisconnect': 'قطع الاتصال بقاعدة البيانات؟ سيتم مسح بيانات Supabase المحفوظة محلياً.',

    // ── Footer
    'footer.trustDeliveryTitle': 'معاينة وتسليم من الورشة',
    'footer.trustDeliverySub': 'المعاينة قبل الدفع والتحميل',
    'footer.trustWoodTitle': 'خشب زان وبلوط طبيعي 100%',
    'footer.trustWoodSub': 'خامات معالجة تعيش العمر',
    'footer.trustCustomTitle': 'مقاسات وعمولة حسب طلبك',
    'footer.trustCustomSub': 'ننفذ لك المقاسات المتاحة عندك',
    'footer.trustSupportTitle': 'رد وسعر فورى ع الواتساب',
    'footer.trustSupportSub': 'ابعت الصورة وخد السعر طوالى',
    'footer.brandDesc': 'معرض وورشة نجارة وموبيليا عمولة. بننفذ كل موديلات الخشب الزان والموبيليا بمقاساتك وتشطيب الورشة المباشر.',
    'footer.hoursLabel': 'مواعيد العمل:',
    'footer.hoursVal': 'السبت – الخميس: من 10 صباحاً لـ 10 مساءً',
    'footer.quickLinksTitle': 'روابط سريعة',
    'footer.linkWhatsApp': 'طلب سريع ع الواتساب',
    'footer.contactTitle': 'تواصل معنا',
    'footer.addressVal': 'معرض وورشة النجارة، المنطقة الصناعية، مصر',
    'footer.whatsappChat': 'تواصل معنا ع الواتساب (تسعير فورى)',
    'footer.copyright': '© 2026 [معرض وورشة الموبيليا]. جميع الحقوق محفوظة.',
    'footer.taglineSub': 'موبيليا ونجارة عمولة بأعلى جودة',
  },
};

// ─────────────────────────────────────────────
//  State
// ─────────────────────────────────────────────
let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

export function getCurrentLang() { return currentLang; }

/** Translate a key, optionally interpolating {n} */
export function t(key, vars = {}) {
  const dict = translations[currentLang] || translations.en;
  let str = dict[key] ?? translations.en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

// ─────────────────────────────────────────────
//  DOM helpers
// ─────────────────────────────────────────────
function applyTranslations() {
  const isAr = currentLang === 'ar';

  // Document direction + lang attribute
  document.documentElement.lang = currentLang;
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';

  // Static text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  // Placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Toggle button label
  const btn = document.getElementById('lang-toggle-btn');
  if (btn) btn.textContent = t('nav.langToggle');
}

// ─────────────────────────────────────────────
//  Toggle
// ─────────────────────────────────────────────
function toggleLang() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  localStorage.setItem(STORAGE_KEY, currentLang);
  applyTranslations();
  // Fire a custom event so catalog.js / admin.js can re-render dynamic content
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
}

// ─────────────────────────────────────────────
//  Init — inject the button and wire up
// ─────────────────────────────────────────────
export function initI18n() {
  // Inject the toggle button into every nav
  const navs = document.querySelectorAll('.nav-links, .admin-nav');
  navs.forEach(nav => {
    if (nav.querySelector('#lang-toggle-btn')) return; // already added
    const btn = document.createElement('button');
    btn.id = 'lang-toggle-btn';
    btn.className = 'btn btn-lang-toggle btn-sm';
    btn.setAttribute('aria-label', 'Switch language');
    btn.textContent = t('nav.langToggle');
    btn.addEventListener('click', toggleLang);
    // Insert before first child (left/right side depending on direction)
    nav.insertBefore(btn, nav.firstChild);
  });

  applyTranslations();
}

// ─────────────────────────────────────────────
// Dynamic Product & Category Translation Map
// ─────────────────────────────────────────────
const dynamicTranslations = {
  ar: {
    // Categories
    'Living Room': 'ركونات وأنتريهات',
    'Dining Room': 'سُفرة وترابيزات',
    'Bedroom': 'غرف نوم ودواليب',
    'Outdoor': 'قعدات حدائق ورووف',
    'Bespoke Doors': 'أبواب وشبابيك عمولة',
    'Wall Paneling': 'تجاليد حوائط خشب',
    'Custom Wardrobes': 'دواليب ودريسينج عمولة',
    'Desks & Workstations': 'مكاتب وشغل شركات',
    'Seating': 'كراسي وبانكات',
    'Conference': 'ترابيزات اجتماعات',

    // Products & Descriptions
    'Oakhurst Dining Table': 'ترابيزة سفرة خشب أرو طبيعي',
    'Solid oak dining table, hand-finished, seats six comfortably.': 'ترابيزة سفرة خشب أرو طبيعي تشطيب عالي، تسع 6 أفراد براحة، شغل ورشة متين تعيش العمر.',

    'Wraith Lounge Sofa': 'انتريه / كنبة 3 مقاعد خشب زان',
    'Three-seater sofa with a solid pine frame. Choose your own fabric.': 'كنبة 3 مقاعد شاسيه خشب زان أحمر مجفف، تختار لون ونوع القماش اللي يناسب بيتك.',

    'Solene Platform Bed': 'سرير خشب جوز طبيعي عمولة',
    'Low-profile platform bed frame in walnut veneer, queen size.': 'سرير مودرن خشب جوز مقاس كوين، قشرة طبيعية ودهان ممتاز.',

    'Custom Teak Bench': 'بانك خشب تيك للحدائق',
    'Weather-treated teak bench, built to your dimensions.': 'بانك حدائق خشب تيك طبيعي معالج ضد المطر والشمس، ونعملهولك ع المقاس المتاح عندك.',

    'Aria Accent Chair': 'فوتيه / كرسي مفرد مودرن',
    'Compact accent chair with brass legs and a curved backrest.': 'فوتيه شيك بأرجل نحاس ومسند مريح، دهان ممتاز وتنجيد إسفنج كثافة عالية.',

    'Solid Oak Entrance Door': 'باب شقة خشب أرو / زان أحمر',
    'Handcrafted solid oak door with brass ironmongery and weather sealing.': 'باب شقة رئيسي خشب أرو صلب عالي الكثافة مع إكسسوارات نحاس وعازل للصوت والأتربة.',

    'Walnut Acoustic Wall Panels': 'تجاليد حوائط خشب جوز عازلة',
    'Natural walnut wood slat acoustic panels for luxury interior accent walls.': 'تجاليد حوائط خشب جوز طبيعي شرائح ديكور عازلة للصوت والحرارة.',

    'Fitted Master Wardrobe': 'دولاب بلت-إن عمولة للسقف',
    'Floor-to-ceiling built-in wardrobe with soft-close drawers and LED strip channels.': 'دولاب من الأرض للسقف أدراج هيدروليك وإضاءة ليد مخفية.',

    'Executive Mahogany Desk': 'مكتب تنفيذي خشب ماهوجني أحمر',
    'Spacious executive desk with integrated cable management and leather inlay.': 'مكتب تنفيذي خشب ماهوجني أحمر متين بمخارج سلك مستترة وتطعيم جلد طبيعي.',

    'Ergonomic Mesh Manager Chair': 'كرسي مكتب هيدروليك شبك مريح',
    'Full lumbar support with aluminum base and breathable mesh back.': 'كرسي مكتب هيدروليك شبك صحي، قاعدة ألومنيوم متينة ومريح للظهر ع مدار اليوم.',

    '10-Person Conference Table': 'ترابيزة اجتماعات 10 أفراد خشب صلب',
    'Solid teak top conference table with built-in power hubs.': 'ترابيزة اجتماعات 10 أفراد خشب تيك صلب مزودة بمنافذ شحن وكهرباء.',

    // Option groups & values (Egyptian Trade Swatches)
    'Fabric': 'نوع القماش والتنجيد',
    'Linen': 'كتان معالج',
    'Velvet': 'قطيفة / جوبلان',
    'Leather': 'جلد طبيعي / مقلوب',
    'Oak': 'أرو طبيعي',
    'Walnut': 'خشب جوز',
    'Pine': 'زان أحمر / سويد',
    'Teak': 'خشب تيك طبيعي',
    'Metal accents': 'إكسسوارات استيل/نحاس',
    'Width': 'العرض بالسم',
    'Add-ons': 'إضافات ومواصفات',
    'Extra Cushion': 'خدادية إضافية',
    'Armrest Tray': 'صينية مسند يد',
    'Seats': 'عدد المقاعد',
    'Wood Finish': 'دهان الخشب والتشطيب',
    'Natural Matte Oak': 'أرو مط طبيعي',
    'Dark Smoked Oak': 'أرو مدخن داكن',
    'Frame Color': 'لون الشاسيه',
    'Midnight Black': 'أسود مط ملكي',
    'Polished Chrome': 'استيل / كروم لامع',

    // UI Badges & Labels
    'Made to Order': 'شغل عمولة بالحجز',
    'Out of Stock': 'غير متاح حالياً',
    'Currently Available': 'جاهز ع المعاينة والتحميل',
    'Made to Order / Out of Stock': 'شغل عمولة / غير متاح',
    'View Details →': 'شوف التفاصيل ←',
    'View Details &rarr;': 'شوف التفاصيل ←',
  }
};

/** Dynamic string translator for catalog categories, products, and options */
export function tr(str) {
  if (!str) return '';
  if (currentLang === 'ar' && dynamicTranslations.ar[str]) {
    return dynamicTranslations.ar[str];
  }
  return str;
}

// ─────────────────────────────────────────────
//  Auto-init when loaded as a side-effect module
// ─────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
