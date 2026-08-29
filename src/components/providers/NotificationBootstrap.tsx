"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { getGuestCycles } from "@/lib/local-store";
import {
  evaluateUpcomingNotifications,
  registerServiceWorker,
  showLocalNotification,
} from "@/lib/notifications";

export function NotificationBootstrap() {
  const { locale } = useI18n();

  useEffect(() => {
    void registerServiceWorker();
    const cycles = getGuestCycles();
    const last = cycles[0]?.endDate ?? null;
    const upcoming = evaluateUpcomingNotifications(last);
    const key = "hayzapp.notified.today";
    const today = new Date().toDateString();
    if (sessionStorage.getItem(key) === today) return;
    if (upcoming.length > 0) {
      void showLocalNotification(upcoming[0], locale).then((ok) => {
        if (ok) sessionStorage.setItem(key, today);
      });
    }
  }, [locale]);

  return null;
}
