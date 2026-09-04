/** hayzdosya.pdf — «Hayz ile ilgili Kelimeler» sözlüğü */

export type GlossaryTerm = {
  id: string;
  termTR: string;
  termEN: string;
  definitionTR: string;
  definitionEN: string;
};

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: "hayz",
    termTR: "Hayz",
    termEN: "Hayd",
    definitionTR:
      "Akmak demektir. 8 yaşını doldurmuş sıhhatli bir kızın veya âdet zamanı son dakikasından tam temizlik geçmiş olan kadının önünden çıkan ve en az 3 gün devam eden kana denir. Buna Sahîh kan da denir. (Aybaşı / regl: 9 yaşını doldurmuş ve sağlığı yerinde bir kızın veya âdet sonundan 15 gün geçmiş kadının rahminden kan çıkması hâli.)",
    definitionEN:
      "Literally “to flow.” Blood lasting at least 3 days from a healthy girl past age 8, or a woman after a full purity from the end of her habit. Also called valid blood (sahih).",
  },
  {
    id: "gun",
    termTR: "Gün",
    termEN: "Day",
    definitionTR: "Bir gün, tam 24 mutedil (vasatî) saat demektir.",
    definitionEN: "One day means a full 24 moderate (average) hours.",
  },
  {
    id: "ay",
    termTR: "Ay",
    termEN: "Month (cycle)",
    definitionTR:
      "Bir ay demek; bir hayz başından, ikinci hayz başına kadar geçen zaman demektir.",
    definitionEN:
      "A month means the time from the start of one hayd to the start of the next.",
  },
  {
    id: "adet-zamani",
    termTR: "Âdet zamanı",
    termEN: "Habit period",
    definitionTR:
      "Hayz kanı görüldüğü andan kesildiği güne kadar olan kanlı günlerin sayısıdır (hayızlı / âdetli günler). Bu zamanın en azı 3, en fazlası 10 gündür (Hanefî).",
    definitionEN:
      "The count of bleeding days from first sight to cessation. In Hanafi: min 3, max 10 days.",
  },
  {
    id: "hayz-kani",
    termTR: "Hayz kanı",
    termEN: "Hayd blood",
    definitionTR: "Âdet zamanı kadınların önünden çıkan kana hayz kanı denir.",
    definitionEN: "Blood that appears from the woman during her habit period.",
  },
  {
    id: "baliga",
    termTR: "Bâliğa",
    termEN: "Baligha (mature)",
    definitionTR:
      "Bir kız hayz görmeye başlayınca bülûğ (ergenlik) çağına girer; bâliğa (kadın) olur ve dinin emir ve yasaklarından sorumlu olur.",
    definitionEN:
      "When a girl begins hayd she reaches puberty (baligha) and becomes religiously responsible.",
  },
  {
    id: "muhayyire",
    termTR: "Muhayyire (Dâlle)",
    termEN: "Muhayyira (forgetful of habit)",
    definitionTR: "Âdet zamanını unutan kadına Muhayyire veya Dâlle denir.",
    definitionEN: "A woman who has forgotten her habit timing.",
  },
  {
    id: "sahih-kan",
    termTR: "Sahîh kan",
    termEN: "Valid blood",
    definitionTR:
      "9 yaşına basmış sıhhatli kızın veya tam temizlik geçmiş kadının önünden çıkan ve en az 3 gün (72 vasatî saat) devam eden kandır. Beyazdan başka her renk ve bulanık akıntı hayz kanı sayılır.",
    definitionEN:
      "Valid hayd blood lasting at least 72 hours. Any color other than white (including cloudy) counts as blood.",
  },
  {
    id: "sahih-temizlik",
    termTR: "Sahîh temizlik",
    termEN: "Valid purity",
    definitionTR:
      "Âdetten sonra başlayan 15 veya daha fazla gün içinde hiç kan görülmezse ve öncesi ile sonrası hayz günleri olursa, bu temiz günlere sahîh temizlik denir.",
    definitionEN:
      "15+ clean days after habit with no bleeding, bordered by hayd days before and after.",
  },
  {
    id: "fasid-temizlik",
    termTR: "Fâsid temizlik (Hükmî temizlik)",
    termEN: "Invalid / legal purity",
    definitionTR:
      "15 veya daha fazla “temiz” gün içinde fâsid kan (istihâza) bulunursa bütününe hükmî / fâsid temizlik denir. Hayz müddeti içinde kansız günlere de fâsid temizlik denir.",
    definitionEN:
      "When istihadha appears inside an otherwise long clean stretch, or bloodless days fall inside hayd — counted as invalid/legal purity.",
  },
  {
    id: "tam-temizlik",
    termTR: "Tam temizlik",
    termEN: "Full purity",
    definitionTR:
      "Sahîh temizliğe ve hükmî temizliğe tam temizlik denir. Tam temizlikten (en az 15 gün) önce ve sonra görülüp 3 vasatî gün süren kanlar iki ayrı hayz olur.",
    definitionEN:
      "Both valid and legal purity are “full purity.” Bleedings of 3+ days separated by full purity are two separate hayd periods.",
  },
  {
    id: "istihaza",
    termTR: "İstihâza",
    termEN: "Istihadha",
    definitionTR:
      "3 günden az veya âdetten çok olup hayz olmayan kanlı günler. Buna özür kanı da denir.",
    definitionEN:
      "Bleeding that is not hayd (shorter than 3 days or beyond the habit). Also called excuse bleeding.",
  },
  {
    id: "istimrar",
    termTR: "İstimrâr",
    termEN: "Istimrar (continuous flow)",
    definitionTR: "Kanın kesilmeden sürekli akmasıdır.",
    definitionEN: "Continuous uninterrupted bleeding.",
  },
  {
    id: "nifas",
    termTR: "Nifâs",
    termEN: "Nifas (postpartum)",
    definitionTR: "Lohusalık hâli; doğumdan sonra gelen kana nifâs (lohusa kanı) denir.",
    definitionEN: "Postpartum bleeding after childbirth.",
  },
  {
    id: "ayise",
    termTR: "Âyise",
    termEN: "Ayisa (past menopause age)",
    definitionTR:
      "Hayızdan kesilmiş yaşlı kadın. Âyise yaşı hicrî: Hanbelî 50, Hanefî 55, Şâfiî 60, Mâlikî 70. Bu yaşlardan sonra gelen kan hayz olmaz, istihâza olur.",
    definitionEN:
      "Woman past the school’s menopause age (Hijri): Hanbali 50, Hanafi 55, Shafi’i 60, Maliki 70. Later bleeding is istihadha, not hayd.",
  },
  {
    id: "menopoz",
    termTR: "Menopoz",
    termEN: "Menopause",
    definitionTR:
      "Yumurtalık aktivitesinin azalması sonucunda âdetlerin tamamen kesilmesi durumudur.",
    definitionEN: "Permanent cessation of menses due to declining ovarian activity.",
  },
  {
    id: "kursuf",
    termTR: "Kürsüf (Ped / kadın bağı)",
    termEN: "Kursuf (pad)",
    definitionTR:
      "Kızların yalnız hayz zamanında; evli veya dul kadınların ise her zaman edep yerine koydukları bez veya saf nebâtî pamuk. Sun’î pamuk sıhhate zararlıdır; tamamını içeri sokmak mekruhtur.",
    definitionEN:
      "A pad/cotton placed at the private part—recommended with scent. Synthetic cotton is harmful; inserting it fully is disliked.",
  },
];
