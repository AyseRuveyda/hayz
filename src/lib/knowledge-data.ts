import type { KnowledgeItem } from "@/types/fiqh";

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: "hayz-limits-color",
    category: "Genel Kurallar",
    categoryKey: "rules",
    titleTR: "Hayzın Temel Sınırları ve Renk Hükmü",
    titleEN: "Basic Limits of Hayd and Color Rulings",
    contentTR:
      "Hanefî mezhebinde hayzın asgari süresi 3 gün (72 vasatî saat), azami süresi 10 gündür (240 saat). 72 saatten 5 dakika bile az süren kan hayz sayılmaz; istihâze (özür kanı) olur. Beyaz dışındaki sarı, bulanık, kırmızı, siyah ve benzeri her türlü akıntı kan hükmündedir. Hayz kanının aralıksız akması şart değildir.",
    contentEN:
      "In the Hanafi school, hayd is at least 3 days (72 standard hours) and at most 10 days (240 hours). Bleeding even 5 minutes under 72 hours is not hayd but istihadha. Any discharge other than white—yellow, cloudy, red, black—is treated as blood. Continuous flow is not required.",
    sourcesTR: "Seâdet-i Ebediyye; İslâm Ahlâkı; Halebî",
    sourcesEN: "Sadat-i Abadiyya; Islam Ahlaki; Halabi",
  },
  {
    id: "fasid-tuhr-10days",
    category: "Genel Kurallar",
    categoryKey: "rules",
    titleTR: "Fâsid Temizlik ve 10 Gün İçi Kan Akışı Hükmü",
    titleEN: "Invalid Purity and Bleeding Within 10 Days",
    contentTR:
      "Hayz kanının kesilmeden sürekli akması şart değildir. 10 günlük hayz süresi içinde kan görülen günler arasındaki temizlik günleri fâsid temizlik olup kan hükmündedir; kan kesintisiz akmış sayılır. İmâm-ı Muhammed’in İmâm-ı Âzam rivâyetine göre 10 gün içinde hep aktı kabul edilir. İki hayz arası sahih temizliğin asgarisi 15 tam gündür.",
    contentEN:
      "Hayd blood need not flow without interruption. Clean days between bleeding days within the 10-day hayd window are invalid purity and count as blood—continuous flow is assumed. Per Imam Muhammad’s narration from Imam al-A’zam, bleeding within 10 days is treated as continuous. Minimum valid purity between two hayd periods is 15 full days.",
    sourcesTR:
      "İmâm-ı Muhammed; İmâm-ı Âzam Ebû Hanîfe Rivâyeti; Seâdet-i Ebediyye",
    sourcesEN:
      "Imam Muhammad; Imam Abu Hanifa narration; Sadat-i Abadiyya",
  },
  {
    id: "adet-degisimi-rastlayan",
    category: "Genel Kurallar",
    categoryKey: "rules",
    titleTR: "Âdetin Değişmesi ve Rastlayan/Rastlamayan Kaidesi",
    titleEN: "Changing Habit and the Overlap Rule",
    contentTR:
      "10 günü aşmayan sahih kan ve 15 günü aşan sahih temizlik âdeti bir kerede değiştirir. Fâsid kan ve fâsid temizlik âdeti değiştirmez. 10 günü aşan kanamalarda: Kanın 3 veya daha fazla günü eski âdet günlerine rastlarsa rastladığı günler hayz, kalanı istihâze olur; istihâze günlerinin namazları kaza edilir. Rastlamazsa gün sayısı değişmez, âdetin başlangıç vakti değişir.",
    contentEN:
      "Valid bleeding under 10 days and valid purity over 15 days change the habit once. Invalid blood and invalid purity do not. If bleeding exceeds 10 days: when 3+ days overlap the previous habit days, overlapping days are hayd and the rest istihadha (prayers made up). If not, the day count stays but the habit’s starting time changes.",
    sourcesTR: "Mesâil-i Şerh-i Vikâye; İslâm Ahlâkı",
    sourcesEN: "Masa'il-i Sharh-i Vikaya; Islam Ahlaki",
  },
  {
    id: "forbidden-hayz-nifas",
    category: "Namaz",
    categoryKey: "prayer",
    titleTR: "Hayz ve Nifâslıya Yasak Olan Haller",
    titleEN: "What Is Forbidden During Hayd and Nifas",
    contentTR:
      "Hayz ve nifâs hâlinde namaz kılamaz, oruç tutamaz (oruç kaza edilir; namaz affolur), Kur’ân-ı Kerîm okuyamaz, mushafa el süremez, camiye giremez, Kâbe’yi tavaf edemez, tilâvet ve şükür secdesi yapamaz, vaty (cima) haramdır. Kadın hayzın başladığını ve bittiğini eşinden gizleyemez.",
    contentEN:
      "During hayd and nifas: prayer and fasting are not valid (fasts are made up; prayers are excused), Qur’an recitation and touching the mushaf are forbidden, entering the mosque and tawaf are forbidden, prostrations of recitation/thanks are forbidden, and intercourse is forbidden. A woman must not hide the start or end of hayd from her husband.",
    sourcesTR:
      "Buhârî; Müslim; Tirmizî; Vâkıa: 79; Bakara: 222; Cevhere",
    sourcesEN:
      "Sahih al-Bukhari; Sahih Muslim; al-Tirmidhi; al-Waqi’ah 79; al-Baqarah 222; Jawhara",
  },
  {
    id: "permitted-hayz-nifas",
    category: "Namaz",
    categoryKey: "prayer",
    titleTR: "Hayzlı ve Nifâslıya Serbest Olan Haller",
    titleEN: "What Is Permitted During Hayd and Nifas",
    contentTR:
      "Besmele, salavât, kelime-i tevhid, istiğfar ve dua âyetlerini dua niyetiyle ezberden okuma caizdir. Her vakit namazında abdest alıp seccadede oturarak zikir ve tesbih çekmek müstehabdır; en iyi kıldığı namazın sevabı verilir. Saç ve tırnak kesimi, saç boyama, bebek emzirme caizdir (cünüpte saç kesmek mekrûh iken hayzlıda mekrûh değildir).",
    contentEN:
      "Basmala, salawat, the testimony of faith, istighfar, and supplication verses from memory with du’a intent are permitted. Sitting on the prayer rug with wudu at each prayer time for dhikr and tasbih is recommended and rewarded like one’s best prayer. Hair/nail cutting, dyeing hair, and nursing a baby are permitted (unlike junub, where hair cutting is disliked).",
    sourcesTR: "Hadîka; Halebî",
    sourcesEN: "Hadika; Halabi",
  },
  {
    id: "istihadha-rules",
    category: "İstihâze",
    categoryKey: "istihadha",
    titleTR: "İstihâze (Özür Kanı) Halleri ve İbadet Hükmü",
    titleEN: "Istihadha and Its Worship Rulings",
    contentTR:
      "72 saatten az süren kan, 10 günü aşan kanamaların fazlası, 9 yaş altı kızdan gelen kan ve âyise yaşından sonra gelen kan istihâzadır. İstihâze sahibi namazını kılar, orucunu tutar; cima câizdir. Kılınmayan vakit namazları kaza edilir. Gusül yalnızca hayz/nifâs bitiminde farzdır.",
    contentEN:
      "Bleeding under 72 hours, the portion beyond 10 days, blood before age 9, and blood after menopause age are istihadha. The woman prays and fasts; intercourse is permitted. Missed prayers are made up. Ghusl is obligatory only when hayd/nifas ends.",
    sourcesTR: "İslâm Ahlâkı; Dürr-i Yektâ",
    sourcesEN: "Islam Ahlaki; Durri Yekta",
  },
  {
    id: "menopause-ages",
    category: "Genel Kurallar",
    categoryKey: "rules",
    titleTR: "Dört Mezhebe Göre Âyise (Menopoz) Yaşları",
    titleEN: "Menopause Ages in the Four Schools",
    contentTR:
      "Hanbelî: hicrî 50 (miladî yaklaşık 48 yıl 6 ay 4 gün). Hanefî: hicrî 55 (miladî yaklaşık 53 yıl 4 ay 10 gün). Şâfiî: hicrî 60 (miladî yaklaşık 58 yıl 2 ay 15 gün). Mâlikî: hicrî 70 (miladî yaklaşık 67 yıl 11 ay). Bu yaşlardan sonra gelen kan hayz olmaz; istihâze sayılır.",
    contentEN:
      "Hanbali: 50 lunar years (~48y 6m 4d solar). Hanafi: 55 lunar (~53y 4m 10d). Shafi’i: 60 lunar (~58y 2m 15d). Maliki: 70 lunar (~67y 11m). Blood after these ages is not hayd but istihadha.",
    sourcesTR: "Seâdet-i Ebediyye",
    sourcesEN: "Sadat-i Abadiyya",
  },
  {
    id: "nifas-rules",
    category: "Genel Kurallar",
    categoryKey: "rules",
    titleTR: "Nifâs (Lohusalık) Hükümleri",
    titleEN: "Nifas (Postnatal Bleeding) Rulings",
    contentTR:
      "Nifâsın asgari sınırı yoktur; kan kesildiğinde gusül edilip ibadete dönülür. Azami sınır Hanefî ve Hanbelî’de 40 gün, Mâlikî’de 60 gündür. 40 günü aşan kısım istihâzadır. Parmak, saç, ağız veya burnu belirmiş düşükten sonra gelen kan da nifâstır.",
    contentEN:
      "Nifas has no minimum; when bleeding stops, ghusl is performed and worship resumes. Maximum is 40 days in Hanafi and Hanbali, 60 in Maliki. Beyond 40 days the remainder is istihadha. Blood after miscarriage with visible finger, hair, mouth or nose is also nifas.",
    sourcesTR: "İslâm Ahlâkı; Seâdet-i Ebediyye",
    sourcesEN: "Islam Ahlaki; Sadat-i Abadiyya",
  },
  {
    id: "istimrar-rules",
    category: "İstihâze",
    categoryKey: "istihadha",
    titleTR: "İstimrâr (Kesintisiz Kan Akışı) Kuralları",
    titleEN: "Istimrar (Continuous Bleeding) Rules",
    contentTR:
      "İstimrâr, kanın az da olsa kesilmeden devamlı akmasıdır. İlk kez kan gören kızda istimrâr olursa 10 gün hayz, 20 gün temiz (istihâze) kabul edilir; kan kesilinceye kadar 10–20 döngüsü devam eder. Sahih kan ve sahih temizlik gördükten sonra istimrâr başlayan kız âdeti belli kadın sayılır; âdeti kadar hayz, sonrası istihâze olur.",
    contentEN:
      "Istimrar is continuous bleeding without cessation. For a girl’s first bleeding with istimrar: 10 days hayd, 20 days clean (istihadha), repeating until bleeding stops. After valid hayd and valid purity, istimrar makes her like a woman with an established habit: habitual hayd days then istihadha.",
    sourcesTR: "Mesâil-i Şerh-i Vikâye",
    sourcesEN: "Masa'il-i Sharh-i Vikaya",
  },
  {
    id: "maliki-hayz-taklit",
    category: "Genel Kurallar",
    categoryKey: "rules",
    titleTR: "Mâlikî Mezhebinde Hayz ve Mâlikî’yi Taklit Eden Hanefîler",
    titleEN: "Hayd in Maliki and Hanafis Following Maliki",
    contentTR:
      "Mâlikî’de hayzın asgari sınırı yoktur; bir damla dahi hayz sayılabilir. Azami sınır 15 gündür; fazlası istihâzedir. İkinci hayz için arada en az 15 gün geçmesi gerekir. Mâlikî’yi taklit eden Hanefî kadın 10 günü aşan kanamada namaz kılmaz; temizlenince 10 günden sonraki günlerin namazını Hanefî’ye göre kaza eder.",
    contentEN:
      "Maliki has no minimum hayd—even a drop may count. Maximum is 15 days; beyond is istihadha. At least 15 days must pass before the next hayd. A Hanafi following Maliki does not pray during bleeding beyond 10 days, but after purity she makes up prayers for days after day 10 according to Hanafi rules.",
    sourcesTR: "Seâdet-i Ebediyye",
    sourcesEN: "Sadat-i Abadiyya",
  },
  {
    id: "hayzin-degismesi-kurali",
    category: "Genel Kurallar",
    categoryKey: "rules",
    titleTR: "Hayzın Değişmesi Kuralı",
    titleEN: "Rule of Habit Change",
    contentTR:
      "Kadın bir önceki âdetinin zamanına ve sayısına uygun kan görürse hayz değişmemiş sayılır; uygun olmazsa âdet değişmiş kabul edilir (bir kere uygun olmayınca yeter). Örnek: âdeti 5 gün olan kadın bir kere 7 gün sahîh kan görünce âdeti 7 olur. Bu değişmeler en fazla 10 güne kadar olur; 11+ gün sürerse önceki âdetten fazlası özürdür. Temizlik sayısı da bir kere başka sayıda sahîh temizlikle değişir (örn. 20→25 veya en az 15’e inme). Kâide: Fâsid kan ve fâsid temizlik âdeti değiştirmez. 10 günü aşan kanamada ≥3 gün eski âdete rastlarsa rastlayanlar hayz / kalan istihâza; rastlamazsa gün sayısı değişmez, âdet zamanı (başlangıç) değişir.",
    contentEN:
      "If bleeding matches the previous habit’s timing and length, the habit is unchanged; otherwise one mismatched valid cycle changes it. Example: habit 5 days → one valid 7-day bleed becomes 7. Changes cap at 10 days in Hanafi; beyond that the excess is excuse bleeding. Valid purity can also change once. Invalid blood/purity never change the habit. Overlap rules apply when bleeding exceeds 10 days.",
    sourcesTR: "hayzdosya.pdf — Hayzın Değişmesi Kuralı",
    sourcesEN: "hayzdosya.pdf — Habit change",
  },
  {
    id: "adet-degismesi-sekilleri",
    category: "Genel Kurallar",
    categoryKey: "rules",
    titleTR: "Âdetin Değişmesi Kaç Şekilde Olur?",
    titleEN: "Forms of Habit Change",
    contentTR:
      "1) Âdeti 10 günden az olanlar: Bir kere 10 gün veya daha az sahîh kan görünce yeni gün sayısı âdet olur. 2) 10 günden fazla sürenler: A) Önceki âdete ≥3 gün rastlamayanlarda önceki âdet kadar gün hayz, sonrası istihâza (gün sayısı değişmez, zaman kayabilir). B) ≥3 gün rastlayanlarda yalnız rastlayan günler hayz, diğer kanlı günler istihâzadır. Ana kaide: Bir kere başka sayıda SAHÎH kan âdeti; bir kere başka sayıda SAHÎH temizlik temizlik sayısını değiştirir.",
    contentEN:
      "Under 10 days: one valid bleed of ≤10 days sets the new habit length. Over 10 days: overlap ≥3 days → overlapping days are hayd; otherwise keep previous day-count as hayd and treat the rest as istihadha. Valid blood/purity change the habit once; invalid never does.",
    sourcesTR: "hayzdosya.pdf — Âdetin Değişmesi",
    sourcesEN: "hayzdosya.pdf — Habit change forms",
  },
  {
    id: "maliki-hayz-nifas",
    category: "Mâlikî",
    categoryKey: "maliki",
    titleTR: "Mâlikî’de Hayz ve Nifâs",
    titleEN: "Hayd and Nifas in Maliki",
    contentTR:
      "Dokuz yaşına gelmiş kızda sebepsiz kırmızı/sarı/bulanık akıntı hayz kanıdır; akmaya başlayınca hayz olur. 15 günden azı âdet, fazlası istihâzadır. Sonraki ayda âdet değişirse âdetlerin en çoğunun 3 gün fazlası hayz olur; daha fazlası ve 15+ istihâzadır. Temizlik asgarisi 15 gündür. Doğumdan önce gelen kan hayzdır; karın yarılarak (sezaryen) alınan çocukta gelen kan nifâs olmaz. Nifâs azamî 60 gündür; 15 gün kesilirse tâhir olur.",
    contentEN:
      "Maliki: any drop may start hayd; max 15 days. Later months may use max-seen + 3 (cap 15). Min purity 15 days. Antepartum bleeding is hayd; cesarean blood is not nifas. Nifas max 60 days.",
    sourcesTR: "hayzdosya.pdf — Mâlikî’de Hayz ve Nifâs",
    sourcesEN: "hayzdosya.pdf — Maliki hayd & nifas",
  },
  {
    id: "maliki-kaideler",
    category: "Mâlikî",
    categoryKey: "maliki",
    titleTR: "Mâlikî’de Bazı Kaideler",
    titleEN: "Selected Maliki Rules",
    contentTR:
      "1) Hayzın en azı yoktur; en fazlası 15 gündür. 2) İkinci hayz için en az 15 gün ara gerekir. 3) 70 yaş (âyise) sonrası kan istihâzadır. 4) Hamilelik/doğum öncesi kan Mâlikî’de hayz (Hanefî’de istihâza); taklitte oruç tutulur, namaz kılınmaz sonra kaza. 5) Kız istimrârında 15 hayz + 15 istihâza. Kadınlarda birinci ay: en çok âdet + 3’e kadar hayz (≤15), ay 30’a tamamlanır; ikinci ay bir önceki kabul edilen hayz + 3… 15’e kadar böyle; 15 aşılırsa 15+15. 6–8) Sezaryen nifâs olmaz (taklitte Hanefî’ye uyulur); nifâs arası <15 temizlik nifâsa dâhildir; 15+ temizlik nifâsı bitirir.",
    contentEN:
      "No minimum hayd; max 15. Next hayd needs 15 clean days. Age 70+ is istihadha. Pregnancy bleeding is hayd in Maliki. Istimrar girls: 15+15. Women: each long month may take previous accepted hayd + 3 up to 15 (not a blind auto +3 every month—conditions apply). Cesarean blood is not nifas for Maliki.",
    sourcesTR: "hayzdosya.pdf — Mâlikî’de Bazı Kaideler",
    sourcesEN: "hayzdosya.pdf — Maliki maxims",
  },
];

export const knowledgeCategories = [
  { key: "all" as const, labelTR: "Hepsi", labelEN: "All" },
  {
    key: "glossary" as const,
    labelTR: "Sözlük",
    labelEN: "Glossary",
  },
  {
    key: "fasting" as const,
    labelTR: "Oruç ve İbadet",
    labelEN: "Fasting & Worship",
  },
  { key: "prayer" as const, labelTR: "Namaz", labelEN: "Prayer" },
  {
    key: "rules" as const,
    labelTR: "Genel Kurallar",
    labelEN: "General Rules",
  },
  {
    key: "maliki" as const,
    labelTR: "Mâlikî",
    labelEN: "Maliki",
  },
  { key: "hajj" as const, labelTR: "Hac ve Umre", labelEN: "Hajj & Umrah" },
  {
    key: "istihadha" as const,
    labelTR: "İstihâze",
    labelEN: "Istihadha",
  },
];
