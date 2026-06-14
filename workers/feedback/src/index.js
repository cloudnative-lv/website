// Cloudflare Worker: event feedback endpoint for cloudnative.lv.
// POST { event, rating, comment } -> append a row to feedback/<event>.csv in R2.
// Honeypot + validation + CORS. Reviewed in bulk later (the source of truth).
const RATING_RE = /^[1-5]$/;
const EVENT_RE = /^[a-z0-9-]{1,80}$/;

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
    const rating = String(body.rating || "").trim();
    const comment = String(body.comment || "").slice(0, 2000);
    if (!EVENT_RE.test(event)) return json({ error: "invalid event" }, 400);
    if (!RATING_RE.test(rating)) return json({ error: "invalid rating" }, 400);

    // Append a CSV row (comment quoted per RFC 4180).
    const key = `${env.FEEDBACK_PREFIX || "feedback/"}${event}.csv`;
    const existing = await env.FEEDBACK.get(key);
    const csv = existing ? await existing.text() : "timestamp,rating,comment\n";
    const row = `${new Date().toISOString()},${rating},"${comment.replace(/"/g, '""')}"\n`;
    await env.FEEDBACK.put(key, csv + row, { httpMetadata: { contentType: "text/csv" } });
    return json({ ok: true });
  },
};
