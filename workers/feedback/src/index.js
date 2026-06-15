// Cloudflare Worker: event feedback endpoint for cloudnative.lv.
// POST { event, overall, talks, organization, topics, comments } -> append a row to
// feedback/<event>.csv in R2. Mirrors the Google Form: three 1-5 ratings + two free-
// text fields, all optional (at least one required). Honeypot + validation + CORS.
const RATING_RE = /^[1-5]?$/; // empty or 1-5
const EVENT_RE = /^[a-z0-9-]{1,80}$/;
const HEADER = "timestamp,overall,talks,organization,topics,comments\n";

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
    if (body.hp) return json({ ok: true }); // honeypot

    const event = String(body.event || "").trim().toLowerCase();
    if (!EVENT_RE.test(event)) return json({ error: "invalid event" }, 400);

    const rating = (v) => String(v ?? "").trim();
    const overall = rating(body.overall);
    const talks = rating(body.talks);
    const organization = rating(body.organization);
    const topics = String(body.topics || "").slice(0, 2000);
    const comments = String(body.comments || "").slice(0, 2000);

    if (![overall, talks, organization].every((r) => RATING_RE.test(r))) return json({ error: "invalid rating" }, 400);
    if (!(overall || talks || organization || topics.trim() || comments.trim())) return json({ error: "empty feedback" }, 400);

    const ts = new Date().toISOString();
    const prefix = env.FEEDBACK_PREFIX || "feedback/";

    // 1) Persist the raw submission as an immutable per-event JSON record FIRST, so a
    //    failed or garbled CSV append can always be re-derived. The key never collides.
    await env.FEEDBACK.put(`${prefix}incoming/${event}/${ts}_${crypto.randomUUID()}.json`,
      JSON.stringify({ ts, event, overall, talks, organization, topics, comments }),
      { httpMetadata: { contentType: "application/json" } });

    // 2) Then inject it into the aggregate feedback/<event>.csv (text fields quoted, RFC 4180).
    const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const key = `${prefix}${event}.csv`;
    const existing = await env.FEEDBACK.get(key);
    const csv = existing ? await existing.text() : HEADER;
    const row = `${ts},${overall},${talks},${organization},${q(topics)},${q(comments)}\n`;
    await env.FEEDBACK.put(key, csv + row, { httpMetadata: { contentType: "text/csv" } });
    return json({ ok: true });
  },
};
