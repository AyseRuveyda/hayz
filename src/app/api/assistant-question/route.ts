import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/fiqh-assistant";

type Body = {
  id?: string;
  question?: string;
  userEmail?: string | null;
  locale?: "tr" | "en";
  createdAt?: string;
};

/**
 * Bilinmeyen asistan sorularını kaydeder.
 * RESEND_API_KEY varsa destek@ adresine e-posta gönderir.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ ok: false, error: "empty_question" }, { status: 400 });
  }

  const payload = {
    id: body.id ?? `ask_${Date.now()}`,
    question,
    userEmail: body.userEmail ?? null,
    locale: body.locale ?? "tr",
    createdAt: body.createdAt ?? new Date().toISOString(),
    to: CONTACT_EMAIL,
  };

  // Sunucu log (Vercel/host loglarında görünür)
  console.info("[assistant-question]", JSON.stringify(payload));

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || CONTACT_EMAIL;

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [CONTACT_EMAIL],
          subject: `Fıkıh Asistanı sorusu — ${payload.userEmail || "misafir"}`,
          text: [
            `Soran hesap: ${payload.userEmail || "(kayıtlı e-posta yok)"}`,
            `Dil: ${payload.locale}`,
            `Zaman: ${payload.createdAt}`,
            `id: ${payload.id}`,
            "",
            "Soru:",
            payload.question,
          ].join("\n"),
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("[assistant-question] resend failed", errText);
        return NextResponse.json(
          { ok: true, emailed: false, stored: true, error: "email_failed" },
          { status: 200 }
        );
      }
      return NextResponse.json({ ok: true, emailed: true, stored: true });
    } catch (err) {
      console.error("[assistant-question] resend error", err);
      return NextResponse.json(
        { ok: true, emailed: false, stored: true, error: "email_error" },
        { status: 200 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    emailed: false,
    stored: true,
    note: "RESEND_API_KEY yok; soru loglandı. İstemci mailto ile iletti.",
  });
}
