import type { Madhhab } from "@/types/fiqh";

export type HabitChangeResult = {
  changed: boolean;
  previousHayzDays: number;
  newHayzDays: number;
  /** Hanefî’de 10 / Mâlikî’de 15 tavanına oturdu mu */
  atSchoolMax: boolean;
  schoolMaxDays: number;
  previousTuhurDays?: number;
  newTuhurDays?: number;
  purityChanged: boolean;
  messageTR: string;
  messageEN: string;
};

function roundDays(n: number): number {
  return Math.max(0, Math.round(n));
}

/**
 * hayzdosya.pdf — Hayzın Değişmesi / Mâlikî kaideleri.
 *
 * Hanefî:
 * - Sahîh kan (3–10 gün) + sahîh temizlik (≥15) → âdet bir kerede yeni gün sayısına döner.
 * - Tavan 10; 10’a oturunca sabitlenmiş sayılır.
 * - Fâsid kan/temizlik âdeti değiştirmez.
 *
 * Mâlikî / taklit:
 * - Sahîh kısa kanama (≤15) + ≥15 temizlik → âdet o gün sayısına döner (tavan 15).
 * - Uzun/istimrâr tarzı: «en çok hayz + 3» (≤15); otomatik her ay +3 değil,
 *   kabul edilen hayz günü bir sonraki aya esas olur.
 */
export function evaluateHabitChange(input: {
  madhhab: Madhhab;
  previousHabitHayzDays: number;
  previousHabitTuhurDays: number;
  /** Bu döngünün toplam kanama günü (saat/24). */
  bleedingDays: number;
  /** Bu döngünün temizlik günü. */
  purityDays: number;
  /** Döngü sahih ay mı? */
  isSahihMonth: boolean;
  /** Motorun hayz kabul ettiği gün (MIXED’te rastlama sonrası). */
  assignedHayzDays?: number;
  /** Mâlikî “en çok gün” (profil); yoksa previousHabit kullanılır. */
  malikiMaxDays?: number;
  isContinuousBleeding?: boolean;
  isFirstPeriod?: boolean;
}): HabitChangeResult {
  const prevH = Math.max(1, roundDays(input.previousHabitHayzDays));
  const prevT = Math.max(15, roundDays(input.previousHabitTuhurDays));
  const bleed = input.bleedingDays;
  const purity = input.purityDays;
  const isHanafi =
    input.madhhab === "HANAFI" || input.madhhab === "HANAFI_FOLLOWING_MALIKI";
  const isMalikiFamily =
    input.madhhab === "MALIKI" || input.madhhab === "HANAFI_FOLLOWING_MALIKI";

  const schoolMax = isHanafi && input.madhhab === "HANAFI" ? 10 : isMalikiFamily ? 15 : 10;

  // --- Hanefî (saf) ---
  if (input.madhhab === "HANAFI") {
    if (!input.isSahihMonth) {
      return unchanged(
        prevH,
        prevT,
        10,
        `Fâsid kan veya fâsid temizlik âdeti değiştirmez. Önceki sahih âdetiniz ${prevH} gün hayz / ${prevT} gün temizlik olarak kaldı.`,
        `Invalid blood/purity does not change the habit. Your last valid habit stays ${prevH}d hayd / ${prevT}d purity.`
      );
    }
    const newH = Math.min(10, Math.max(3, roundDays(bleed)));
    const newT = Math.max(15, roundDays(purity));
    const changed = newH !== prevH || newT !== prevT;
    const atMax = newH >= 10;
    return {
      changed,
      previousHayzDays: prevH,
      newHayzDays: newH,
      atSchoolMax: atMax,
      schoolMaxDays: 10,
      previousTuhurDays: prevT,
      newTuhurDays: newT,
      purityChanged: newT !== prevT,
      messageTR: changed
        ? atMax
          ? `Âdetiniz değişti: hayz ${prevH} günden ${newH} güne yükseldi ve Hanefî azami sınır olan 10 günde sabitlendi. Temizlik: ${prevT} → ${newT} gün.`
          : `Âdetiniz değişti: hayz ${prevH} günden ${newH} güne güncellendi (Hanefî azami 10’a kadar başka sahih döngüyle yine değişebilir). Temizlik: ${prevT} → ${newT} gün.`
        : `Âdetiniz aynı kaldı: ${newH} gün hayz, ${newT} gün temizlik.${atMax ? " (Azami 10 güne ulaşılmış.)" : ""}`,
      messageEN: changed
        ? atMax
          ? `Habit changed: hayd ${prevH}→${newH} days and is capped at the Hanafi maximum of 10. Purity: ${prevT}→${newT}.`
          : `Habit changed: hayd ${prevH}→${newH} days (may change again with another valid cycle up to 10). Purity: ${prevT}→${newT}.`
        : `Habit unchanged: ${newH}d hayd, ${newT}d purity.${atMax ? " (Already at max 10.)" : ""}`,
    };
  }

  // --- Mâlikî / Hanefî–Mâlikî taklidi ---
  const enCok = Math.max(prevH, roundDays(input.malikiMaxDays ?? prevH));
  const longBleed = bleed > 15 || !!input.isContinuousBleeding;

  if (input.isFirstPeriod && (longBleed || bleed > 15)) {
    // Kız istimrâr: 15 hayz / 15 istihâza
    const newH = 15;
    return {
      changed: newH !== prevH,
      previousHayzDays: prevH,
      newHayzDays: newH,
      atSchoolMax: true,
      schoolMaxDays: 15,
      previousTuhurDays: prevT,
      newTuhurDays: 15,
      purityChanged: true,
      messageTR: `Mâlikî (ilk / istimrâr): 15 gün hayz, 15 gün istihâza kabul edilir. Âdet hayz günü ${prevH} → 15 (azami).`,
      messageEN: `Maliki (first/istimrar): 15 days hayd + 15 istihadha. Habit hayd ${prevH}→15 (max).`,
    };
  }

  if (input.isSahihMonth && bleed <= 15 && purity >= 15) {
    const newH = Math.min(15, Math.max(1, roundDays(bleed)));
    const newT = Math.max(15, roundDays(purity));
    const changed = newH !== prevH || newT !== prevT;
    const atMax = newH >= 15;
    return {
      changed,
      previousHayzDays: prevH,
      newHayzDays: newH,
      atSchoolMax: atMax,
      schoolMaxDays: 15,
      previousTuhurDays: prevT,
      newTuhurDays: newT,
      purityChanged: newT !== prevT,
      messageTR: changed
        ? atMax
          ? `Mâlikî âdetiniz değişti: hayz ${prevH} → ${newH} gün ve 15 günde sabitlendi. Temizlik: ${prevT} → ${newT} gün.`
          : `Mâlikî âdetiniz değişti: hayz ${prevH} → ${newH} gün (azami 15). Temizlik: ${prevT} → ${newT} gün. Not: sonraki uzun kanamalarda «en çok + 3» kaidesi ${newH} üzerinden işler.`
        : `Mâlikî âdetiniz aynı: ${newH} gün hayz / ${newT} gün temizlik.`,
      messageEN: changed
        ? `Maliki habit changed: hayd ${prevH}→${newH} (max 15). Purity ${prevT}→${newT}.`
        : `Maliki habit unchanged: ${newH}d / ${newT}d.`,
    };
  }

  // Uzun kanama / istimrâr (kadın): en çoğunun 3 fazlası, ≤15
  if (longBleed || bleed > enCok) {
    const allowed = Math.min(15, enCok + 3);
    const assigned = Math.min(
      roundDays(input.assignedHayzDays ?? allowed),
      allowed,
      15
    );
    const atMax = assigned >= 15;
    const changed = assigned !== prevH;
    return {
      changed,
      previousHayzDays: prevH,
      newHayzDays: assigned,
      atSchoolMax: atMax,
      schoolMaxDays: 15,
      previousTuhurDays: prevT,
      newTuhurDays: prevT,
      purityChanged: false,
      messageTR: changed
        ? atMax
          ? `Mâlikî kaide: en çok hayz ${enCok} gün + 3 = ${allowed} → azami 15’e sabitlendi. Bu ay kabul edilen hayz ${assigned} gün; fazlası istihâzadır. (Otomatik her ay +3 değil; şartlar PDF kaidelerine göredir.)`
          : `Mâlikî kaide: görülen en çok hayz ${enCok} gün; bu ay en çok + 3 = ${allowed} güne kadar hayz kabul edilir (sizin için ${assigned} gün). Önceki âdet ${prevH} → ${assigned}. 15’e varana kadar sonraki aylarda yine +3 ile artabilir.`
        : `Mâlikî: bu ay kabul edilen hayz ${assigned} gün (en çok ${enCok} + 3 kuralı, tavan 15). Âdet günü değişmedi.`,
      messageEN: changed
        ? `Maliki: max-seen ${enCok}d + 3 → up to ${allowed} (cap 15). Accepted hayd this month: ${assigned}d (${prevH}→${assigned}).`
        : `Maliki: accepted hayd ${assigned}d under max+3 rule (cap 15).`,
    };
  }

  return unchanged(
    prevH,
    prevT,
    schoolMax,
    `Âdet değerlendirmesi: hayz ${prevH} gün, temizlik ${prevT} gün olarak korundu.`,
    `Habit kept at ${prevH}d hayd / ${prevT}d purity.`
  );
}

function unchanged(
  prevH: number,
  prevT: number,
  schoolMax: number,
  messageTR: string,
  messageEN: string
): HabitChangeResult {
  return {
    changed: false,
    previousHayzDays: prevH,
    newHayzDays: prevH,
    atSchoolMax: prevH >= schoolMax,
    schoolMaxDays: schoolMax,
    previousTuhurDays: prevT,
    newTuhurDays: prevT,
    purityChanged: false,
    messageTR,
    messageEN,
  };
}
