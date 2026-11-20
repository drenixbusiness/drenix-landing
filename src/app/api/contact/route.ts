// Contact form: sends requests to your Telegram group.
// Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local.

type Payload = {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  message?: string;
  services?: string[];
  budget?: string;
  website?: string;
};

const clip = (v: unknown, n = 1000) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: hidden field for bots
  if (clip(body.website)) return Response.json({ ok: true });

  const name = clip(body.name, 120);
  const phone = clip(body.phone, 40);
  if (!name || !phone) {
    return Response.json({ ok: false, error: "name_and_phone_required" }, { status: 422 });
  }

  const services = Array.isArray(body.services) ? body.services.map((s) => clip(s, 80)).filter(Boolean).slice(0, 12) : [];
  const text = [
    "<b>🔥 New request — DRENIX</b>",
    `<b>Name:</b> ${esc(name)}`,
    `<b>Phone:</b> ${esc(phone)}`,
    clip(body.email) && `<b>Email:</b> ${esc(clip(body.email, 120))}`,
    clip(body.company) && `<b>Company:</b> ${esc(clip(body.company, 120))}`,
    services.length > 0 && `<b>Services:</b> ${esc(services.join(", "))}`,
    clip(body.budget) && `<b>Budget:</b> ${esc(clip(body.budget, 40))}`,
    clip(body.message) && `\n${esc(clip(body.message, 2000))}`,
  ]
    .filter(Boolean)
    .join("\n");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[contact] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set. Request:\n" + text);
    return Response.json({ ok: true, delivered: false });
  }

  const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!tg.ok) {
    console.error("[contact] Telegram error", tg.status, await tg.text());
    return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }
  return Response.json({ ok: true, delivered: true });
}
