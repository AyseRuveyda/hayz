export type Locale = "tr" | "en";

type Dict = {
  app: { name: string; shortName: string; tagline: string };
  nav: {
    calculator: string;
    history: string;
    knowledge: string;
    startCta: string;
    notifications: string;
  };
  sidebar: {
    madhhabs: string;
    maliki: string;
    hanafi: string;
    hanafiFollowing: string;
    special: string;
    istimrar: string;
    nifas: string;
    tools: string;
    hayzInfo: string;
    calculation: string;
    contact: string;
    appearance: string;
    language: string;
  };
  home: {
    title: string;
    subtitle: string;
    openCalculator: string;
    openKnowledge: string;
  };
  calculator: {
    title: string;
    subtitle: string;
    startDate: string;
    endDate: string;
    madhhab: string;
    maxHayzDays: string;
    maxHayzHint: string;
    maxHayzDisabled: string;
    habitSection: string;
    habitPurity: string;
    habitHayz: string;
    istimrar: string;
    firstPeriod: string;
    habitCycleStartDay: string;
    habitCycleStartDayHint: string;
    submit: string;
    clear: string;
    reminderTitle: string;
    reminderBody: string;
    guideTitle: string;
    guideBody: string;
    quickIlmihal: string;
    quickAsk: string;
  };
  result: {
    title: string;
    status: string;
    total: string;
    hayz: string;
    istihadha: string;
    ghusl: string;
    qada: string;
    nextHayz: string;
    timeline: string;
    yes: string;
    no: string;
    days: string;
    hours: string;
  };
  knowledge: {
    title: string;
    subtitle: string;
    search: string;
    sources: string;
    print: string;
    empty: string;
  };
  chat: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    close: string;
    disclaimer: string;
    quick1: string;
    quick2: string;
    quick3: string;
  };
  status: {
    HAYZ: string;
    ISTIHADHA: string;
    MIXED: string;
    INVALID_SHORT: string;
  };
  common: {
    dark: string;
    light: string;
  };
};

export const translations: Record<Locale, Dict> = {
  tr: {
    app: {
      name: "Hayz Takvimi",
      shortName: "Hayz Hesaplama",
      tagline: "Hayz, nifas ve istihâze takip platformu",
    },
    nav: {
      calculator: "Hesaplama",
      history: "Geçmiş Kayıtlar",
      knowledge: "Hayz Bilgileri",
      startCta: "Hesaplamaya Başla",
      notifications: "Bildirimler",
    },
    sidebar: {
      madhhabs: "Mezhepler",
      maliki: "Maliki",
      hanafi: "Hanefi",
      hanafiFollowing: "Malikiyi Taklit Eden Hanefi",
      special: "Özel Durumlar",
      istimrar: "İstimrar",
      nifas: "Nifas",
      tools: "Bilgi & Araçlar",
      hayzInfo: "Hayz Bilgileri",
      calculation: "Hesaplama",
      contact: "İletişim",
      appearance: "Görünüm",
      language: "Dil",
    },
    home: {
      title: "Hayz ve istihâze takibinde güvenilir rehber",
      subtitle:
        "Mezhebinize göre kanama sürelerini hesaplayın, ilmihal bilgilerine ulaşın ve fıkhi asistanla sorun.",
      openCalculator: "Hesaplamaya git",
      openKnowledge: "Bilgi kütüphanesi",
    },
    calculator: {
      title: "Hayz Hesaplama",
      subtitle: "Kanama başlangıç ve bitişine göre fıkhi durumu belirleyin.",
      startDate: "Kanama başlangıcı",
      endDate: "Kanama bitişi",
      madhhab: "Mezhep seçimi",
      maxHayzDays: "Maksimum hayz günü",
      maxHayzHint: "Yalnızca Maliki / Maliki taklidinde düzenlenir (varsayılan 15).",
      maxHayzDisabled: "Hanefi’de azami hayz sabittir (10 gün).",
      habitSection: "Sahih ay verileri",
      habitPurity: "Temizlik süresi (gün)",
      habitHayz: "Hayz süresi (gün)",
      istimrar: "İstimrâr (kesintisiz kan akışı)",
      firstPeriod: "İlk defa kan gören bâliğa kız",
      habitCycleStartDay: "Önceki âdetin başladığı ay günü (1–31)",
      habitCycleStartDayHint:
        "Rastlayan/rastlamayan kaidesi için isteğe bağlı; boş bırakılırsa âdet gün sayısı esas alınır.",
      submit: "HESAPLA",
      clear: "Temizle",
      reminderTitle: "Önemli Hatırlatma",
      reminderBody:
        "Bu araç genel fıkhi çerçeveyi gösterir. Şahsi durumunuz için muteber bir âlime danışınız. Tarihleri mümkün olduğunca saat dilimine dikkat ederek girin.",
      guideTitle: "Kılavuz: Doğru Veri Girişi",
      guideBody:
        "Başlangıç ve bitiş saatlerini doğru girin. Alışılmış (sahih) hayz ve temizlik sürelerinizi son birkaç temiz döngünüze göre yazın. Maliki seçiliyse azami günü ihtiyacınıza göre ayarlayın.",
      quickIlmihal: "Bilgi",
      quickAsk: "Soru Sor",
    },
    result: {
      title: "Hesaplama sonucu",
      status: "Durum özeti",
      total: "Toplam süre",
      hayz: "Hayz",
      istihadha: "İstihâze",
      ghusl: "Gusül gerekir mi?",
      qada: "Kaza namazı (tahmini)",
      nextHayz: "En erken yeni hayz",
      timeline: "Döngü zaman çizelgesi",
      yes: "Evet",
      no: "Hayır",
      days: "gün",
      hours: "saat",
    },
    knowledge: {
      title: "Hayz Bilgileri",
      subtitle: "Hayz, istihâze ve ibadet hükümlerine dair özet kartlar.",
      search: "Bilgi veya fetva ara...",
      sources: "KAYNAKLAR",
      print: "Yazdır",
      empty: "Aramanıza uygun içerik bulunamadı.",
    },
    chat: {
      title: "Fıkıh Asistanı",
      subtitle: "Kısa sorularınız için rehberlik alın.",
      placeholder: "Sorunuzu yazın…",
      send: "Gönder",
      close: "Kapat",
      disclaimer:
        "Yanıtlar yalnızca hayzdosya.pdf kaynağına dayanır. Bilinmeyen sorular destek@hayztakvimi.app adresine iletilir; 24 saat içinde dönüş yapılır. Kesin hüküm için ehil bir âlime danışınız.",
      quick1: "3 günden kısa kanama ne sayılır?",
      quick2: "10 günden uzun kanamada ne yapılır?",
      quick3: "İstihâzede namaz kılınır mı?",
    },
    status: {
      HAYZ: "Hayz",
      ISTIHADHA: "İstihâze",
      MIXED: "Karma (hayz + istihâze)",
      INVALID_SHORT: "Kısa kanama (istihâze)",
    },
    common: {
      dark: "Koyu",
      light: "Açık",
    },
  },
  en: {
    app: {
      name: "Hayz Calendar",
      shortName: "Hayz Calculator",
      tagline: "Hayd, nifas and istihadha tracking platform",
    },
    nav: {
      calculator: "Calculator",
      history: "History",
      knowledge: "Knowledge",
      startCta: "Start Calculation",
      notifications: "Notifications",
    },
    sidebar: {
      madhhabs: "Schools",
      maliki: "Maliki",
      hanafi: "Hanafi",
      hanafiFollowing: "Hanafi following Maliki",
      special: "Special cases",
      istimrar: "Continuous bleeding",
      nifas: "Nifas",
      tools: "Info & tools",
      hayzInfo: "Hayd knowledge",
      calculation: "Calculator",
      contact: "Contact",
      appearance: "Appearance",
      language: "Language",
    },
    home: {
      title: "A trusted guide for hayd and istihadha tracking",
      subtitle:
        "Calculate bleeding periods by madhhab, browse rulings, and ask the fiqh assistant.",
      openCalculator: "Go to calculator",
      openKnowledge: "Knowledge library",
    },
    calculator: {
      title: "Hayd Calculator",
      subtitle: "Determine the fiqh status from start and end times.",
      startDate: "Bleeding start",
      endDate: "Bleeding end",
      madhhab: "Madhhab",
      maxHayzDays: "Maximum hayd days",
      maxHayzHint: "Editable for Maliki / following Maliki (default 15).",
      maxHayzDisabled: "Hanafi maximum hayd is fixed at 10 days.",
      habitSection: "Habitual cycle data",
      habitPurity: "Purity length (days)",
      habitHayz: "Hayd length (days)",
      istimrar: "Istimrar (continuous bleeding)",
      firstPeriod: "First period (newly baligh girl)",
      habitCycleStartDay: "Previous habit start day of month (1–31)",
      habitCycleStartDayHint:
        "Optional for overlap rule; if empty, habitual day count is used.",
      submit: "CALCULATE",
      clear: "Clear",
      reminderTitle: "Important reminder",
      reminderBody:
        "This tool shows a general fiqh framework. Consult a qualified scholar for your case. Enter dates with attention to time of day.",
      guideTitle: "Guide: accurate data entry",
      guideBody:
        "Enter precise start and end times. Use your recent clean cycles for habitual hayd and purity lengths. Adjust the Maliki maximum when needed.",
      quickIlmihal: "Knowledge",
      quickAsk: "Ask a question",
    },
    result: {
      title: "Calculation result",
      status: "Status summary",
      total: "Total duration",
      hayz: "Hayd",
      istihadha: "Istihadha",
      ghusl: "Is ghusl required?",
      qada: "Makeup prayers (estimate)",
      nextHayz: "Earliest next hayd",
      timeline: "Cycle timeline",
      yes: "Yes",
      no: "No",
      days: "days",
      hours: "hours",
    },
    knowledge: {
      title: "Knowledge base",
      subtitle: "Summary cards on hayd, istihadha and worship rulings.",
      search: "Search knowledge or fatwa...",
      sources: "SOURCES",
      print: "Print",
      empty: "No matching content found.",
    },
    chat: {
      title: "Fiqh assistant",
      subtitle: "Get guidance for short questions.",
      placeholder: "Type your question…",
      send: "Send",
      close: "Close",
      disclaimer:
        "Answers are limited to hayzdosya.pdf. Unknown questions are forwarded to destek@hayztakvimi.app; reply within 24 hours. Consult a qualified scholar for definitive rulings.",
      quick1: "What is bleeding shorter than 3 days?",
      quick2: "What if bleeding exceeds 10 days?",
      quick3: "Do I pray during istihadha?",
    },
    status: {
      HAYZ: "Hayd",
      ISTIHADHA: "Istihadha",
      MIXED: "Mixed (hayd + istihadha)",
      INVALID_SHORT: "Short bleeding (istihadha)",
    },
    common: {
      dark: "Dark",
      light: "Light",
    },
  },
};
