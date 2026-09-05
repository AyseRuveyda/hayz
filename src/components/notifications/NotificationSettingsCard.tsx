"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { getGuestProfile, saveGuestProfile } from "@/lib/local-store";
import {
  getNotificationPermission,
  registerServiceWorker,
  requestNotificationPermission,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
};

export function NotificationSettingsCard({ className, compact }: Props) {
  const { locale } = useI18n();
  const [enabled, setEnabled] = useState(true);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setEnabled(getGuestProfile().notificationsEnabled);
    setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function enableNotifications() {
    setBusy(true);
    setMessage(null);
    try {
      await registerServiceWorker();
      const perm = await requestNotificationPermission();
      setPermission(perm);
      if (perm === "denied") {
        setMessage(
          locale === "tr"
            ? "Tarayıcı bildirimi engellenmiş. Site ayarlarından izin vermeniz gerekir."
            : "Browser notifications are blocked. Allow them in site settings."
        );
        return;
      }
      if (perm === "unsupported") {
        setMessage(
          locale === "tr"
            ? "Bu ortam web bildirimlerini desteklemiyor; mobil uygulamada Capacitor kullanılabilir."
            : "This environment does not support web notifications; Capacitor can be used in the mobile app."
        );
      }
      const profile = getGuestProfile();
      saveGuestProfile({ ...profile, notificationsEnabled: true });
      setEnabled(true);
      setMessage(
        locale === "tr"
          ? "Bildirimler etkinleştirildi. Yaklaşan hayz, istihâze ve kaza hatırlatmaları burada çalışır."
          : "Notifications enabled. Upcoming hayd, istihadha, and qada reminders will run here."
      );
    } finally {
      setBusy(false);
    }
  }

  function disableNotifications() {
    const profile = getGuestProfile();
    saveGuestProfile({ ...profile, notificationsEnabled: false });
    setEnabled(false);
    setMessage(
      locale === "tr"
        ? "Uygulama bildirimleri kapatıldı."
        : "In-app notifications turned off."
    );
  }

  const statusLabel =
    permission === "granted"
      ? locale === "tr"
        ? "İzin verildi"
        : "Permission granted"
      : permission === "denied"
        ? locale === "tr"
          ? "İzin engelli"
          : "Permission blocked"
        : permission === "unsupported"
          ? locale === "tr"
            ? "Desteklenmiyor"
            : "Unsupported"
          : locale === "tr"
            ? "İzin bekleniyor"
            : "Permission pending";

  return (
    <div
      className={cn("card-surface space-y-3 p-5", compact && "p-4", className)}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#F42566] dark:bg-rose-950/40">
          {enabled && permission === "granted" ? (
            <BellRing className="h-5 w-5" />
          ) : enabled ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {locale === "tr" ? "Akıllı Bildirimler" : "Smart Notifications"}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {locale === "tr"
              ? "Yaklaşan hayz, 10+ gün istihâze, açık kanama ve kaza borçları için hatırlatmalar."
              : "Reminders for upcoming hayd, 10+ day istihadha, open bleeds, and makeup prayers."}
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">
            {statusLabel}
            {" · "}
            {enabled
              ? locale === "tr"
                ? "Uygulama: açık"
                : "App: on"
              : locale === "tr"
                ? "Uygulama: kapalı"
                : "App: off"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!enabled || permission !== "granted" ? (
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={() => void enableNotifications()}
          >
            {busy
              ? locale === "tr"
                ? "Açılıyor…"
                : "Enabling…"
              : locale === "tr"
                ? "Bildirimleri Etkinleştir"
                : "Enable Notifications"}
          </button>
        ) : null}
        {enabled ? (
          <button
            type="button"
            className="btn-ghost"
            onClick={disableNotifications}
          >
            {locale === "tr" ? "Kapat" : "Turn off"}
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-xl bg-rose-50/80 px-3 py-2 text-xs leading-relaxed text-rose-900 dark:bg-rose-950/30 dark:text-rose-100">
          {message}
        </p>
      ) : null}
    </div>
  );
}
