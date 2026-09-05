/**
 * Fıkıh asistanı bilgi kaynağı — yalnızca hayzdosya.pdf içeriği.
 * PDF dışı genel cevap üretilmez.
 */

export const CONTACT_EMAIL = "destek@hayztakvimi.app";

export type AssistantMatch = {
  answer: string;
  sourceLabel: string;
  score: number;
};

function normalize(raw: string): string {
  return raw
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** PDF’den derlenen konu kartları (metinler hayzdosya.pdf ile sınırlı). */
const TOPIC_CARDS: Array<{
  id: string;
  keywords: string[];
  answerTR: string;
}> = [
  {
    id: "hanafi-minmax",
    keywords: [
      "3 gun",
      "72",
      "kisa",
      "asgari",
      "en az",
      "10 gun",
      "240",
      "uzun",
      "azami",
      "en cok",
      "hanefi",
      "hayz muddet",
    ],
    answerTR:
      "hayzdosya.pdf (Hanefî): Âdet zamanı yâni hayz müddetinin en azı 3, en çoğu 10 gündür. Eğer hayz kanı 3 gün, yâni 72 saat dolmadan kesilse, hayz sanıp namazını kılmadıysa sadece abdest alıp kazâ eder; gusl lâzım değildir. 3 gün (72 saat) tamam olduktan sonra kesilse hayz olduğu anlaşılır, gusl edip vakit namazını kılar. 10 gün, yâni 240 saat tamam olduğunda, kesilse de kesilmese de gusl edip namazını kılar.",
  },
  {
    id: "maliki-max",
    keywords: [
      "maliki",
      "malıkı",
      "en cok gun",
      "en fazla",
      "azami",
      "15 gun",
      "taklit",
    ],
    answerTR:
      "hayzdosya.pdf (Mâlikî’de Bazı Kaideler): Hayzın en azı yoktur. Bir damla gelse de hayz kabul edilir. En fazlası ise 15 gündür. 15 günden fazla gelirse istihâza [özür] olur. İkinci hayzın olabilmesi için aradan en az 15 gün geçmesi gerekir. Ayrıca: Mâlikî’yi taklit edenlerin, şimdiye kadar gördüğü en çok hayz miktarını bilmesi gerekir; çünkü Mâlikî’de âdetlerinden en çoğunun 3 gün fazlası hayz olur. Daha fazlası ve 15 günden fazlası istihâza (özür) olur.",
  },
  {
    id: "istihadha-namaz",
    keywords: [
      "istiha",
      "ozur",
      "namaz",
      "abdest",
      "oruç",
      "oruc",
    ],
    answerTR:
      "hayzdosya.pdf: İstihâza; 3 günden az, âdetten çok olup hayz olmayan kanlı günlerdir; özür kanı da denir. İstihâza olan günlerdeki namazlar kazâ edilir / istihâza günlerinde abdest alınıp namaz kılınır (özür hâlinde). 10 günden sonra gelen kan istihâza olur; gusletmeden abdest alıp namaz kılınır.",
  },
  {
    id: "ghusl",
    keywords: ["gusul", "gusl", "yikan", "temizlen"],
    answerTR:
      "hayzdosya.pdf: 3 gün (72 saat) tamam olduktan sonra kan kesilse hayz olduğu anlaşılır, gusl edip vakit namazını kılar. 10 gün (240 saat) tamam olduğunda, kesilse de kesilmese de gusl edip namazını kılar. 3 günden kısa kesilmede gusl lâzım değildir; sadece abdest alıp kazâ eder.",
  },
  {
    id: "sahih-fasid",
    keywords: [
      "sahih",
      "fasid",
      "temizlik",
      "15 gun",
      "adet degis",
      "kaide",
    ],
    answerTR:
      "hayzdosya.pdf: Sahîh temizlik; âdetten sonra 15 veya daha ziyâde gün içinde hiç kan görülmezse ve öncesi-sonrası hayz günleri olursa bu temiz günlerdir. Fâsid temizlik / hükmî temizlik; 15+ temiz gün içinde fâsid kan (istihâza) bulunursa veya hayz müddeti içinde kansız günler olursa. Kâide: «Fâsid kan ve fâsid temizlik, âdeti değiştirmez.»",
  },
  {
    id: "rastlama",
    keywords: ["rastlayan", "rastlamayan", "cakisma", "adet zaman"],
    answerTR:
      "hayzdosya.pdf: Kâide: Yeni hayzdaki kan süresi 10 günü geçerse ve bunun 3 veya daha fazla günü önceki âdet zamanı günlerine rastlamazsa, âdet zamanı değişir; fakat gün sayısı değişmez. Âdet zamanına rastlarsa, rastladığı gün sayısı hayz, kalanı istihâza olur.",
  },
  {
    id: "nifas",
    keywords: ["nifas", "lohusa", "dogum", "40 gun", "60 gun"],
    answerTR:
      "hayzdosya.pdf: Nifâs, doğumdan sonra gelen lohusalık kanıdır. Hanefî’de nifâsın en çok zamanı 40 gündür; 40 gün tamam olunca kan kesilmese de gusledip namaza başlar; 40 günden sonrası istihâzadır. Mâlikî’de nifâsın azamî müddeti 60 gündür.",
  },
  {
    id: "istimrar",
    keywords: ["istimrar", "surekli", "kesilmeden", "kursuf", "leke"],
    answerTR:
      "hayzdosya.pdf: İstimrâr; kanın kesilmeden sürekli akmasıdır. Kürsüf üzerinde aylarca her gün kan lekesi gören kız her ay 10 gün hayzlı, sonra 20 gün istihâzalı kabul edilir. Daha önce âdeti belli olan böyle bir kadın ise âdetine göre hareket eder. Mâlikî’de kızlarda istimrârda 15 gün hayz, 15 gün istihâza kabul edilir.",
  },
  {
    id: "ayise",
    keywords: ["ayise", "menopoz", "yasli", "55", "70"],
    answerTR:
      "hayzdosya.pdf: Âyise yaşı; Hanbelî’de 50, Hanefî’de 55, Şâfiî’de 60, Mâlikî’de 70’tir (hicrî). Bu yaşlardan sonra gelen kan hayz olmaz, istihâza olur.",
  },
  {
    id: "taklit-maliki-namaz",
    keywords: ["taklit", "kazâ", "kaza", "10 gunu as", "maliki"],
    answerTR:
      "hayzdosya.pdf: Mâlikî ve Şâfiî mezhebini taklîd eden Hanefî mezhebindeki bir kadının âdeti 10 günü aşarsa, bugünlerde kılmadığı namazlarını temizlendikten sonra kazâ eder. Mâlikî’yi taklit eden, Mâlikî’nin hayz dediği 15 gün namaz kılmaz; sonra (Hanefî’ye göre) kılmadığı fazlalığı kazâ eder.",
  },
];

const MIN_SCORE = 3;

export function matchFiqhAnswer(
  question: string,
  locale: "tr" | "en"
): AssistantMatch | null {
  const q = normalize(question);
  if (q.length < 3) return null;

  let best: { card: (typeof TOPIC_CARDS)[number]; score: number } | null =
    null;

  for (const card of TOPIC_CARDS) {
    let score = 0;
    for (const kw of card.keywords) {
      const nkw = normalize(kw);
      if (!nkw) continue;
      if (q.includes(nkw)) {
        // multi-word phrases weigh more
        score += nkw.includes(" ") ? 3 : 2;
      } else {
        // token overlap
        const tokens = nkw.split(" ").filter((t) => t.length > 2);
        const hits = tokens.filter((t) => q.includes(t)).length;
        if (hits > 0 && hits === tokens.length) score += 2;
        else if (hits > 0) score += 1;
      }
    }
    // boost when both school + topic present for Maliki max
    if (
      card.id === "maliki-max" &&
      (q.includes("maliki") || q.includes("malik")) &&
      (q.includes("en cok") ||
        q.includes("azami") ||
        q.includes("15") ||
        q.includes("fazla") ||
        q.includes("gun"))
    ) {
      score += 4;
    }
    if (!best || score > best.score) best = { card, score };
  }

  if (!best || best.score < MIN_SCORE) return null;

  const answer =
    locale === "tr"
      ? best.card.answerTR
      : `${best.card.answerTR}\n\n(Source: hayzdosya.pdf — Turkish primary text.)`;

  return {
    answer,
    sourceLabel: "hayzdosya.pdf",
    score: best.score,
  };
}

export function unknownAnswerMessage(
  locale: "tr" | "en",
  userEmail: string | null | undefined
): string {
  const mail = CONTACT_EMAIL;
  if (locale === "tr") {
    return [
      "Bu soruyu elimdeki hayzdosya.pdf kaynağında net yanıtlayamadım; bu yüzden genel/tahmini cevap vermiyorum.",
      `Sorunuz sisteme kaydedildi ve ${mail} adresine iletildi.`,
      userEmail
        ? `İletide soruyu soran hesap olarak kayıtlı e-posta bildirildi: ${userEmail}.`
        : "Hesabınızda kayıtlı e-posta bulunamadı; iletide misafir olarak belirtildi. Dönüş için Hesabım’dan e-posta eklemeniz önerilir.",
      `24 saat içinde ${mail} hesabından size dönüş yapılacaktır.`,
    ].join(" ");
  }
  return [
    "I could not answer this from hayzdosya.pdf, so I will not give a generic answer.",
    `Your question was saved and forwarded to ${mail}.`,
    userEmail
      ? `The request notes your account email: ${userEmail}.`
      : "No account email was found; the request is marked as guest. Please add an email under My Account.",
    `You will receive a reply from ${mail} within 24 hours.`,
  ].join(" ");
}
