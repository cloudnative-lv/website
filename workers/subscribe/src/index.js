// Cloudflare Worker: newsletter subscribe endpoint for cloudnative.lv.
//
// POST { email } ->
//   1. append `email,timestamp,source` to subscribers.csv in R2 (source of truth)
//   2. notify the organizers via the Email Routing send_email binding
//
// A hidden `hp` honeypot field + strict validation guard against spam; CORS is
// restricted to ALLOWED_ORIGINS.
import { EmailMessage } from "cloudflare:email";

const EMAIL_RE = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : (allowed[0] || "*"),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...cors } });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "method not allowed" }, 405);

    let body;
    try { body = await request.json(); } catch { return json({ error: "invalid JSON" }, 400); }

    // Honeypot: bots fill hidden fields. Pretend success and drop it.
    if (body.hp) return json({ ok: true });

    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) return json({ error: "invalid email" }, 400);

    // Append to the CSV in R2 (read-modify-write; signups are low volume).
    const key = env.SUBSCRIBERS_KEY || "subscribers.csv";
    const existing = await env.SUBSCRIBERS.get(key);
    const csv = existing ? await existing.text() : "email,timestamp,source\n";
    const duplicate = csv.split("\n").some((line) => line.slice(0, Math.max(0, line.indexOf(","))) === email);

    if (!duplicate) {
      const next = `${csv}${email},${new Date().toISOString()},website\n`;
      await env.SUBSCRIBERS.put(key, next, { httpMetadata: { contentType: "text/csv" } });
      await notify(env, email).catch((err) => console.error("notify failed:", err));
    }
    return json({ ok: true, duplicate });
  },
};

async function notify(env, email) {
  if (!env.NOTIFY) return; // send_email binding not configured
  const from = env.NOTIFY_FROM || "noreply@cloudnative.lv";
  const to = env.NOTIFY_TO || "hello@cloudnative.lv";
  const raw = [
    `From: Cloud Native Latvia <${from}>`,
    `To: ${to}`,
    "Subject: New newsletter subscriber",
    `Message-ID: <${crypto.randomUUID()}@cloudnative.lv>`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="utf-8"',
    "",
    `New subscriber: ${email}`,
  ].join("\r\n");
  await env.NOTIFY.send(new EmailMessage(from, to, raw));
}
