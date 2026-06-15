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
import { renderInfographics } from './infographics.mjs';

// The "community" stat on the infographics is the unique people across our owned channels
// — LinkedIn followers + Eventbrite + OCG attendees — name-deduped (the only field common
// to all three; see the report's cross-channel note). Email-campaign (zoho) and web signups
// are excluded.
const COMMUNITY_SOURCES = new Set(['linkedin', 'eventbrite', 'ocg']);

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
// eventMeta: Map(slug -> {date, attendance, speakers}) — date enriches labels; attendance
// (event-photo head-count) + speakers drive the community actual-attendance comparison.
export async function renderCommunityReport({ crmRows, rostersBySlug, eventMeta = new Map(), OUT }) {
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

  // No CRM "growth over time" chart: `added` is the import date for every bulk-imported
  // contact (Zoho / LinkedIn / OCG all landed on the retrofit date), so a cumulative curve
  // is fiction — it shows ~everyone "joining" in one month. Registrations-per-event below is
  // the real temporal signal.

  const attendeeId = (a) => {
    const email = lower(a.email || '');
    const name = norm(a.name || '');
    return email || (name ? `name:${lower(transliterate(name))}` : '');
  };
  const fmtDate = (slug) => {
    const d = eventMeta.get(slug)?.date;
    if (!d) return '';
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  // Organizers + each event's speakers aren't "community" attendees — exclude them from
  // both sides (registrations and actual attendance) so the comparison is community-to-
  // community. Organizers attend every event; speakers are present for the event they speak at.
  const stripDiacritics = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const normName = (s) => stripDiacritics(lower(transliterate(norm(s))));
  const ORG = new Set(['andrey adamovich', 'linda arende', 'lena adamovich']);
  // Speakers that aren't already organizers (so org-speakers like Linda@#2 / Andrey@#6
  // aren't subtracted twice).
  const speakersNotOrg = (slug) => (eventMeta.get(slug)?.speakers || []).map(normName).filter((n) => !ORG.has(n));

  // Per-event roster with organizers and that event's speakers removed (matched by name).
  const communityRosters = new Map();
  for (const [slug, roster] of rostersBySlug) {
    const exclude = new Set([...ORG, ...speakersNotOrg(slug)]);
    communityRosters.set(slug, roster.filter((a) => { const nm = normName(a.name || ''); return !nm || !exclude.has(nm); }));
  }

  // Actual community attendance = event-photo head-count + 1 (organizer behind the camera)
  // − 3 organizers − the event's non-organizer speakers (present regardless of registration).
  const actualOf = (slug) => {
    const a = eventMeta.get(slug)?.attendance;
    return Number.isFinite(a) ? Math.max(0, (a + 1) - 3 - speakersNotOrg(slug).length) : null;
  };

  // --- Per-event analysis (community only) ---
  const perEvent = [];
  const eventsByAttendee = new Map();
  const nameByAttendee = new Map();
  for (const [slug, roster] of communityRosters) {
    let n = 0;
    for (const a of roster) {
      const id = attendeeId(a);
      if (!id) continue;
      if (!eventsByAttendee.has(id)) eventsByAttendee.set(id, new Set());
      eventsByAttendee.get(id).add(shortLabel(slug));
      const name = norm(a.name || '');
      if (name && !nameByAttendee.has(id)) nameByAttendee.set(id, name);
      n++;
    }
    perEvent.push({ label: shortLabel(slug), slug, n });
  }
  const totalRegistrations = perEvent.reduce((a, e) => a + e.n, 0);
  const avgRegistrations = perEvent.length ? totalRegistrations / perEvent.length : 0;
  const uniqueAttendees = eventsByAttendee.size;
  const eventsPer = [...eventsByAttendee.values()].map((s) => s.size);
  const maxEv = Math.min(6, Math.max(1, ...eventsPer, 1));
  const repeatLabels = Array.from({ length: maxEv }, (_, i) => (i + 1 < 6 ? String(i + 1) : '6+'));
  const repeatDist = repeatLabels.map((lab, i) => eventsPer.filter((v) => (lab === '6+' ? v >= 6 : v === i + 1)).length);
  const repeatAttendees = eventsPer.filter((v) => v >= 2).length;

  // --- New vs returning per event ---
  const seenBefore = new Set();
  const newVsReturn = [];
  for (const [slug, roster] of communityRosters) {
    const currentIds = new Set();
    let newCount = 0, retCount = 0;
    for (const a of roster) {
      const id = attendeeId(a);
      if (!id) continue;
      currentIds.add(id);
      if (seenBefore.has(id)) retCount++;
      else newCount++;
    }
    newVsReturn.push({ label: shortLabel(slug), new: newCount, returning: retCount });
    for (const id of currentIds) seenBefore.add(id);
  }

  // --- Retention between consecutive events ---
  const eventIdSets = [];
  for (const [slug, roster] of communityRosters) {
    const ids = new Set();
    for (const a of roster) { const id = attendeeId(a); if (id) ids.add(id); }
    eventIdSets.push({ label: shortLabel(slug), ids });
  }
  const retention = [];
  for (let i = 1; i < eventIdSets.length; i++) {
    const prev = eventIdSets[i - 1], curr = eventIdSets[i];
    const retained = [...prev.ids].filter((id) => curr.ids.has(id)).length;
    retention.push({ from: prev.label, to: curr.label, retained, prevSize: prev.ids.size, rate: prev.ids.size ? retained / prev.ids.size : 0 });
  }

  // --- Top fans with per-event attendance grid (organizers + speakers already removed) ---
  const allEventLabels = perEvent.map((e) => e.label);
  const topFans = [...eventsByAttendee.entries()]
    .map(([id, set]) => ({ name: nameByAttendee.get(id) || id, count: set.size, attended: new Set(set) }))
    .filter((f) => f.count >= 2)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 15);

  // --- Charts ---
  await svgToPng(barsSvg({ title: 'Contacts by source', groups: sources.map(([s]) => s), series: [{ name: 'contacts', color: SERIES_COLORS[0], values: sources.map(([, n]) => n) }] }), path.join(OUT, 'by-source.png'));
  await svgToPng(barsSvg({ title: 'Contactability', groups: ['CRM rows', 'unique', 'with email', 'with LinkedIn'], series: [{ name: 'contacts', color: SERIES_COLORS[1], values: [total, uniquePeople, withEmail, withLinkedin] }], width: 980 }), path.join(OUT, 'contactability.png'));
  const hasActual = perEvent.some((e) => actualOf(e.slug) != null);
  if (perEvent.length) {
    await svgToPng(barsSvg({ title: 'Registrations per event', groups: perEvent.map((e) => e.label), series: [{ name: 'registrations', color: SERIES_COLORS[0], values: perEvent.map((e) => e.n) }] }), path.join(OUT, 'registrations-by-event.png'));
    if (hasActual) {
      await svgToPng(barsSvg({ title: 'Registered vs actual attendance', groups: perEvent.map((e) => e.label), series: [
        { name: 'registered', color: SERIES_COLORS[0], values: perEvent.map((e) => e.n) },
        { name: 'actual', color: SERIES_COLORS[1], values: perEvent.map((e) => actualOf(e.slug) ?? 0) },
      ] }), path.join(OUT, 'registered-vs-actual.png'));
    }
    if (newVsReturn.length) {
      await svgToPng(barsSvg({ title: 'New vs returning attendees', groups: newVsReturn.map((e) => e.label), series: [
        { name: 'new', color: SERIES_COLORS[0], values: newVsReturn.map((e) => e.new) },
        { name: 'returning', color: SERIES_COLORS[1], values: newVsReturn.map((e) => e.returning) },
      ] }), path.join(OUT, 'new-vs-returning.png'));
    }
    await svgToPng(barsSvg({ title: 'Events attended per person', groups: repeatLabels.map((l) => `${l} event${l === '1' ? '' : 's'}`), series: [{ name: 'people', color: SERIES_COLORS[1], values: repeatDist }] }), path.join(OUT, 'repeat-registrations.png'));
    if (retention.length) {
      await svgToPng(barsSvg({ title: 'Retention rate (event to event)', groups: retention.map((r) => `${r.from}\u2009\u2192\u2009${r.to}`), series: [
        { name: 'rate %', color: SERIES_COLORS[0], values: retention.map((r) => +(r.rate * 100).toFixed(0)) },
      ], yMax: 100, fmt: (v) => `${Math.round(v)}%` }), path.join(OUT, 'retention.png'));
    }
    if (topFans.length) {
      const fansCols = [4, 1.5, ...allEventLabels.map(() => 1)];
      await svgToPng(tableSvg({ title: 'Most active community members', headers: ['Person', 'Events', ...allEventLabels],
        rows: topFans.map((f) => [f.name, String(f.count), ...allEventLabels.map((l) => f.attended.has(l) ? '\u25CF' : '\u2013')]),
        colWeights: fansCols }), path.join(OUT, 'active-fans-table.png'));
    }
  }

  // --- Community infographics (share cards) ---
  let igSpeakers = 0, igTalks = 0;
  for (const m of eventMeta.values()) { igSpeakers += (m.speakers || []).length; igTalks += (m.talks || 0); }
  // Unique followers/attendees across LinkedIn + Eventbrite + OCG, deduped by name (the
  // field common to all three; falls back to email/linkedin when there's no full name).
  const communityKey = (r) => { const n = normName(`${r.first} ${r.last}`); return n.includes(' ') ? n : (lower(r.email) || r.linkedin || ''); };
  const community = new Set(crmRows.filter((r) => COMMUNITY_SOURCES.has(r.source)).map(communityKey).filter(Boolean)).size;
  const igStats = [
    { value: String(community), label: 'COMMUNITY' },
    { value: String(eventMeta.size), label: 'EVENTS' },
    { value: String(igSpeakers), label: 'SPEAKERS' },
    { value: String(igTalks), label: 'TALKS' },
  ];
  const infographics = eventMeta.size ? await renderInfographics({ stats: igStats, OUT }).catch(() => []) : [];

  // --- Markdown report ---
  const pct = (n, d = total) => `${Math.round((n / (d || 1)) * 100)}%`;
  const genDate = new Date().toISOString().slice(0, 10);

  const retentionBlock = retention.length ? `
### Retention

Event-to-event retention: what share of attendees from one event register for the next.

| Transition | Prev | Retained | Rate |
|---|---:|---:|---:|
${retention.map((r) => `| ${r.from} \u2192 ${r.to} | ${r.prevSize} | ${r.retained} | ${(r.rate * 100).toFixed(0)}% |`).join('\n')}

![Retention](retention.png)
` : '';

  const fansBlock = topFans.length ? `
### Most active community members (\u22652 events)

| Person | Events | ${allEventLabels.join(' | ')} |
|---|---:|${allEventLabels.map(() => ':---:').join('|')}|
${topFans.map((f) => `| ${f.name} | ${f.count} | ${allEventLabels.map((l) => f.attended.has(l) ? '\u25CF' : '\u2013').join(' | ')} |`).join('\n')}

![Active community members](active-fans-table.png)
` : '';

  const eventsWithActual = perEvent.filter((e) => actualOf(e.slug) != null);
  const totalActual = eventsWithActual.reduce((a, e) => a + actualOf(e.slug), 0);
  const showupRates = eventsWithActual.filter((e) => e.n).map((e) => actualOf(e.slug) / e.n);
  const avgShowup = showupRates.length ? showupRates.reduce((a, b) => a + b, 0) / showupRates.length : 0;

  const regHeader = hasActual
    ? '| Event | Date | Registered | Actual | Show-up | New | Returning |\n|---|---|---:|---:|---:|---:|---:|'
    : '| Event | Date | Registered | New | Returning |\n|---|---|---:|---:|---:|';
  const regRow = (e, i) => {
    const actual = actualOf(e.slug);
    const mid = hasActual
      ? ` ${actual ?? '\u2013'} | ${actual != null && e.n ? `${Math.round((actual / e.n) * 100)}%` : '\u2013'} |`
      : '';
    return `| ${e.label} | ${fmtDate(e.slug)} | ${e.n} |${mid} ${newVsReturn[i]?.new ?? '\u2013'} | ${newVsReturn[i]?.returning ?? '\u2013'} |`;
  };

  const regBlock = perEvent.length ? `
## Registrations

_Community only \u2014 the 3 organizers (Andrey, Linda, Lena Adamovich) and each event's
speakers are excluded from both registrations and actual attendance._

- **Total registrations:** ${totalRegistrations} across ${perEvent.length} events
- **Average per event:** ${avgRegistrations.toFixed(1)}
- **Unique attendees:** ${uniqueAttendees}
- **Repeat attendees (\u22652 events):** ${repeatAttendees} (${pct(repeatAttendees, uniqueAttendees)} of attendees)
${hasActual ? `- **Actual community attendance:** ${totalActual} across ${eventsWithActual.length} events \u00b7 avg show-up ${Math.round(avgShowup * 100)}% of registrations\n` : ''}
${regHeader}
${perEvent.map(regRow).join('\n')}
${hasActual ? '\n> Actual = event-photo head-count + 1 (organizer behind the camera) \u2212 3 organizers \u2212 the event\'s non-organizer speakers. Registered = roster with the same people removed.\n' : ''}
![Registrations per event](registrations-by-event.png)
${hasActual ? '![Registered vs actual attendance](registered-vs-actual.png)\n' : ''}![New vs returning](new-vs-returning.png)
![Events attended per person](repeat-registrations.png)
${retentionBlock}${fansBlock}` : '\n_No per-event rosters yet._\n';

  const infographicsBlock = infographics.length ? `
## Community infographics

Share cards (${community} community \u00b7 ${eventMeta.size} events \u00b7 ${igSpeakers} speakers \u00b7 ${igTalks} talks) \u2014 pick the format that fits the channel.

${infographics.map((f) => `![${f.replace(/community-|\.png/g, '')}](${f})`).join('\n')}
` : '';

  const md = `# Cloud Native Latvia \u2014 community & registrations report

_Generated ${genDate} from R2 \`subscribers.csv\` + \`attendees/<slug>.csv\`._

## Community

- **Community size (unique people):** ${uniquePeople}
- **CRM rows (all source touchpoints):** ${total}
- **Duplicate contacts (same person across sources):** ${duplicateContacts} (${pct(duplicateContacts)}) \u2014 reconcile with \`npm run crm:cleanup\`
- **With email:** ${withEmail} (${pct(withEmail)}) \u00B7 **With LinkedIn:** ${withLinkedin} (${pct(withLinkedin)})

### By source

| Source | Contacts |
|---|---:|
${sources.map(([s, n]) => `| ${s} | ${n} |`).join('\n')}

![By source](by-source.png)
![Contactability](contactability.png)
${infographicsBlock}${regBlock}`;
  await writeFile(path.join(OUT, 'community-report.md'), md);
  return { total, uniquePeople, totalRegistrations, repeatAttendees, sources: sources.length };
}

// feedbackBySlug: Map(slug -> rows[] from parseFeedbackCsv) in chronological order
// eventMeta: Map(slug -> {date}) — optional, enriches labels with dates
// rostersBySlug: Map(slug -> [{email,name}]) — optional, for response-rate calculation
export async function renderFeedbackReport({ feedbackBySlug, eventMeta = new Map(), rostersBySlug = new Map(), OUT }) {
  await mkdir(OUT, { recursive: true });
  const perEvent = [];
  const dist = [0, 0, 0, 0, 0];
  let topicsText = '', commentsText = '';
  const perEventText = [];
  for (const [slug, rows] of feedbackBySlug) {
    if (!rows.length) continue;
    const valid = (k) => rows.map((r) => r[k]).filter((v) => v >= 1 && v <= 5);
    for (const v of valid('overall')) dist[v - 1] += 1;
    const topics = [], comments = [];
    for (const r of rows) {
      topicsText += ' ' + r.topics; commentsText += ' ' + r.comments;
      if (r.topics.trim()) topics.push(r.topics.trim());
      if (r.comments.trim()) comments.push(r.comments.trim());
    }
    const registered = rostersBySlug.get(slug)?.length ?? 0;
    perEvent.push({ label: shortLabel(slug), slug, n: rows.length, registered, overall: avg(valid('overall')), talks: avg(valid('talks')), org: avg(valid('organization')) });
    perEventText.push({ label: shortLabel(slug), topics, comments });
  }
  if (!perEvent.length) return { responses: 0, meetups: 0 };
  const totalResponses = perEvent.reduce((a, e) => a + e.n, 0);
  const wmean = (k) => { let s = 0, w = 0; for (const e of perEvent) if (e[k]) { s += e[k] * e.n; w += e.n; } return w ? s / w : 0; };
  const agg = { overall: wmean('overall'), talks: wmean('talks'), org: wmean('org') };
  const avgResponses = perEvent.length ? totalResponses / perEvent.length : 0;
  const hasRegistrations = perEvent.some((e) => e.registered > 0);

  const fmtDate = (slug) => {
    const d = eventMeta.get(slug)?.date;
    if (!d) return '';
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // --- Charts ---
  await svgToPng(barsSvg({ title: 'Ratings by meetup', groups: perEvent.map((e) => e.label), series: [
    { name: 'overall', color: SERIES_COLORS[0], values: perEvent.map((e) => +e.overall.toFixed(2)) },
    { name: 'talks', color: SERIES_COLORS[1], values: perEvent.map((e) => +e.talks.toFixed(2)) },
    { name: 'organization', color: SERIES_COLORS[2], values: perEvent.map((e) => +e.org.toFixed(2)) },
  ], yMax: 5, fmt: (v) => v.toFixed(1) }), path.join(OUT, 'ratings-by-meetup.png'));
  await svgToPng(barsSvg({ title: 'Responses by meetup', groups: perEvent.map((e) => e.label), series: [{ name: 'responses', color: SERIES_COLORS[0], values: perEvent.map((e) => e.n) }] }), path.join(OUT, 'responses-by-meetup.png'));
  await svgToPng(barsSvg({ title: 'Overall rating distribution', groups: ['1', '2', '3', '4', '5'], series: [{ name: 'responses', color: SERIES_COLORS[1], values: dist }] }), path.join(OUT, 'overall-distribution.png'));
  if (perEvent.length >= 2) {
    await svgToPng(lineSvg({ title: 'Overall score trend', points: perEvent.map((e) => ({ label: e.label, value: +e.overall.toFixed(2) })), yLabel: 'score', fmt: (v) => v.toFixed(1) }), path.join(OUT, 'score-trend.png'));
  }
  const tableHeaders = hasRegistrations ? ['Meetup', 'Date', 'Responses', 'Rate', 'Overall', 'Talks', 'Org'] : ['Meetup', 'Date', 'Responses', 'Overall', 'Talks', 'Org'];
  const tableRows = perEvent.map((e) => {
    const base = [e.label, fmtDate(e.slug)];
    if (hasRegistrations) base.push(String(e.n), e.registered ? `${Math.round((e.n / e.registered) * 100)}%` : '\u2013');
    else base.push(String(e.n));
    return [...base, e.overall.toFixed(2), e.talks.toFixed(2), e.org.toFixed(2)];
  });
  const totalRow = hasRegistrations
    ? ['All', '', String(totalResponses), '', agg.overall.toFixed(2), agg.talks.toFixed(2), agg.org.toFixed(2)]
    : ['All', '', String(totalResponses), agg.overall.toFixed(2), agg.talks.toFixed(2), agg.org.toFixed(2)];
  await svgToPng(tableSvg({ title: 'Average scores by meetup', headers: tableHeaders,
    rows: [...tableRows, totalRow], highlightLast: true }), path.join(OUT, 'scores-table.png'));

  // --- Word clouds ---
  const STOP = new Set(('the a an and or to of in for on with is are was be it we you they i me my more about how what why some most very our your their them then than this that these those at as by from so if not no yes can could would should will just like also un ir ar uz no par ka k\u0101 jo bet vai t\u0101 to ko kas \u013Coti vair\u0101k bija b\u016Btu lai gan kad kur').split(/\s+/));
  const freq = (t) => { const c = {}; for (const w of t.toLowerCase().match(/[\p{L}][\p{L}\-']{2,}/gu) || []) { if (!STOP.has(w)) c[w] = (c[w] || 0) + 1; } return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 120); };
  const topicWords = freq(topicsText), commentWords = freq(commentsText);
  const cloudFiles = [];
  if (topicWords.length >= 3) cloudFiles.push([topicWords, 'wordcloud-topics.png']);
  if (commentWords.length >= 3) cloudFiles.push([commentWords, 'wordcloud-comments.png']);
  let wordclouds = cloudFiles.length > 0;
  if (wordclouds) {
    try {
      const wcPath = createRequire(import.meta.url).resolve('wordcloud');
      // One fresh page per cloud: wordcloud2.js leaves a per-canvas timer running, so a
      // second render in the same page can fire `wordcloudstop` immediately and come out blank.
      for (const [words, file] of cloudFiles) {
        await withPage(async (page) => {
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
        });
      }
    } catch { wordclouds = false; }
  }

  // --- Markdown ---
  const genDate = new Date().toISOString().slice(0, 10);
  const responseRateNote = hasRegistrations ? (() => {
    const withReg = perEvent.filter((e) => e.registered > 0);
    const avgRate = withReg.length ? withReg.reduce((a, e) => a + e.n / e.registered, 0) / withReg.length : 0;
    return ` \u00B7 **Avg response rate:** ${Math.round(avgRate * 100)}%`;
  })() : '';

  const mdTableHeaders = hasRegistrations
    ? '| Meetup | Date | Responses | Rate | Overall | Talks | Organization |\n|---|---|---:|---:|---:|---:|---:|'
    : '| Meetup | Date | Responses | Overall | Talks | Organization |\n|---|---|---:|---:|---:|---:|';
  const mdTableRow = (e) => {
    const rate = hasRegistrations ? (e.registered ? ` ${Math.round((e.n / e.registered) * 100)}% |` : ' \u2013 |') : '';
    return `| ${e.label} | ${fmtDate(e.slug)} | ${e.n} |${rate} ${e.overall.toFixed(2)} | ${e.talks.toFixed(2)} | ${e.org.toFixed(2)} |`;
  };
  const mdTotalRow = hasRegistrations
    ? `| **All** | | **${totalResponses}** | | **${agg.overall.toFixed(2)}** | **${agg.talks.toFixed(2)}** | **${agg.org.toFixed(2)}** |`
    : `| **All** | | **${totalResponses}** | **${agg.overall.toFixed(2)}** | **${agg.talks.toFixed(2)}** | **${agg.org.toFixed(2)}** |`;

  const textBlock = perEventText.some((e) => e.topics.length || e.comments.length) ? `
## Open-ended feedback

${perEventText.filter((e) => e.topics.length || e.comments.length).map((e) => `### ${e.label}
${e.topics.length ? `\n**Suggested topics:**\n${e.topics.map((t) => `- ${t}`).join('\n')}\n` : ''}${e.comments.length ? `\n**Comments:**\n${e.comments.map((c) => `- ${c}`).join('\n')}\n` : ''}`).join('\n')}` : '';

  const md = `# Cloud Native Latvia \u2014 feedback report

_Generated ${genDate} from R2 \`feedback/<slug>.csv\`._

## Summary

- **Responses:** ${totalResponses} across ${perEvent.length} meetups (avg ${avgResponses.toFixed(1)} per event)${responseRateNote}
- **Overall:** ${agg.overall.toFixed(2)} / 5 \u00B7 **Talks:** ${agg.talks.toFixed(2)} \u00B7 **Organization:** ${agg.org.toFixed(2)}

${mdTableHeaders}
${perEvent.map(mdTableRow).join('\n')}
${mdTotalRow}

![Scores table](scores-table.png)
![Ratings by meetup](ratings-by-meetup.png)
${perEvent.length >= 2 ? '![Score trend](score-trend.png)\n' : ''}![Responses by meetup](responses-by-meetup.png)
![Overall distribution](overall-distribution.png)
${wordclouds ? cloudFiles.map(([, f]) => `![${f.replace('.png', '').replace('wordcloud-', 'Word cloud: ')}](${f})`).join('\n') + '\n' : ''}${textBlock}`;
  await writeFile(path.join(OUT, 'feedback-summary.md'), md);
  return { responses: totalResponses, meetups: perEvent.length, overall: agg.overall, wordclouds };
}
