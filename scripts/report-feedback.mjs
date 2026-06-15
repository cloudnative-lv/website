// Feedback digest: reads every feedback/<slug>.csv from R2 and writes a markdown summary,
// charts and word clouds to data/reports/feedback/. The local op that replaces the
// never-built "feedback digest worker" — run ~1 day after an event (emailing stays
// manual).    npm run report:feedback
import { r2ReadText } from './lib/r2.mjs';
import { readEvents } from './lib/events.mjs';
import { parseFeedbackCsv, renderFeedbackReport } from './lib/reports.mjs';

const events = (await readEvents()).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
const feedbackBySlug = new Map();
for (const e of events) {
  const text = r2ReadText(`feedback/${e.slug}.csv`);
  if (!text) continue;
  const rows = parseFeedbackCsv(text);
  if (rows.length) feedbackBySlug.set(e.slug, rows);
}
if (!feedbackBySlug.size) { console.error('No feedback CSVs found in R2 (feedback/<slug>.csv).'); process.exit(1); }

const r = await renderFeedbackReport({ feedbackBySlug, OUT: 'data/reports/feedback' });
console.log(`Wrote data/reports/feedback/ — ${r.responses} responses, ${r.meetups} meetups, overall ${r.overall.toFixed(2)}${r.wordclouds ? '' : ' (no word clouds)'}.`);
