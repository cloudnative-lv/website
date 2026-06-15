// Cloudflare Worker: community signup endpoint for cloudnative.lv.
//
// POST { email } ->
//   1. append a row to subscribers.csv in R2 — the common CRM and source of truth
//      (schema: email,first,last,linkedin,source,event,added; a web signup fills
//      only email + source=web + added, leaving the rest for the local CRM ops)
//   2. notify the organizers via the Email Routing send_email binding
//
// A hidden `hp` honeypot field + strict validation guard against spam; CORS is
// restricted to ALLOWED_ORIGINS.
import { EmailMessage } from "cloudflare:email";

const EMAIL_RE = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

// Every R2 write goes through here so it's always no-store: `wrangler r2 object get`
// caches reads and won't bust them on overwrite, so without no-store the local ops would
// read a stale subscribers.csv.
const putR2 = (binding, key, body, contentType) =>
  binding.put(key, body, { httpMetadata: { contentType, cacheControl: "no-store, max-age=0" } });

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

    const ts = new Date().toISOString();

    // 1) Persist the raw signup as an immutable per-submission JSON record FIRST, so the
    //    CRM CSV can always be re-derived even if the read-modify-write below fails.
    await putR2(env.SUBSCRIBERS, `subscribers/incoming/${ts}_${crypto.randomUUID()}.json`,
      JSON.stringify({ ts, email, source: "web" }), "application/json");

    // 2) Then inject into the CRM CSV (read-modify-write; signups are low volume).
    const key = env.SUBSCRIBERS_KEY || "subscribers.csv";
    const HEADER = "email,first,last,linkedin,source,event,added";
    const existing = await env.SUBSCRIBERS.get(key);
    const csv = existing ? await existing.text() : HEADER + "\n";
    // Dedup on the email column (col 0). Blank-email rows (LinkedIn/OCG followers added
    // by the local CRM ops) start with "," so they never match a real signup and survive
    // the read-modify-write. A legacy email,timestamp,source file is normalized to the
    // CRM schema the next time a local op writes subscribers.csv.
    const duplicate = csv.split("\n").some((line) => line.slice(0, Math.max(0, line.indexOf(","))) === email);

    if (!duplicate) {
      const next = `${csv}${email},,,,web,,${ts.slice(0, 10)}\n`;
      await putR2(env.SUBSCRIBERS, key, next, "text/csv");
      await notify(env, email).catch((err) => console.error("notify failed:", err));
    }
    return json({ ok: true, duplicate });
  },
};

// Notify the organizers. NOTIFY_TO is one or more *verified* Email Routing
// destination addresses (comma-separated); each gets its own message, and one
// bad recipient never blocks the others.
async function notify(env, email) {
  if (!env.NOTIFY) return; // send_email binding not configured
  const from = env.NOTIFY_FROM || "noreply@cloudnative.lv";
  const recipients = (env.NOTIFY_TO || "").split(",").map((s) => s.trim()).filter(Boolean);
  for (const to of recipients) {
    const raw = [
      `From: Cloud Native Latvia <${from}>`,
      `To: ${to}`,
      "Subject: New community member",
      `Message-ID: <${crypto.randomUUID()}@cloudnative.lv>`,
      `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="utf-8"',
      "",
      `${email} just joined the Cloud Native Latvia community.`,
    ].join("\r\n");
    try {
      await env.NOTIFY.send(new EmailMessage(from, to, raw));
    } catch (err) {
      console.error("notify failed for", to, err);
    }
  }
}
