"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Copy, Mail, Send } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/fiqh-assistant";
import { useI18n } from "@/lib/i18n";
import { getGuestProfile, saveGuestProfile, uid } from "@/lib/local-store";
import { cn } from "@/lib/utils";

export default function IletisimPage() {
  const { locale } = useI18n();
  const [userEmail, setUserEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const p = getGuestProfile();
    if (p.email) setUserEmail(p.email);
  }, []);

  async function copySupportEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    const mail = userEmail.trim().toLowerCase();
    const q = question.trim();

    if (!mail || !mail.includes("@")) {
      setMessage(
        locale === "tr"
          ? "Lütfen geçerli bir e-posta adresi girin."
          : "Please enter a valid email address."
      );
      return;
    }
    if (q.length < 5) {
      setMessage(
        locale === "tr"
          ? "Sorunuzu biraz daha ayrıntılı yazın."
          : "Please write a bit more detail in your question."
      );
      return;
    }

    setBusy(true);
    const id = uid("contact");
    const createdAt = new Date().toISOString();

    // Profilde e-posta yoksa kaydet (sonraki formlar için)
    const profile = getGuestProfile();
    if (!profile.email || profile.email !== mail) {
      saveGuestProfile({ ...profile, email: mail });
    }

    const subject =
      locale === "tr" ? "Hayz — iletişim formu" : "Hayz — contact form";
    const body = [
      locale === "tr" ? "İletişim formu mesajı" : "Contact form message",
      "",
      locale === "tr" ? "Gönderen e-posta:" : "Sender email:",
      mail,
      "",
      locale === "tr" ? "Soru / mesaj:" : "Question / message:",
      q,
      "",
      `id: ${id}`,
      `at: ${createdAt}`,
    ].join("\n");

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    let emailed = false;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          question: q,
          userEmail: mail,
          locale,
          createdAt,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; emailed?: boolean };
      emailed = Boolean(data.emailed);
    } catch {
      // mailto yedeği açılacak
    }

    // Sunucu e-posta gönderemediyse kullanıcının mail uygulamasını aç
    if (!emailed) {
      try {
        const a = document.createElement("a");
        a.href = mailto;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch {
        // yoksay
      }
    }

    setBusy(false);
    setSent(true);
    setQuestion("");
    setMessage(
      locale === "tr"
        ? emailed
          ? "Mesajınız iletildi. En kısa sürede destek@hayztakvimi.app adresinden dönüş yapılacak."
          : "Mesajınız kaydedildi. E-posta uygulamanız açıldıysa gönderimi tamamlayın; yanıt destek@hayztakvimi.app adresinden gelecektir."
        : emailed
          ? "Your message was sent. You’ll hear back from destek@hayztakvimi.app soon."
          : "Your message was saved. If your email app opened, finish sending; replies come from destek@hayztakvimi.app."
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#E11D48]">
          {locale === "tr" ? "Destek" : "Support"}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {locale === "tr" ? "İletişim" : "Contact"}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {locale === "tr"
            ? "Sorunuzu yazın; e-posta adresinizle birlikte bize iletilsin. Yanıtlar destek adresimizden gelir."
            : "Write your question and we’ll receive it with your email. Replies come from our support address."}
        </p>
      </header>

      <div className="card-surface space-y-3 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F42566]/10 text-[#E11D48]">
            <Mail className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {locale === "tr" ? "Bizim e-postamız" : "Our email"}
            </p>
            <p className="break-all text-sm font-semibold text-slate-800 dark:text-slate-100">
              {CONTACT_EMAIL}
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {locale === "tr"
                ? "Yanıtlar bu adresten gelir. Doğrudan yazmak isterseniz de kullanabilirsiniz."
                : "Replies come from this address. You can also write to it directly."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void copySupportEmail()}
            className="btn-ghost shrink-0 px-2.5 py-2 text-xs"
            aria-label={locale === "tr" ? "E-postayı kopyala" : "Copy email"}
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card-surface space-y-4 p-5">
        <div className="space-y-1.5">
          <label className="label-field" htmlFor="contact-email">
            {locale === "tr" ? "Sizin e-postanız" : "Your email"}
          </label>
          <input
            id="contact-email"
            type="email"
            required
            autoComplete="email"
            className="input-field"
            placeholder="ornek@mail.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="label-field" htmlFor="contact-question">
            {locale === "tr" ? "Sorunuz / mesajınız" : "Your question / message"}
          </label>
          <textarea
            id="contact-question"
            required
            rows={6}
            className="input-field min-h-[9rem] resize-y"
            placeholder={
              locale === "tr"
                ? "Sorunuzu veya iletmek istediğiniz konuyu yazın…"
                : "Write your question or message…"
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        {message && (
          <p
            className={cn(
              "rounded-xl px-3 py-2.5 text-sm leading-relaxed",
              sent
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
            )}
            role="status"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Send className="h-4 w-4" />
          {busy
            ? locale === "tr"
              ? "Gönderiliyor…"
              : "Sending…"
            : locale === "tr"
              ? "Gönder"
              : "Send"}
        </button>
      </form>
    </div>
  );
}
