// Reminder Worker — on a schedule, fetch the site's static events.json and email
// the organizers about gaps: upcoming events without a registration link, and
// recently-finished events still missing photos or slides. Pure read of the
// site's own data + Email Routing send_email. No third-party services.
import { EmailMessage } from "cloudflare:email";

const DAY = 86400000;

// Event end as UTC ms (coarse — reminders are day-grained, so timezone slop is fine).
function eventEndMs(e) {
  const [y, m, d] = String(e.date).split("-").map(Number);
  const [hh, mm] = String(e.endTime || "23:59").split(":").map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1, hh || 23, mm || 59);
}

export default {
  async scheduled(controller, env) {
    const site = env.SITE_URL || "https://cloudnative.lv";
    let events;
    try {
      const res = await fetch(`${site}/events.json`, { cf: { cacheTtl: 0 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      events = await res.json();
    } catch (err) {
      console.error("reminder: failed to load events.json", err);
      return;
    }

    const now = Date.now();
    const issues = [];
    for (const e of events) {
      const days = (eventEndMs(e) - now) / DAY;
      if (days > 0 && days <= 10 && !e.hasRegistration) {
        issues.push(`• ${e.slug}: in ${Math.ceil(days)} day(s) — registration link not set`);
      } else if (days < 0 && days >= -14) {
        if (!e.hasPhotos) issues.push(`• ${e.slug}: finished — photos not added yet`);
        if (e.talksMissingSlides > 0) issues.push(`• ${e.slug}: finished — ${e.talksMissingSlides}/${e.talkCount} talks missing slides`);
      }
    }

    if (!issues.length) {
      console.log("reminder: nothing to flag");
      return;
    }

    // Record to R2 (reliable log, independent of email delivery).
    if (env.DATA) {
      try {
        const existing = await env.DATA.get("reminders.csv");
        const csv = existing ? await existing.text() : "timestamp,issues\n";
        const row = `${new Date().toISOString()},"${issues.join(" | ").replace(/"/g, '""')}"\n`;
        await env.DATA.put("reminders.csv", csv + row, { httpMetadata: { contentType: "text/csv" } });
      } catch (err) {
        console.error("reminder: R2 log failed", err);
      }
    }

    await notify(env, issues).catch((err) => console.error("reminder: notify failed", err));
  },
};

async function notify(env, issues) {
  if (!env.NOTIFY) return;
  const from = env.NOTIFY_FROM || "noreply@cloudnative.lv";
  const to = env.NOTIFY_TO || "hello@cloudnative.lv";
  const raw = [
    `From: Cloud Native Latvia <${from}>`,
    `To: ${to}`,
    "Subject: Event checklist reminder",
    `Message-ID: <${crypto.randomUUID()}@cloudnative.lv>`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="utf-8"',
    "",
    "A few event tasks may need attention:",
    "",
    ...issues,
    "",
    "— cloudnative.lv",
  ].join("\r\n");
  await env.NOTIFY.send(new EmailMessage(from, to, raw));
}
