/**
 * POST /api/contact — emails the message to you via Resend (https://resend.com).
 * Set RESEND_API_KEY and CONTACT_TO_EMAIL (and optionally CONTACT_FROM_EMAIL) to enable it;
 * until then it answers 503 and the form offers a mailto link instead.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

type Errors = Record<string, string[]>;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ non_field_errors: ["Invalid request."] }, { status: 400 });

  // Honeypot: real visitors never fill the hidden "company" field.
  if (typeof body.company === "string" && body.company.trim()) return Response.json({ ok: true });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const message = String(body.message ?? "").trim();

  const errors: Errors = {};
  if (name.length < 2) errors.name = ["Please tell me your name."];
  if (!EMAIL_RE.test(email)) errors.email = ["Enter a valid email address."];
  if (message.length < 10) errors.message = ["A little more detail, please (10+ characters)."];
  if (message.length > 3000) errors.message = ["Please keep it under 3000 characters."];
  if (Object.keys(errors).length) return Response.json(errors, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return Response.json({ non_field_errors: ["Too many messages. Please try again later."] }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return Response.json({ code: "not_configured" }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to,
      reply_to: email,
      subject: `New message from ${name}`,
      html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!res.ok) {
    console.error("[contact] Resend error", res.status, await res.text().catch(() => ""));
    return Response.json({ non_field_errors: ["Couldn't send right now. Please email me directly."] }, { status: 502 });
  }
  return Response.json({ ok: true });
}
