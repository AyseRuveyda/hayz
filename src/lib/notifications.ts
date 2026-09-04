export type NotificationScenario =
  | "PURITY_DAY_25"
  | "GHUSL_BEFORE_PRAYER"
  | "MIN_TUHR_COMPLETE";

export interface AppNotification {
  id: string;
  scenario: NotificationScenario;
  titleTR: string;
  titleEN: string;
  bodyTR: string;
  bodyEN: string;
  scheduledFor?: string;
}

const SCENARIOS: Record<
  NotificationScenario,
  Omit<AppNotification, "id" | "scenario" | "scheduledFor">
> = {
  PURITY_DAY_25: {
    titleTR: "25. Gün Temizlik Bildirimi",
    titleEN: "Day 25 Purity Notice",
    bodyTR:
      "25 günlük temizlik süreniz doldu, yeni hayz döngünüz yaklaşıyor olabilir.",
    bodyEN:
      "Your 25-day purity period has passed; a new hayd cycle may be approaching.",
  },
  GHUSL_BEFORE_PRAYER: {
    titleTR: "Gusül / Namaz Uyarısı",
    titleEN: "Ghusl / Prayer Reminder",
    bodyTR:
      "Kanama bitiş saatinize göre öğle vaktinin çıkmasına 40 dk var. Gusül alıp namazınızı eda edebilirsiniz.",
    bodyEN:
      "About 40 minutes remain before Dhuhr ends based on your bleeding end time. You may perform ghusl and pray.",
  },
  MIN_TUHR_COMPLETE: {
    titleTR: "Sahih Temizlik Barajı",
    titleEN: "Minimum Purity Barrier",
    bodyTR:
      "15 günlük asgari temizlik süreniz doldu. Bugünden itibaren gelen kanamalar yeni hayz sayılabilir.",
    bodyEN:
      "Your 15-day minimum purity period is complete. Bleeding from today may count as a new hayd.",
  },
};

export function buildNotification(
  scenario: NotificationScenario,
  scheduledFor?: string
): AppNotification {
  return {
    id: `${scenario}_${Date.now()}`,
    scenario,
    scheduledFor,
    ...SCENARIOS[scenario],
  };
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

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export async function showLocalNotification(
  notification: AppNotification,
  locale: "tr" | "en" = "tr"
): Promise<boolean> {
  const permission = await requestNotificationPermission();
  if (permission !== "granted") return false;

  const title = locale === "tr" ? notification.titleTR : notification.titleEN;
  const body = locale === "tr" ? notification.bodyTR : notification.bodyEN;

  const reg = await navigator.serviceWorker?.getRegistration();
  if (reg?.showNotification) {
    await reg.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: notification.scenario,
      data: { scenario: notification.scenario },
    });
    return true;
  }

  new Notification(title, { body, icon: "/icons/icon-192.png" });
  return true;
}

/**
 * Döngü bitişine göre yaklaşan bildirim senaryolarını üretir.
 * lastCycleEndIso: son hayz/nifas bitiş tarihi
 */
export function evaluateUpcomingNotifications(
  lastCycleEndIso: string | null,
  now = new Date()
): AppNotification[] {
  if (!lastCycleEndIso) return [];
  const end = new Date(lastCycleEndIso);
  const daysSince = Math.floor(
    (now.getTime() - end.getTime()) / (24 * 60 * 60 * 1000)
  );
  const list: AppNotification[] = [];

  if (daysSince === 15) {
    list.push(buildNotification("MIN_TUHR_COMPLETE"));
  }
  if (daysSince === 25) {
    list.push(buildNotification("PURITY_DAY_25"));
  }

  // Gusül uyarısı: bitiş bugün ve öğleden önceyse örnek senaryo
  const sameDay =
    end.toDateString() === now.toDateString() && now.getHours() < 13;
  if (sameDay) {
    list.push(buildNotification("GHUSL_BEFORE_PRAYER"));
  }

  return list;
}
