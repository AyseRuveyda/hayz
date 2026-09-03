"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useChatDrawer } from "@/components/chat/ChatContext";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

function answerQuestion(q: string, locale: "tr" | "en"): string {
  const s = q.toLocaleLowerCase("tr");

  if (
    s.includes("3 gün") ||
    s.includes("72") ||
    s.includes("kısa") ||
    s.includes("short")
  ) {
    return locale === "tr"
      ? "Hanefi mezhebinde 72 saatten (3 günden) kısa kanamalar hayz sayılmaz; tamamı istihâze kabul edilir. Gusül farz değildir; o sürede kılınmayan farz namazlar kaza edilir."
      : "In the Hanafi school, bleeding shorter than 72 hours (3 days) is not hayd; it is istihadha. Ghusl is not required; missed fard prayers in that period must be made up.";
  }

  if (
    s.includes("10 gün") ||
    s.includes("240") ||
    s.includes("uzun") ||
    s.includes("exceed") ||
    s.includes("aş")
  ) {
    return locale === "tr"
      ? "Hanefi’de hayzın azamisi 10 gündür. Daha uzun süren kanamada alışılmış (sahih) hayz süreniz kadar olan kısım hayz, sonrası istihâze sayılır. Hayz bitiminde gusül farzdır; istihâze günlerinde namaz kılınır."
      : "In Hanafi fiqh, hayd lasts at most 10 days. Longer bleeding: your habitual hayd length is hayd, the rest is istihadha. Ghusl is due after hayd; pray during istihadha.";
  }

  if (
    s.includes("istihâze") ||
    s.includes("istihaze") ||
    s.includes("istihadha") ||
    s.includes("namaz")
  ) {
    return locale === "tr"
      ? "İstihâze hâlinde namaz farzdır. Her farz namaz için abdest alınır (Hanefi’de vakit çıkınca abdest bozulur). Oruç tutulur; mushafa abdestli dokunulabilir."
      : "During istihadha, prayer is obligatory. Renew wudu for each fard prayer (in Hanafi, wudu ends with the prayer time). Fasting continues; the mushaf may be touched with wudu.";
  }

  if (s.includes("gusül") || s.includes("ghusl")) {
    return locale === "tr"
      ? "Gusül, hayz veya nifasın bitiminde farzdır. Salt istihâze veya 72 saatten kısa kanamada gusül farz olmaz."
      : "Ghusl is obligatory when hayd or nifas ends. It is not required for istihadha alone or for bleedings shorter than 72 hours (Hanafi).";
  }

  return locale === "tr"
    ? "Sorunuz kaydedildi. Genel çerçeve: süreleri saat bazında hesaplayın; Hanefi’de asgari 3, azami 10 gün; aşımda alışkanlık esas alınır. Kesin hüküm için ehil bir âlime danışın."
    : "Thanks for your question. General frame: calculate by hours; Hanafi min 3 / max 10 days; beyond that use habit. Consult a qualified scholar for a definitive ruling.";
}

export function FiqhChatDrawer() {
  const { open, closeChat } = useChatDrawer();
  const { t, locale } = useI18n();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const welcome = useMemo<ChatMessage>(
    () => ({
      id: "welcome",
      role: "assistant",
      text:
        locale === "tr"
          ? "Merhaba. Hayz, istihâze ve ibadetle ilgili kısa sorularınızı yazabilirsiniz."
          : "Hello. You can ask short questions about hayd, istihadha and worship.",
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

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    const reply: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: answerQuestion(trimmed, locale),
    };
    setMessages((prev) => [...prev, userMsg, reply]);
    setInput("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
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
              onClick={() => send(q)}
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
          />
          <button type="submit" className="btn-primary shrink-0 px-3" aria-label={t.chat.send}>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </aside>
    </>
  );
}
