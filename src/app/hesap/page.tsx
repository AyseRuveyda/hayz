"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  getGuestProfile,
  saveGuestProfile,
  syncGuestDataToCloud,
} from "@/lib/data-sync";
import { useI18n } from "@/lib/i18n";
import type { UserProfile } from "@/types/cycle";

export default function HesapPage() {
  const { locale, setLocale } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(getGuestProfile());

  useEffect(() => {
    setProfile(getGuestProfile());
    const sb = getSupabase();
    if (!sb) return;
    void sb.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function onAuth(e: FormEvent, mode: "signin" | "signup") {
    e.preventDefault();
    setMessage(null);
    const sb = getSupabase();
    if (!sb) {
      setMessage(
        locale === "tr"
          ? "Supabase yapılandırılmamış. Misafir modunda localStorage kullanılıyor. .env.local dosyasına NEXT_PUBLIC_SUPABASE_URL ve ANON_KEY ekleyin."
          : "Supabase not configured. Guest mode uses localStorage. Add NEXT_PUBLIC_SUPABASE_URL and ANON_KEY to .env.local."
      );
      return;
    }
    const result =
      mode === "signin"
        ? await sb.auth.signInWithPassword({ email, password })
        : await sb.auth.signUp({ email, password });
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setUserEmail(result.data.user?.email ?? email);
    await syncGuestDataToCloud();
    setMessage(
      locale === "tr"
        ? "Giriş başarılı. Yerel veriler senkronize edildi."
        : "Signed in. Local data synced."
    );
  }

  async function signOut() {
    const sb = getSupabase();
    await sb?.auth.signOut();
    setUserEmail(null);
    setMessage(locale === "tr" ? "Çıkış yapıldı." : "Signed out.");
  }

  function saveProfile() {
    saveGuestProfile({
      ...profile,
      locale,
      updatedAt: new Date().toISOString(),
    });
    setLocale(profile.locale);
    setMessage(locale === "tr" ? "Profil kaydedildi." : "Profile saved.");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {locale === "tr" ? "Hesap & Senkronizasyon" : "Account & Sync"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isSupabaseConfigured
            ? locale === "tr"
              ? "Supabase bağlı. Giriş yapınca veriler buluta senkronize olur."
              : "Supabase connected. Sign in to sync to the cloud."
            : locale === "tr"
              ? "Misafir modu: veriler bu cihazda localStorage’da saklanır."
              : "Guest mode: data stays in localStorage on this device."}
        </p>
      </div>

      <div className="card-surface space-y-3 p-5">
        <p className="text-sm font-semibold">
          {userEmail
            ? `${locale === "tr" ? "Oturum" : "Session"}: ${userEmail}`
            : locale === "tr"
              ? "Misafir oturumu"
              : "Guest session"}
        </p>
        {!userEmail ? (
          <form
            className="space-y-3"
            onSubmit={(e) => void onAuth(e, "signin")}
          >
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="password"
              placeholder={locale === "tr" ? "Şifre" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn-primary touch-target">
                {locale === "tr" ? "Giriş yap" : "Sign in"}
              </button>
              <button
                type="button"
                className="btn-ghost touch-target"
                onClick={(e) => {
                  e.preventDefault();
                  void onAuth(e as unknown as FormEvent, "signup");
                }}
              >
                {locale === "tr" ? "Kayıt ol" : "Sign up"}
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn-ghost" onClick={() => void signOut()}>
            {locale === "tr" ? "Çıkış yap" : "Sign out"}
          </button>
        )}
      </div>

      <div className="card-surface space-y-3 p-5">
        <p className="text-sm font-semibold">
          {locale === "tr" ? "Profil tercihleri" : "Profile preferences"}
        </p>
        <label className="label-field">
          {locale === "tr" ? "Görünen ad" : "Display name"}
        </label>
        <input
          className="input-field"
          value={profile.displayName ?? ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, displayName: e.target.value }))
          }
        />
        <label className="label-field">
          {locale === "tr" ? "Sahih hayz (gün)" : "Habitual hayd (days)"}
        </label>
        <input
          type="number"
          min={3}
          max={10}
          className="input-field"
          value={profile.habitHayzDays}
          onChange={(e) =>
            setProfile((p) => ({
              ...p,
              habitHayzDays: Number(e.target.value),
            }))
          }
        />
        <label className="label-field">
          {locale === "tr" ? "Sahih temizlik (gün)" : "Habitual purity (days)"}
        </label>
        <input
          type="number"
          min={15}
          className="input-field"
          value={profile.habitPurityDays}
          onChange={(e) =>
            setProfile((p) => ({
              ...p,
              habitPurityDays: Number(e.target.value),
            }))
          }
        />
        <button type="button" className="btn-primary" onClick={saveProfile}>
          {locale === "tr" ? "Kaydet" : "Save"}
        </button>
      </div>

      {message && (
        <p className="rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
          {message}
        </p>
      )}
    </div>
  );
}
