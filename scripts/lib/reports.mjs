// Report rendering over in-memory data (so it works both from the standalone report ops
// reading R2 and from the single-pass rebuild, which can't re-read R2 because wrangler
// serves a cached GET). Charts are SVG -> PNG (sharp); word clouds use wordcloud2.js.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseCsv, lower, norm } from './csv.mjs';
import { transliterate } from './translit.mjs';
import { barsSvg, lineSvg, tableSvg, SERIES_COLORS } from './charts.mjs';
import { svgToPng, withPage } from './render.mjs';

export const shortLabel = (slug) => { const m = slug.match(/meetup-0*(\d+)/); return m ? `#${m[1]}` : slug; };
const nameKey = (f, l) => `${lower(transliterate(f))} ${lower(transliterate(l))}`.trim();
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// Parse a feedback/<slug>.csv into rating/text row objects.
export function parseFeedbackCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const h = rows[0].map(lower); const idx = (n) => h.indexOf(n);
  return rows.slice(1).filter((r) => r.length > 1).map((r) => ({
    overall: Number(norm(r[idx('overall')])), talks: Number(norm(r[idx('talks')])), organization: Number(norm(r[idx('organization')])),
    topics: norm(r[idx('topics')] ?? ''), comments: norm(r[idx('comments')] ?? ''),
  }));
}

// crmRows: [{email,first,last,linkedin,source,event,added}]
// rostersBySlug: Map(slug -> [{email,name}]) in chronological order
export async function renderCommunityReport({ crmRows, rostersBySlug, OUT }) {
  await mkdir(OUT, { recursive: true });
  const total = crmRows.length;
  const withEmail = crmRows.filter((r) => r.email).length;
  const withLinkedin = crmRows.filter((r) => r.linkedin).length;
  const personKey = (r) => r.email || r.linkedin || nameKey(r.first, r.last);
  const uniquePeople = new Set(crmRows.map(personKey).filter(Boolean)).size;
  const duplicateContacts = total - uniquePeople;

  const bySource = {};
  for (const r of crmRows) bySource[r.source] = (bySource[r.source] || 0) + 1;
  const sources = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

  const byMonth = {};
  for (const r of crmRows) { const mo = (r.added || '').slice(0, 7); if (/^\d{4}-\d{2}$/.test(mo)) byMonth[mo] = (byMonth[mo] || 0) + 1; }
  let cum = 0;
  const growth = Object.keys(byMonth).sort().map((mo) => ({ label: mo.slice(2), value: (cum += byMonth[mo]) }));

  const perEvent = [];
  const eventsByAttendee = new Map();
  const nameByAttendee = new Map();
  for (const [slug, roster] of rostersBySlug) {
    let n = 0;
    for (const a of roster) {
      const email = lower(a.email || '');
      const name = norm(a.name || '');
      const id = email || (name ? `name:${lower(transliterate(name))}` : '');
      if (!id) continue;
      if (!eventsByAttendee.has(id)) eventsByAttendee.set(id, new Set());
      eventsByAttendee.get(id).add(shortLabel(slug));
      if (name && !nameByAttendee.has(id)) nameByAttendee.set(id, name);
      n++;
    }
    perEvent.push({ label: shortLabel(slug), n });
  }
  const totalRegistrations = perEvent.reduce((a, e) => a + e.n, 0);
  const uniqueAttendees = eventsByAttendee.size;
  const eventsPer = [...eventsByAttendee.values()].map((s) => s.size);
  const maxEv = Math.min(6, Math.max(1, ...eventsPer, 1));
  const repeatLabels = Array.from({ length: maxEv }, (_, i) => (i + 1 < 6 ? String(i + 1) : '6+'));
  const repeatDist = repeatLabels.map((lab, i) => eventsPer.filter((v) => (lab === '6+' ? v >= 6 : v === i + 1)).length);
  const repeatAttendees = eventsPer.filter((v) => v >= 2).length;
  const topFans = [...eventsByAttendee.entries()]
    .map(([id, set]) => ({ name: nameByAttendee.get(id) || id, count: set.size, events: [...set].sort((a, b) => +a.slice(1) - +b.slice(1)) }))
    .filter((f) => f.count >= 2)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 15);

  await svgToPng(barsSvg({ title: 'Contacts by source', groups: sources.map(([s]) => s), series: [{ name: 'contacts', color: SERIES_COLORS[0], values: sources.map(([, n]) => n) }] }), path.join(OUT, 'by-source.png'));
  await svgToPng(barsSvg({ title: 'Contactability', groups: ['CRM rows', 'unique', 'with email', 'with LinkedIn'], series: [{ name: 'contacts', color: SERIES_COLORS[1], values: [total, uniquePeople, withEmail, withLinkedin] }], width: 980 }), path.join(OUT, 'contactability.png'));
  if (growth.length) await svgToPng(lineSvg({ title: 'CRM growth (cumulative)', points: growth, yLabel: 'contacts' }), path.join(OUT, 'growth.png'));
  if (perEvent.length) {
    await svgToPng(barsSvg({ title: 'Registrations per event', groups: perEvent.map((e) => e.label), series: [{ name: 'registrations', color: SERIES_COLORS[0], values: perEvent.map((e) => e.n) }] }), path.join(OUT, 'registrations-by-event.png'));
    await svgToPng(barsSvg({ title: 'Events attended per person', groups: repeatLabels.map((l) => `${l} event${l === '1' ? '' : 's'}`), series: [{ name: 'people', color: SERIES_COLORS[1], values: repeatDist }] }), path.join(OUT, 'repeat-registrations.png'));
    if (topFans.length) await svgToPng(tableSvg({ title: 'Most active fans (>=2 events)', headers: ['Person', 'Events', 'Which'], rows: topFans.map((f) => [f.name, String(f.count), f.events.join(' ')]) }), path.join(OUT, 'active-fans-table.png'));
  }

  const pct = (n, d = total) => `${Math.round((n / (d || 1)) * 100)}%`;
  const regBlock = perEvent.length ? `
## Registrations

- **Total registrations:** ${totalRegistrations} across ${perEvent.length} events
- **Unique attendees:** ${uniqueAttendees}
- **Repeat attendees (>=2 events):** ${repeatAttendees} (${pct(repeatAttendees, uniqueAttendees)} of attendees)

| Event | Registrations |
|---|---:|
${perEvent.map((e) => `| ${e.label} | ${e.n} |`).join('\n')}

![Registrations per event](registrations-by-event.png)
![Events attended per person](repeat-registrations.png)

### Most active fans (>=2 events)

| Person | Events | Which |
|---|---:|---|
${topFans.map((f) => `| ${f.name} | ${f.count} | ${f.events.join(' ')} |`).join('\n') || '| _none yet_ | | |'}
${topFans.length ? '\n![Active fans](active-fans-table.png)' : ''}
` : '\n_No per-event rosters yet._\n';

  const md = `# Cloud Native Latvia — community & registrations report

_Generated from R2 \`subscribers.csv\` + \`attendees/<slug>.csv\`._

## Community

- **Community size (unique people):** ${uniquePeople}
- **CRM rows (all source touchpoints):** ${total}
- **Duplicate contacts (same person across sources):** ${duplicateContacts} (${pct(duplicateContacts)}) — reconcile with \`npm run crm:cleanup\`
- **With email:** ${withEmail} (${pct(withEmail)}) · **With LinkedIn:** ${withLinkedin} (${pct(withLinkedin)})

### By source

| Source | Contacts |
|---|---:|
${sources.map(([s, n]) => `| ${s} | ${n} |`).join('\n')}

![By source](by-source.png)
![Contactability](contactability.png)
${growth.length ? '\n![Growth](growth.png)\n' : ''}${regBlock}`;
  await writeFile(path.join(OUT, 'community-report.md'), md);
  return { total, uniquePeople, totalRegistrations, repeatAttendees, sources: sources.length };
}

// feedbackBySlug: Map(slug -> rows[] from parseFeedbackCsv) in chronological order
export async function renderFeedbackReport({ feedbackBySlug, OUT }) {
  await mkdir(OUT, { recursive: true });
  const perEvent = [];
  const dist = [0, 0, 0, 0, 0];
  let topicsText = '', commentsText = '';
  for (const [slug, rows] of feedbackBySlug) {
    if (!rows.length) continue;
    const valid = (k) => rows.map((r) => r[k]).filter((v) => v >= 1 && v <= 5);
    for (const v of valid('overall')) dist[v - 1] += 1;
    for (const r of rows) { topicsText += ' ' + r.topics; commentsText += ' ' + r.comments; }
    perEvent.push({ label: shortLabel(slug), n: rows.length, overall: avg(valid('overall')), talks: avg(valid('talks')), org: avg(valid('organization')) });
  }
  if (!perEvent.length) return { responses: 0, meetups: 0 };
  const totalResponses = perEvent.reduce((a, e) => a + e.n, 0);
  const wmean = (k) => { let s = 0, w = 0; for (const e of perEvent) if (e[k]) { s += e[k] * e.n; w += e.n; } return w ? s / w : 0; };
  const agg = { overall: wmean('overall'), talks: wmean('talks'), org: wmean('org') };

  await svgToPng(barsSvg({ title: 'Ratings by meetup', groups: perEvent.map((e) => e.label), series: [
    { name: 'overall', color: SERIES_COLORS[0], values: perEvent.map((e) => +e.overall.toFixed(2)) },
    { name: 'talks', color: SERIES_COLORS[1], values: perEvent.map((e) => +e.talks.toFixed(2)) },
    { name: 'organization', color: SERIES_COLORS[2], values: perEvent.map((e) => +e.org.toFixed(2)) },
  ], yMax: 5, fmt: (v) => v.toFixed(1) }), path.join(OUT, 'ratings-by-meetup.png'));
  await svgToPng(barsSvg({ title: 'Responses by meetup', groups: perEvent.map((e) => e.label), series: [{ name: 'responses', color: SERIES_COLORS[0], values: perEvent.map((e) => e.n) }] }), path.join(OUT, 'responses-by-meetup.png'));
  await svgToPng(barsSvg({ title: 'Overall rating distribution', groups: ['1', '2', '3', '4', '5'], series: [{ name: 'responses', color: SERIES_COLORS[1], values: dist }] }), path.join(OUT, 'overall-distribution.png'));
  await svgToPng(tableSvg({ title: 'Average scores by meetup', headers: ['Meetup', 'Responses', 'Overall', 'Talks', 'Organization'],
    rows: [...perEvent.map((e) => [e.label, String(e.n), e.overall.toFixed(2), e.talks.toFixed(2), e.org.toFixed(2)]), ['All', String(totalResponses), agg.overall.toFixed(2), agg.talks.toFixed(2), agg.org.toFixed(2)]], highlightLast: true }), path.join(OUT, 'scores-table.png'));

  const STOP = new Set(('the a an and or to of in for on with is are was be it we you they i me my more about how what why some most very our your their them then than this that these those at as by from so if not no yes can could would should will just like also un ir ar uz no par ka kā jo bet vai tā to ko kas ļoti vairāk bija būtu lai gan kad kur').split(/\s+/));
  const freq = (t) => { const c = {}; for (const w of t.toLowerCase().match(/[\p{L}][\p{L}\-']{2,}/gu) || []) { if (!STOP.has(w)) c[w] = (c[w] || 0) + 1; } return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 120); };
  let wordclouds = true;
  try {
    const wcPath = createRequire(import.meta.url).resolve('wordcloud');
    await withPage(async (page) => {
      for (const [words, file] of [[freq(topicsText), 'wordcloud-topics.png'], [freq(commentsText), 'wordcloud-comments.png']]) {
        if (!words.length) continue;
        const W = 1200, H = 700, max = words[0][1];
        await page.setViewportSize({ width: W, height: H });
        await page.setContent(`<!doctype html><html><body style="margin:0;background:#fff"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`, { waitUntil: 'load' });
        await page.addScriptTag({ path: wcPath });
        await page.evaluate(({ words, max }) => new Promise((resolve) => {
          const c = document.getElementById('c');
          c.addEventListener('wordcloudstop', () => resolve(), { once: true });
          window.WordCloud(c, { list: words, gridSize: 12, rotateRatio: 0.3, shuffle: false, fontFamily: 'Helvetica, Arial, sans-serif', backgroundColor: '#ffffff', weightFactor: (n) => 14 + (n / max) * 80, color: () => ['#8b1538', '#d4567c', '#a83356', '#6f1230'][Math.floor(Math.random() * 4)] });
          setTimeout(resolve, 8000);
        }), { words, max });
        await page.waitForTimeout(150);
        await writeFile(path.join(OUT, file), await (await page.$('#c')).screenshot({ type: 'png' }));
      }
    });
  } catch { wordclouds = false; }

  const md = `# Cloud Native Latvia — feedback report

_Generated from R2 \`feedback/<slug>.csv\`. Curated per-speaker notes are kept separately._

- **Responses:** ${totalResponses} across ${perEvent.length} meetups
- **Overall:** ${agg.overall.toFixed(2)} / 5 · **Talks:** ${agg.talks.toFixed(2)} · **Organization:** ${agg.org.toFixed(2)}

| Meetup | Responses | Overall | Talks | Organization |
|---|---:|---:|---:|---:|
${perEvent.map((e) => `| ${e.label} | ${e.n} | ${e.overall.toFixed(2)} | ${e.talks.toFixed(2)} | ${e.org.toFixed(2)} |`).join('\n')}
| **All** | **${totalResponses}** | **${agg.overall.toFixed(2)}** | **${agg.talks.toFixed(2)}** | **${agg.org.toFixed(2)}** |

![Scores table](scores-table.png)
![Ratings by meetup](ratings-by-meetup.png)
![Responses by meetup](responses-by-meetup.png)
![Overall distribution](overall-distribution.png)
${wordclouds ? '\n![Topics](wordcloud-topics.png)\n![Comments](wordcloud-comments.png)\n' : ''}`;
  await writeFile(path.join(OUT, 'feedback-summary.md'), md);
  return { responses: totalResponses, meetups: perEvent.length, overall: agg.overall, wordclouds };
}
