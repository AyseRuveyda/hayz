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
 * İletişim formu mesajlarını kaydeder.
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
  const userEmail = (body.userEmail ?? "").trim().toLowerCase();

  if (!userEmail || !userEmail.includes("@")) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (!question) {
    return NextResponse.json({ ok: false, error: "empty_question" }, { status: 400 });
  }

  const payload = {
    id: body.id ?? `contact_${Date.now()}`,
    question,
    userEmail,
    locale: body.locale ?? "tr",
    createdAt: body.createdAt ?? new Date().toISOString(),
    to: CONTACT_EMAIL,
  };

  console.info("[contact]", JSON.stringify(payload));

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
          reply_to: userEmail,
          subject: `İletişim formu — ${userEmail}`,
          text: [
            `Gönderen: ${userEmail}`,
            `Dil: ${payload.locale}`,
            `Zaman: ${payload.createdAt}`,
            `id: ${payload.id}`,
            "",
            "Mesaj / soru:",
            payload.question,
          ].join("\n"),
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("[contact] resend failed", errText);
        return NextResponse.json(
          { ok: true, emailed: false, stored: true, error: "email_failed" },
          { status: 200 }
        );
      }
      return NextResponse.json({ ok: true, emailed: true, stored: true });
    } catch (err) {
      console.error("[contact] resend error", err);
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
    note: "RESEND_API_KEY yok; mesaj loglandı. İstemci mailto ile iletti.",
  });
}
