// Smart Auto-Translator for ArtisanWood Catalog (English <-> Arabic)

const WOOD_DICT = {
  // Common Products
  'dining table': 'طاولة طعام خشبية',
  'lounge sofa': 'كنب استرخاء مودرن',
  'platform bed': 'سرير خشب مودرن',
  'teak bench': 'مقعد خشب تيك مخصص',
  'accent chair': 'كرسي أنيق',
  'entrance door': 'باب شقة خشب طبيعي',
  'wall panels': 'تجليد حوائط خشبية',
  'master wardrobe': 'دولاب غرفة نوم رئيسية',
  'executive desk': 'مكتب تنفيذي راقي',
  'manager chair': 'كرسي مكتب جلد',
  'conference table': 'طاولة اجتماعات كبرى',

  // Materials & Finishes
  'solid oak': 'خشب أرو صلب',
  'natural oak': 'أرو طبيعي',
  'dark oak': 'أرو داكن',
  'smoked oak': 'أرو مدخن',
  'natural teak': 'تيك طبيعي',
  'walnut': 'جوز',
  'natural walnut': 'جوز طبيعي',
  'beech': 'زان',
  'beechwood': 'خشب زان',
  'brass': 'نحاس',
  'linen': 'كتان معالج',
  'velvet': 'مخمل قطيفة',
  'leather': 'جلد طبيعي',

  // Categories
  'living room': 'غرفة المعيشة',
  'dining room': 'غرفة الطعام',
  'bedroom': 'غرفة النوم',
  'outdoor': 'الحدائق والخارج',
  'bespoke doors': 'أبواب مخصصة',
  'wall paneling': 'تجليد حوائط',
  'custom wardrobes': 'خزائن ودواليب',
  'desks & workstations': 'مكاتب ومساحات عمل',
  'seating': 'كراسي ومقاعد',
  'conference': 'قاعات اجتماعات'
};

// Inverse Arabic -> English Dictionary
const AR_TO_EN_DICT = {};
Object.entries(WOOD_DICT).forEach(([en, ar]) => {
  AR_TO_EN_DICT[ar] = en.charAt(0).toUpperCase() + en.slice(1);
});

export async function autoTranslateText(text, targetLang = 'ar') {
  if (!text || !text.trim()) return '';

  const clean = text.trim().toLowerCase();

  // 1. Check local dictionary
  if (targetLang === 'ar' && WOOD_DICT[clean]) {
    return WOOD_DICT[clean];
  }
  if (targetLang === 'en' && AR_TO_EN_DICT[text.trim()]) {
    return AR_TO_EN_DICT[text.trim()];
  }

  // 2. Free Google Translate API Fallback
  try {
    const sl = targetLang === 'ar' ? 'en' : 'ar';
    const tl = targetLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        const translated = data[0].map(item => item[0]).join('');
        if (translated) return translated;
      }
    }
  } catch (e) {
    console.warn('Auto-translation API fallback failed:', e);
  }

  return text; // Return original if fallback unavailable
}
