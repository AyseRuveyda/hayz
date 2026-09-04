"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useChatDrawer } from "@/components/chat/ChatContext";
import { queueUnknownAssistantQuestion } from "@/lib/assistant-questions";
import {
  CONTACT_EMAIL,
  matchFiqhAnswer,
  unknownAnswerMessage,
} from "@/lib/fiqh-assistant";
import { useI18n } from "@/lib/i18n";
import { getGuestProfile } from "@/lib/local-store";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export function FiqhChatDrawer() {
  const { open, closeChat } = useChatDrawer();
  const { t, locale } = useI18n();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const welcome = useMemo<ChatMessage>(
    () => ({
      id: "welcome",
      role: "assistant",
      text:
        locale === "tr"
          ? `Merhaba. Yalnızca hayzdosya.pdf kaynağına dayanan kısa sorulara yanıt veririm. Bilmediğim soruları ${CONTACT_EMAIL} adresine iletirim; 24 saat içinde dönüş yapılır.`
          : `Hello. I only answer from hayzdosya.pdf. Unknown questions are forwarded to ${CONTACT_EMAIL}; you will hear back within 24 hours.`,
    }),
    [locale]
  );

  useEffect(() => {
    if (open) {
      setMessages([welcome]);
    }
  }, [open, welcome]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    try {
      const match = matchFiqhAnswer(trimmed, locale);
      let replyText: string;

      if (match) {
        replyText = match.answer;
      } else {
        const profile = getGuestProfile();
        queueUnknownAssistantQuestion({
          question: trimmed,
          userEmail: profile.email ?? null,
          locale,
        });
        replyText = unknownAnswerMessage(locale, profile.email ?? null);
      }

      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: replyText,
      };
      setMessages((prev) => [...prev, reply]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-slate-900/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeChat}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-rose-100/70 bg-white shadow-2xl transition-transform duration-300 dark:border-[#2D222A] dark:bg-[#1C161B]",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between gap-3 border-b border-rose-100/70 px-4 py-4 dark:border-[#2D222A]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F42566]/10 text-[#E11D48]">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                {t.chat.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.chat.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeChat}
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-slate-700 dark:hover:bg-[#241c23]"
            aria-label={t.chat.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-rose-100/70 px-4 py-3 dark:border-[#2D222A]">
          {[t.chat.quick1, t.chat.quick2, t.chat.quick3].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void send(q)}
              className="rounded-full border border-rose-100/80 bg-[#FFF7F6] px-3 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:border-[#F42566]/40 hover:text-[#E11D48] dark:border-[#2D222A] dark:bg-[#130F12] dark:text-slate-300"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-[#F42566] text-white"
                  : "bg-slate-50 text-slate-700 dark:bg-[#130F12] dark:text-slate-200"
              )}
            >
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <p className="px-4 text-[11px] leading-relaxed text-slate-400">
          {t.chat.disclaimer}
        </p>

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 border-t border-rose-100/70 p-4 dark:border-[#2D222A]"
        >
          <input
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chat.placeholder}
            disabled={busy}
          />
          <button
            type="submit"
            className="btn-primary shrink-0 px-3"
            aria-label={t.chat.send}
            disabled={busy}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </aside>
    </>
  );
}
