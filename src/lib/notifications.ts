/**
 * Akıllı bildirim motoru — web (PWA / Service Worker) + Capacitor uyumlu.
 *
 * A APPROACHING_CYCLE — tahmini yeni hayza 2 gün kala
 * B BLEED_OVER_10     — 10+ gün / istihâze kritik uyarı
 * C OPEN_BLEED_NUDGE  — başlangıç var, bitiş yok
 * D QADA_REMINDER     — istihâze kaza borcu hatırlatması
 */

export type NotificationScenario =
  | "APPROACHING_CYCLE"
  | "BLEED_OVER_10"
  | "OPEN_BLEED_NUDGE"
  | "QADA_REMINDER"
  | "PURITY_DAY_25"
  | "GHUSL_BEFORE_PRAYER"
  | "MIN_TUHR_COMPLETE";

export type NotificationRoute =
  | "/hesaplama"
  | "/takvim"
  | "/kaza"
  | "/hesap";

export interface AppNotification {
  id: string;
  scenario: NotificationScenario;
  titleTR: string;
  titleEN: string;
  bodyTR: string;
  bodyEN: string;
  dedupeKey: string;
  route: NotificationRoute;
  priority: "low" | "normal" | "high";
  scheduledFor?: string;
}

export interface NotificationEvalInput {
  lastCycleEndIso: string | null;
  averagePurityDays: number;
  openBleedStartIso: string | null;
  latestBleedHours?: number;
  latestHasIstihadha?: boolean;
  latestIsFasid?: boolean;
  qadaPrayersRemaining: number;
  now?: Date;
}

const MS_HOUR = 3_600_000;
const MS_DAY = 24 * MS_HOUR;
const MAX_HAYZ_HOURS = 10 * 24;

const COPY: Record<
  NotificationScenario,
  Omit<AppNotification, "id" | "scenario" | "dedupeKey" | "scheduledFor">
> = {
  APPROACHING_CYCLE: {
    titleTR: "Yaklaşan Döngü Uyarısı",
    titleEN: "Upcoming Cycle Alert",
    bodyTR:
      "Yaklaşan Döngü Uyarısı: Hesaplamalarınıza göre tahmini yeni adet döneminize 2 gün kaldı.",
    bodyEN:
      "Based on your calculations, your estimated next period is in 2 days.",
    route: "/takvim",
    priority: "normal",
  },
  BLEED_OVER_10: {
    titleTR: "Önemli Fıkhi Hatırlatma",
    titleEN: "Important Fiqh Reminder",
    bodyTR:
      "Önemli Fıkhi Hatırlatma: Kanamanız 10 günü aştı. İstihâze hükümleri ve rastlaşma (çakışma) hesabı için lütfen son sahih ay verilerinizi sisteme girin.",
    bodyEN:
      "Your bleeding has exceeded 10 days. Please enter your last valid cycle data for istihadha rulings and overlap calculation.",
    route: "/hesaplama",
    priority: "high",
  },
  OPEN_BLEED_NUDGE: {
    titleTR: "Kanama Takibi",
    titleEN: "Bleeding Tracker",
    bodyTR:
      "Kanama Takibi: Başlangıcını girdiğiniz kanama için henüz bitiş saati girilmedi. Durumu güncellemek ister misiniz?",
    bodyEN:
      "You logged a bleeding start but have not entered an end time yet. Would you like to update it?",
    route: "/hesaplama",
    priority: "normal",
  },
  QADA_REMINDER: {
    titleTR: "Kaza Takibi",
    titleEN: "Makeup Prayer Reminder",
    bodyTR:
      "Kaza Takibi: Geçmiş istihâze döneminizden kalan namaz kaza borçlarınız için takviminizi inceleyebilirsiniz.",
    bodyEN:
      "You can review your calendar for makeup prayers from a past istihadha period.",
    route: "/kaza",
    priority: "low",
  },
  PURITY_DAY_25: {
    titleTR: "25. Gün Temizlik Bildirimi",
    titleEN: "Day 25 Purity Notice",
    bodyTR:
      "25 günlük temizlik süreniz doldu, yeni hayz döngünüz yaklaşıyor olabilir.",
    bodyEN:
      "Your 25-day purity period has passed; a new hayd cycle may be approaching.",
    route: "/takvim",
    priority: "low",
  },
  GHUSL_BEFORE_PRAYER: {
    titleTR: "Gusül / Namaz Uyarısı",
    titleEN: "Ghusl / Prayer Reminder",
    bodyTR:
      "Kanama bitiş saatinize göre öğle vaktinin çıkmasına 40 dk var. Gusül alıp namazınızı eda edebilirsiniz.",
    bodyEN:
      "About 40 minutes remain before Dhuhr ends based on your bleeding end time. You may perform ghusl and pray.",
    route: "/hesaplama",
    priority: "normal",
  },
  MIN_TUHR_COMPLETE: {
    titleTR: "Sahih Temizlik Barajı",
    titleEN: "Minimum Purity Barrier",
    bodyTR:
      "15 günlük asgari temizlik süreniz doldu. Bugünden itibaren gelen kanamalar yeni hayz sayılabilir.",
    bodyEN:
      "Your 15-day minimum purity period is complete. Bleeding from today may count as a new hayd.",
    route: "/takvim",
    priority: "low",
  },
};

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function weekKey(d: Date): string {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / MS_DAY + 1) / 7
  );
  return `${tmp.getUTCFullYear()}-W${week}`;
}

export function buildNotification(
  scenario: NotificationScenario,
  opts?: { dedupeKey?: string; scheduledFor?: string }
): AppNotification {
  return {
    id: `${scenario}_${Date.now()}`,
    scenario,
    dedupeKey: opts?.dedupeKey ?? `${scenario}_${dayKey(new Date())}`,
    scheduledFor: opts?.scheduledFor,
    ...COPY[scenario],
  };
}

/** Fıkhi / döngüsel senaryoları değerlendirir. */
export function evaluateSmartNotifications(
  input: NotificationEvalInput
): AppNotification[] {
  const now = input.now ?? new Date();
  const list: AppNotification[] = [];
  const today = dayKey(now);

  // A — tahmini yeni hayza 2 gün
  if (input.lastCycleEndIso && input.averagePurityDays > 0) {
    const end = new Date(input.lastCycleEndIso);
    const purityDays = Math.max(15, Math.round(input.averagePurityDays));
    const nextHayz = new Date(end.getTime() + purityDays * MS_DAY);
    const daysUntil = Math.ceil((nextHayz.getTime() - now.getTime()) / MS_DAY);
    if (daysUntil === 2) {
      list.push(
        buildNotification("APPROACHING_CYCLE", {
          dedupeKey: `APPROACHING_CYCLE_${dayKey(nextHayz)}`,
          scheduledFor: nextHayz.toISOString(),
        })
      );
    }
  }

  // B — 10+ gün / istihâze
  const openStart = input.openBleedStartIso
    ? new Date(input.openBleedStartIso)
    : null;
  const openHours = openStart
    ? (now.getTime() - openStart.getTime()) / MS_HOUR
    : 0;
  const latestBleedHours = input.latestBleedHours ?? 0;
  const overTen =
    openHours >= MAX_HAYZ_HOURS ||
    latestBleedHours > MAX_HAYZ_HOURS ||
    (Boolean(input.latestHasIstihadha || input.latestIsFasid) &&
      latestBleedHours >= MAX_HAYZ_HOURS);

  if (overTen) {
    list.push(
      buildNotification("BLEED_OVER_10", {
        dedupeKey: `BLEED_OVER_10_${today}`,
      })
    );
  }

  // C — açık kanama nudge (2–10 gün)
  if (openStart && openHours >= 48 && openHours < MAX_HAYZ_HOURS) {
    list.push(
      buildNotification("OPEN_BLEED_NUDGE", {
        dedupeKey: `OPEN_BLEED_NUDGE_${today}`,
      })
    );
  }

  // D — kaza borcu (haftalık)
  if (input.qadaPrayersRemaining > 0) {
    list.push(
      buildNotification("QADA_REMINDER", {
        dedupeKey: `QADA_REMINDER_${weekKey(now)}`,
      })
    );
  }

  // Klasik barajlar (açık kanama yokken)
  if (input.lastCycleEndIso && !openStart) {
    const end = new Date(input.lastCycleEndIso);
    const daysSince = Math.floor((now.getTime() - end.getTime()) / MS_DAY);
    if (daysSince === 15) {
      list.push(
        buildNotification("MIN_TUHR_COMPLETE", {
          dedupeKey: `MIN_TUHR_COMPLETE_${today}`,
        })
      );
    }
    if (daysSince === 25) {
      list.push(
        buildNotification("PURITY_DAY_25", {
          dedupeKey: `PURITY_DAY_25_${today}`,
        })
      );
    }
    const sameDay =
      end.toDateString() === now.toDateString() && now.getHours() < 13;
    if (sameDay) {
      list.push(
        buildNotification("GHUSL_BEFORE_PRAYER", {
          dedupeKey: `GHUSL_BEFORE_PRAYER_${today}`,
        })
      );
    }
  }

  const rank = { high: 0, normal: 1, low: 2 } as const;
  return list.sort((a, b) => rank[a.priority] - rank[b.priority]);
}

/** Geriye dönük uyumluluk. */
export function evaluateUpcomingNotifications(
  lastCycleEndIso: string | null,
  now = new Date()
): AppNotification[] {
  return evaluateSmartNotifications({
    lastCycleEndIso,
    averagePurityDays: 15,
    openBleedStartIso: null,
    qadaPrayersRemaining: 0,
    now,
  });
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

const FIRED_KEY = "hayzapp.notifications.fired";

export function getFiredNotificationKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markNotificationFired(dedupeKey: string) {
  if (typeof window === "undefined") return;
  const keys = new Set(getFiredNotificationKeys());
  keys.add(dedupeKey);
  localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(keys).slice(-60)));
}

export function filterUnfired(
  notifications: AppNotification[]
): AppNotification[] {
  const fired = new Set(getFiredNotificationKeys());
  return notifications.filter((n) => !fired.has(n.dedupeKey));
}

async function showViaCapacitor(
  notification: AppNotification,
  locale: "tr" | "en"
): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.getPlatform() === "web") return false;
    const ln = await import("@capacitor/local-notifications").catch(
      () => null
    );
    if (!ln) return false;
    const title =
      locale === "tr" ? notification.titleTR : notification.titleEN;
    const body = locale === "tr" ? notification.bodyTR : notification.bodyEN;
    const perm = await ln.LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return false;
    const id = Math.abs(
      Array.from(notification.dedupeKey).reduce(
        (h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0,
        0
      )
    );
    await ln.LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: { at: new Date(Date.now() + 800) },
          extra: {
            scenario: notification.scenario,
            route: notification.route,
          },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

export async function showLocalNotification(
  notification: AppNotification,
  locale: "tr" | "en" = "tr"
): Promise<boolean> {
  if (await showViaCapacitor(notification, locale)) {
    markNotificationFired(notification.dedupeKey);
    return true;
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") return false;

  const title =
    locale === "tr" ? notification.titleTR : notification.titleEN;
  const body = locale === "tr" ? notification.bodyTR : notification.bodyEN;

  const reg = await navigator.serviceWorker?.getRegistration();
  if (reg?.showNotification) {
    await reg.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: notification.dedupeKey,
      data: {
        scenario: notification.scenario,
        route: notification.route,
      },
    });
    markNotificationFired(notification.dedupeKey);
    return true;
  }

  new Notification(title, {
    body,
    icon: "/icons/icon-192.png",
    tag: notification.dedupeKey,
  });
  markNotificationFired(notification.dedupeKey);
  return true;
}

export async function showAllDueNotifications(
  notifications: AppNotification[],
  locale: "tr" | "en"
): Promise<number> {
  const due = filterUnfired(notifications);
  let shown = 0;
  for (const n of due.slice(0, 3)) {
    if (await showLocalNotification(n, locale)) shown += 1;
  }
  return shown;
}
