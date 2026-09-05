import type { Locale } from "@/lib/i18n";

const hints = {
  purityStart: {
    tr: "Son temizliğinizin (kanın kesildiği / gusül sonrası) başlangıç tarih ve saatini girin. Sonraki kanama ile aradaki temizlik süresi buradan hesaplanır.",
    en: "Enter when your last purity began (after bleeding stopped / ghusl). The purity gap to the next bleed is calculated from here.",
  },
  bleedStart: {
    tr: "Bu kanama döneminin başladığı tarih ve saati girin. İlk lekeden veya kesintisiz kanın başlangıcından itibaren işaretleyin.",
    en: "Enter the date and time this bleeding period started — from the first spot or continuous flow.",
  },
  bleedEnd: {
    tr: "Kanamanın bittiği (veya hâlâ sürüyorsa şu anki) tarih ve saati girin. Süre bu iki an arasındaki farktır.",
    en: "Enter when bleeding ended (or now, if it is still ongoing). Duration is the difference between start and end.",
  },
  madhhab: {
    tr: "Hesabın hangi mezhep kaidelerine göre yapılacağını seçin (Hanefî, Mâlikî veya Hanefî’nin Mâlikî’yi taklidi).",
    en: "Choose which school’s rules to apply (Hanafi, Maliki, or Hanafi following Maliki).",
  },
  maxHayzDays: {
    tr: "Mâlikî / taklitte azami hayz günü (çoğunlukla 15). Hanefî’de azami 10 gün sabittir ve buradan değiştirilmez.",
    en: "Maximum hayd days for Maliki / following Maliki (usually 15). Hanafi max is fixed at 10 and not edited here.",
  },
  istimrar: {
    tr: "Kan kesilmeden sürekli akıyorsa işaretleyin. İstimrârda farklı bölme kaideleri uygulanır.",
    en: "Check if bleeding flows continuously without a clear stop. Continuous bleeding uses different split rules.",
  },
  firstPeriod: {
    tr: "Hayatınızda ilk kez hayz görüyorsanız işaretleyin. İlk âdette âdet geçmişi olmadığı için özel başlangıç kaideleri kullanılır.",
    en: "Check if this is your first-ever menstrual period. First periods use special rules because there is no prior habit.",
  },
  prevHayzStart: {
    tr: "En son sahih (geçerli) hayz kanamasının başladığı tarih ve saati girin. Rastlayan / rastlamayan hesabı için kullanılır.",
    en: "Enter when your last valid (sahih) hayd bleeding started. Used for the overlap / non-overlap rule.",
  },
  prevHayzEnd: {
    tr: "En son sahih hayzın bittiği tarih ve saati girin. Genelde bir sonraki temizlik başlangıcı ile aynıdır.",
    en: "Enter when your last valid hayd ended. Often the same moment as the next purity start.",
  },
  prevPurityStart: {
    tr: "Son sahih temizliğin başladığı an (hayz bitişi). Temizlik süresi buradan yeni kanama başlangıcına kadar ölçülür.",
    en: "When last valid purity began (end of hayd). Purity length is measured from here to the new bleed start.",
  },
  contactEmail: {
    tr: "Size dönüş yapabileceğimiz e-posta adresiniz. Mesajınız destek ekibine bu adresle birlikte iletilir.",
    en: "An email we can reply to. Your message is forwarded to support together with this address.",
  },
  contactMessage: {
    tr: "Sorunuzu veya geri bildiriminizi açık yazın. Hayz hesabı, uygulama kullanımı veya içerik hakkında olabilir.",
    en: "Write your question or feedback clearly — about Hayz calculations, app use, or content.",
  },
  authDisplayName: {
    tr: "Hesabınızda görünecek isteğe bağlı ad. Boş bırakabilirsiniz.",
    en: "Optional name shown on your account. You may leave it blank.",
  },
  authEmail: {
    tr: "Giriş ve bildirimler için kullandığınız e-posta adresi.",
    en: "Email address used for sign-in and notifications.",
  },
  authPassword: {
    tr: "En az 6 karakterli bir şifre belirleyin. Güçlü ve size özel olsun.",
    en: "Choose a password of at least 6 characters. Prefer something strong and unique.",
  },
  authPasswordConfirm: {
    tr: "Aynı şifreyi tekrar yazarak doğrulayın.",
    en: "Type the same password again to confirm.",
  },
  profileDisplayName: {
    tr: "Uygulamada görünen adınızı güncelleyin.",
    en: "Update the name shown in the app.",
  },
  profileContactEmail: {
    tr: "Fıkıh asistanında yanıtlanamayan sorular iletilirken destek ekibine bildirilecek e-posta.",
    en: "Email shared with support when the fiqh assistant forwards unanswered questions.",
  },
  profileMadhhab: {
    tr: "Varsayılan mezhebiniz. Hesaplama formu bu tercihle açılır.",
    en: "Your default school of law. The calculator opens with this preference.",
  },
  profileMalikiMax: {
    tr: "Mâlikî / taklitte kullanılacak azami hayz günü (varsayılan 15).",
    en: "Maximum hayd days for Maliki / following Maliki (default 15).",
  },
  profileHabitHayz: {
    tr: "Son sahih âdetinize göre alışılmış hayz süresi (gün). Hanefî’de genelde 3–10 arasıdır.",
    en: "Your habitual hayd length in days from the last valid cycle (often 3–10 in Hanafi).",
  },
  profileHabitPurity: {
    tr: "Son sahih âdetinize göre alışılmış temizlik (tuhr) süresi (gün). Asgari genellikle 15 gündür.",
    en: "Your habitual purity (tuhr) length in days (minimum is usually 15).",
  },
  dischargeType: {
    tr: "O gün gördüğünüz akıntı / kan rengini seçin. Renk, hayz–istihâze ayrımında yardımcı olur.",
    en: "Select the discharge or blood color you saw that day. Color helps distinguish hayd from istihadha.",
  },
  kursufState: {
    tr: "Kürsüf (bez / ped) ıslak mı kuru mu? Temizlik hükmünde önemli bir işarettir.",
    en: "Is the kursuf (pad/cloth) wet or dry? An important purity indicator.",
  },
  physicalSymptoms: {
    tr: "Varsa fiziksel belirtileri işaretleyin (isteğe bağlı). Takvim kaydınıza eklenir.",
    en: "Optionally mark physical symptoms. They are stored with your calendar log.",
  },
  dailyNotes: {
    tr: "O güne ait serbest not. Yalnızca sizin kaydınızda saklanır.",
    en: "Free-form notes for that day. Stored only in your log.",
  },
  ramadanStart: {
    tr: "Ramazan ayının (veya hesaplamak istediğiniz oruç aralığının) başlangıç tarihi.",
    en: "Start date of Ramadan (or the fasting range you want to check).",
  },
  ramadanEnd: {
    tr: "Ramazan ayının (veya oruç aralığının) bitiş tarihi. Hayz ile örtüşen gün sayısı kaza orucuna eklenir.",
    en: "End date of Ramadan (or the fasting range). Overlap with hayd is added as makeup fasts.",
  },
  knowledgeSearch: {
    tr: "Başlık veya metin içinde ara. Hayz, istihâze, nifas, gusül gibi anahtar kelimeler deneyin.",
    en: "Search titles or body text. Try keywords like hayd, istihadha, nifas, or ghusl.",
  },
  chatQuestion: {
    tr: "Hayz / istihâze hakkında sorunuzu yazın. Yanıtlar uygulama kaynağına dayanır; kesin hüküm için ehil bir âlime danışın.",
    en: "Ask about hayd / istihadha. Answers rely on the app source; consult a qualified scholar for definitive rulings.",
  },
} as const;

export type FieldHintKey = keyof typeof hints;

export function fieldHint(key: FieldHintKey, locale: Locale): string {
  return hints[key][locale === "en" ? "en" : "tr"];
}
