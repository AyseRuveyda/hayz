import { uid } from "@/lib/local-store";
import { CONTACT_EMAIL } from "@/lib/fiqh-assistant";

export type PendingAssistantQuestion = {
  id: string;
  question: string;
  userEmail: string | null;
  locale: "tr" | "en";
  createdAt: string;
  status: "queued" | "mailto_opened" | "sent";
};

const KEY = "hayzapp.guest.assistantQuestions";

function readAll(): PendingAssistantQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PendingAssistantQuestion[];
  } catch {
    return [];
  }
}

function writeAll(items: PendingAssistantQuestion[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function getPendingAssistantQuestions(): PendingAssistantQuestion[] {
  return readAll();
}

/** Bilinmeyen soruyu kaydeder ve iletişim mailine mailto taslağı açar. */
export function queueUnknownAssistantQuestion(input: {
  question: string;
  userEmail: string | null | undefined;
  locale: "tr" | "en";
}): PendingAssistantQuestion {
  const item: PendingAssistantQuestion = {
    id: uid("ask"),
    question: input.question.trim(),
    userEmail: input.userEmail?.trim() || null,
    locale: input.locale,
    createdAt: new Date().toISOString(),
    status: "queued",
  };

  const all = readAll();
  all.unshift(item);
  writeAll(all.slice(0, 100));

  const subject =
    input.locale === "tr"
      ? `Fıkıh Asistanı — bilinemeyen soru`
      : `Fiqh Assistant — unanswered question`;

  const body = [
    input.locale === "tr" ? "Yeni asistan sorusu" : "New assistant question",
    "",
    input.locale === "tr" ? "Soran hesap e-postası:" : "Asker account email:",
    item.userEmail ??
      (input.locale === "tr"
        ? "(kayıtlı e-posta yok — misafir)"
        : "(no registered email — guest)"),
    "",
    input.locale === "tr" ? "Soru:" : "Question:",
    item.question,
    "",
    `id: ${item.id}`,
    `at: ${item.createdAt}`,
  ].join("\n");

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Kullanıcı ortamında iletişim kutusuna düşmesi için mailto taslağını aç
  try {
    const a = document.createElement("a");
    a.href = mailto;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    item.status = "mailto_opened";
  } catch {
    // yoksay — kayıt yine durur
  }

  // güncel status’u yaz
  const refreshed = readAll().map((q) => (q.id === item.id ? item : q));
  writeAll(refreshed);

  // Sunucu kaydı (opsiyonel — env ile e-posta gönderilebilir)
  void fetch("/api/assistant-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: item.id,
      question: item.question,
      userEmail: item.userEmail,
      locale: item.locale,
      createdAt: item.createdAt,
    }),
  }).catch(() => undefined);

  return item;
}
