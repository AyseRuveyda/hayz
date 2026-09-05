"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  getGuestProfile,
  saveGuestProfile,
  syncGuestDataToCloud,
} from "@/lib/data-sync";
import { useI18n } from "@/lib/i18n";
import { NotificationSettingsCard } from "@/components/notifications/NotificationSettingsCard";
import { FieldHint, FieldLabel } from "@/components/ui/FieldHint";
import { fieldHint } from "@/lib/field-hints";
import type { UserProfile } from "@/types/cycle";
import type { Madhhab } from "@/types/fiqh";

const PROFILE_MADHHABS: Madhhab[] = [
  "HANAFI",
  "MALIKI",
  "HANAFI_FOLLOWING_MALIKI",
];

function normalizeMadhhab(value: string | undefined): Madhhab {
  if (value === "MALIKI" || value === "HANAFI_FOLLOWING_MALIKI") return value;
  return "HANAFI";
}

function madhhabLabel(value: Madhhab, locale: "tr" | "en"): string {
  if (value === "MALIKI") return "Maliki";
  if (value === "HANAFI_FOLLOWING_MALIKI") {
    return locale === "tr"
      ? "Hanefi (Maliki taklidi)"
      : "Hanafi (following Maliki)";
  }
  return locale === "tr" ? "Hanefi" : "Hanafi";
}

export default function HesapPage() {
  const { locale, setLocale } = useI18n();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const p = getGuestProfile();
    return {
      ...p,
      madhhab: normalizeMadhhab(p.madhhab),
      malikiMaxDays: p.malikiMaxDays ?? 15,
    };
  });

  const malikiMaxEnabled = useMemo(
    () =>
      profile.madhhab === "MALIKI" ||
      profile.madhhab === "HANAFI_FOLLOWING_MALIKI",
    [profile.madhhab]
  );

  useEffect(() => {
    const p = getGuestProfile();
    setProfile({
      ...p,
      madhhab: normalizeMadhhab(p.madhhab),
      malikiMaxDays: p.malikiMaxDays ?? 15,
    });
    if (p.email) setUserEmail(p.email);
    const sb = getSupabase();
    if (!sb) return;
    void sb.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  async function onAuthSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    const mail = email.trim().toLowerCase();
    if (!mail || !password) {
      setMessage(
        locale === "tr"
          ? "E-posta ve şifre gerekli."
          : "Email and password are required."
      );
      return;
    }
    if (password.length < 6) {
      setMessage(
        locale === "tr"
          ? "Şifre en az 6 karakter olmalı."
          : "Password must be at least 6 characters."
      );
      return;
    }
    if (authMode === "signup" && password !== password2) {
      setMessage(
        locale === "tr"
          ? "Şifreler eşleşmiyor."
          : "Passwords do not match."
      );
      return;
    }

    setBusy(true);
    try {
      const sb = getSupabase();

      // Misafir / Supabase yok: yerel kayıt
      if (!sb) {
        if (authMode === "signup") {
          const next: UserProfile = {
            ...getGuestProfile(),
            ...profile,
            email: mail,
            displayName:
              displayNameDraft.trim() ||
              profile.displayName ||
              mail.split("@")[0] ||
              "Kullanıcı",
            updatedAt: new Date().toISOString(),
          };
          saveGuestProfile(next);
          setProfile(next);
          setUserEmail(mail);
          setMessage(
            locale === "tr"
              ? "Kayıt oluşturuldu (misafir modu). Bilgileriniz bu cihazda saklandı."
              : "Account created (guest mode). Your data is stored on this device."
          );
        } else {
          const p = getGuestProfile();
          if (p.email && p.email.toLowerCase() === mail) {
            setUserEmail(mail);
            setMessage(
              locale === "tr"
                ? "Misafir oturumu açıldı."
                : "Guest session started."
            );
          } else {
            setMessage(
              locale === "tr"
                ? "Supabase yapılandırılmamış. Önce «Kayıt ol» ile bu cihazda hesap oluşturun veya .env.local’e Supabase anahtarlarını ekleyin."
                : "Supabase is not configured. Use Sign up first for a local account, or add Supabase keys to .env.local."
            );
          }
        }
        return;
      }

      const result =
        authMode === "signin"
          ? await sb.auth.signInWithPassword({ email: mail, password })
          : await sb.auth.signUp({
              email: mail,
              password,
              options: {
                data: {
                  display_name: displayNameDraft.trim() || undefined,
                },
              },
            });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      const signedEmail = result.data.user?.email ?? mail;
      setUserEmail(signedEmail);

      const next: UserProfile = {
        ...getGuestProfile(),
        ...profile,
        email: signedEmail,
        displayName:
          displayNameDraft.trim() ||
          profile.displayName ||
          signedEmail.split("@")[0] ||
          null,
        updatedAt: new Date().toISOString(),
      };
      saveGuestProfile(next);
      setProfile(next);
      await syncGuestDataToCloud();

      setMessage(
        authMode === "signup"
          ? locale === "tr"
            ? "Kayıt başarılı. E-posta onayı gerekebilir; ardından giriş yapabilirsiniz."
            : "Sign up successful. Email confirmation may be required before signing in."
          : locale === "tr"
            ? "Giriş başarılı. Yerel veriler senkronize edildi."
            : "Signed in. Local data synced."
      );
      setAuthMode("signin");
      setPassword("");
      setPassword2("");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    const sb = getSupabase();
    await sb?.auth.signOut();
    setUserEmail(null);
    setMessage(locale === "tr" ? "Çıkış yapıldı." : "Signed out.");
  }

  function saveProfile() {
    const madhhab = normalizeMadhhab(profile.madhhab);
    const next: UserProfile = {
      ...profile,
      madhhab,
      malikiMaxDays:
        madhhab === "MALIKI" || madhhab === "HANAFI_FOLLOWING_MALIKI"
          ? Math.max(1, Number(profile.malikiMaxDays) || 15)
          : profile.malikiMaxDays ?? 15,
      locale,
      updatedAt: new Date().toISOString(),
    };
    saveGuestProfile(next);
    setProfile(next);
    setLocale(next.locale);
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
          <div className="space-y-3">
            <div
              className="grid grid-cols-2 gap-1 rounded-xl border border-rose-100/70 bg-rose-50/50 p-1 dark:border-[#2D222A] dark:bg-[#130F12]"
              role="tablist"
              aria-label={locale === "tr" ? "Hesap işlemi" : "Account action"}
            >
              <button
                type="button"
                role="tab"
                aria-selected={authMode === "signin"}
                className={
                  authMode === "signin"
                    ? "rounded-lg bg-[#F42566] px-3 py-2.5 text-sm font-semibold text-white shadow-sm"
                    : "rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-[#1C161B]"
                }
                onClick={() => {
                  setAuthMode("signin");
                  setMessage(null);
                }}
              >
                {locale === "tr" ? "Giriş yap" : "Sign in"}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMode === "signup"}
                className={
                  authMode === "signup"
                    ? "rounded-lg bg-[#F42566] px-3 py-2.5 text-sm font-semibold text-white shadow-sm"
                    : "rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-[#1C161B]"
                }
                onClick={() => {
                  setAuthMode("signup");
                  setMessage(null);
                }}
              >
                {locale === "tr" ? "Kayıt ol" : "Sign up"}
              </button>
            </div>

            <form className="space-y-3" onSubmit={(e) => void onAuthSubmit(e)}>
              {authMode === "signup" && (
                <div>
                  <FieldLabel htmlFor="signup-name" hint={fieldHint("authDisplayName", locale)} hintLabel={locale === "tr" ? "Alan bilgisi" : "Field info"}>
          {locale === "tr" ? "Görünen ad (isteğe bağlı)" : "Display name (optional)"}
        </FieldLabel>
                  <input
                    id="signup-name"
                    className="input-field"
                    value={displayNameDraft}
                    onChange={(e) => setDisplayNameDraft(e.target.value)}
                    placeholder={locale === "tr" ? "Adınız" : "Your name"}
                    autoComplete="name"
                  />
                </div>
              )}
              <div>
                <FieldLabel htmlFor="auth-email" hint={fieldHint("authEmail", locale)} hintLabel={locale === "tr" ? "Alan bilgisi" : "Field info"}>
          Email
        </FieldLabel>
                <input
                  id="auth-email"
                  className="input-field"
                  type="email"
                  placeholder="ornek@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <FieldLabel htmlFor="auth-password" hint={fieldHint("authPassword", locale)} hintLabel={locale === "tr" ? "Alan bilgisi" : "Field info"}>
          {locale === "tr" ? "Şifre" : "Password"}
        </FieldLabel>
                <input
                  id="auth-password"
                  className="input-field"
                  type="password"
                  placeholder={locale === "tr" ? "En az 6 karakter" : "At least 6 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={
                    authMode === "signup" ? "new-password" : "current-password"
                  }
                />
              </div>
              {authMode === "signup" && (
                <div>
                  <FieldLabel htmlFor="auth-password2" hint={fieldHint("authPasswordConfirm", locale)} hintLabel={locale === "tr" ? "Alan bilgisi" : "Field info"}>
          {locale === "tr" ? "Şifre tekrar" : "Confirm password"}
        </FieldLabel>
                  <input
                    id="auth-password2"
                    className="input-field"
                    type="password"
                    placeholder={locale === "tr" ? "Şifreyi tekrar yazın" : "Repeat password"}
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              )}
              <button
                type="submit"
                className="btn-primary w-full touch-target"
                disabled={busy}
              >
                {busy
                  ? locale === "tr"
                    ? "Lütfen bekleyin…"
                    : "Please wait…"
                  : authMode === "signup"
                    ? locale === "tr"
                      ? "Hesap oluştur"
                      : "Create account"
                    : locale === "tr"
                      ? "Giriş yap"
                      : "Sign in"}
              </button>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {authMode === "signup"
                  ? locale === "tr"
                    ? "Kayıt sonrası e-postanız Fıkıh Asistanı iletilerinde kullanılır."
                    : "After signup, your email is used for Fiqh Assistant forwards."
                  : locale === "tr"
                    ? "Hesabınız yoksa üstten «Kayıt ol» sekmesini seçin."
                    : "No account yet? Choose the Sign up tab above."}
              </p>
            </form>
          </div>
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
        <FieldLabel htmlFor="displayName" hint={fieldHint("profileDisplayName", locale)} hintLabel={locale === "tr" ? "Alan bilgisi" : "Field info"}>
          {locale === "tr" ? "Görünen ad" : "Display name"}
        </FieldLabel>
        <input
          id="displayName"
          className="input-field"
          value={profile.displayName ?? ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, displayName: e.target.value }))
          }
        />

        <FieldLabel htmlFor="profile-email" hint={fieldHint("profileContactEmail", locale)} hintLabel={locale === "tr" ? "Alan bilgisi" : "Field info"}>
          {locale === "tr" ? "İletişim e-postası" : "Contact email"}
        </FieldLabel>
        <input
          id="profile-email"
          type="email"
          className="input-field"
          placeholder="ornek@mail.com"
          value={profile.email ?? ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, email: e.target.value || null }))
          }
        />
        <p className="text-[11px] text-slate-400">
          {locale === "tr"
            ? "Fıkıh asistanında bilinemeyen sorular destek@hayztakvimi.app adresine iletilirken bu e-posta bildirilir."
            : "Used when forwarding unanswered assistant questions to destek@hayztakvimi.app."}
        </p>

        <FieldLabel htmlFor="profile-madhhab" hint={fieldHint("profileMadhhab", locale)} hintLabel={locale === "tr" ? "Alan bilgisi" : "Field info"}>
          {locale === "tr" ? "Mezhep" : "Madhhab"}
        </FieldLabel>
        <select
          id="profile-madhhab"
          className="input-field"
          value={normalizeMadhhab(profile.madhhab)}
          onChange={(e) =>
            setProfile((p) => ({
              ...p,
              madhhab: e.target.value as Madhhab,
              malikiMaxDays: p.malikiMaxDays ?? 15,
            }))
          }
        >
          {PROFILE_MADHHABS.map((m) => (
            <option key={m} value={m}>
              {madhhabLabel(m, locale)}
            </option>
          ))}
        </select>

        {malikiMaxEnabled && (
          <div>
            <FieldLabel htmlFor="profile-maliki-max" hint={fieldHint("profileMalikiMax", locale)} hintLabel={locale === "tr" ? "Alan bilgisi" : "Field info"}>
          {locale === "tr" ? "En çok hayz günü (azami)" : "Maximum hayd days"}
        </FieldLabel>
            <input
              id="profile-maliki-max"
              type="number"
              min={1}
              max={30}
              className="input-field"
              value={profile.malikiMaxDays ?? 15}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  malikiMaxDays: Number(e.target.value),
                }))
              }
            />
            <p className="mt-1 text-xs text-slate-400">
              {locale === "tr"
                ? "Yalnızca Maliki / Maliki taklidinde kullanılır (varsayılan 15)."
                : "Used only for Maliki / following Maliki (default 15)."}
            </p>
          </div>
        )}

        <FieldLabel as="label" hint={fieldHint("profileHabitHayz", locale)} hintLabel={locale === "tr" ? "Alan bilgisi" : "Field info"}>
          {locale === "tr" ? "Sahih hayz (gün)" : "Habitual hayd (days)"}
        </FieldLabel>
        <input
          type="number"
          min={3}
          max={15}
          className="input-field"
          value={profile.habitHayzDays}
          onChange={(e) =>
            setProfile((p) => ({
              ...p,
              habitHayzDays: Number(e.target.value),
            }))
          }
        />
        <FieldLabel as="label" hint={fieldHint("profileHabitPurity", locale)} hintLabel={locale === "tr" ? "Alan bilgisi" : "Field info"}>
          {locale === "tr" ? "Sahih temizlik (gün)" : "Habitual purity (days)"}
        </FieldLabel>
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

      <NotificationSettingsCard />

      {message && (
        <p className="rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
          {message}
        </p>
      )}
    </div>
  );
}
