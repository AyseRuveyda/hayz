"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import {
  getGuestCycles,
  getGuestProfile,
  getGuestQada,
  getOpenBleedStart,
} from "@/lib/local-store";
import {
  evaluateSmartNotifications,
  filterUnfired,
  registerServiceWorker,
  showAllDueNotifications,
} from "@/lib/notifications";

export function NotificationBootstrap() {
  const { locale } = useI18n();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      await registerServiceWorker();

      const profile = getGuestProfile();
      if (!profile.notificationsEnabled) return;

      const cycles = getGuestCycles();
      const sorted = [...cycles].sort((a, b) =>
        b.endDate.localeCompare(a.endDate)
      );
      const latest = sorted[0] ?? null;
      const openBleed = getOpenBleedStart();
      const qadaPrayers = getGuestQada()
        .filter((q) => q.kind === "PRAYER")
        .reduce((s, q) => s + Math.max(0, q.remaining), 0);

      let latestBleedHours = 0;
      if (latest) {
        const start = new Date(latest.startDate).getTime();
        const end = new Date(latest.endDate).getTime();
        latestBleedHours = Math.max(0, (end - start) / 3_600_000);
      }

      const due = filterUnfired(
        evaluateSmartNotifications({
          lastCycleEndIso: latest?.endDate ?? null,
          averagePurityDays:
            profile.habitPurityDays || latest?.purityDays || 15,
          openBleedStartIso: openBleed,
          latestBleedHours,
          latestHasIstihadha: (latest?.istihadhaDays ?? 0) > 0,
          latestIsFasid: latest?.cycleStatus === "FASID",
          qadaPrayersRemaining: qadaPrayers,
        })
      );

      if (due.length === 0) return;
      await showAllDueNotifications(due, locale);
    })();
  }, [locale]);

  return null;
}
