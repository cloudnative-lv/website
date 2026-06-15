// Generate an RSS 2.0 feed from event YAML files.
// Run after `npm run build`:  node scripts/generate-rss.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const SITE = 'https://cloudnative.lv';
const EVENTS_DIR = path.resolve('src/data/events');
const DIST = path.resolve('dist');

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const events = readdirSync(EVENTS_DIR)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => yaml.load(readFileSync(path.join(EVENTS_DIR, f), 'utf8')))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

// Date of the last Sunday of `month` (0-indexed) in year `y` — EU DST switches then.
const lastSunday = (y, month) => {
  const last = new Date(Date.UTC(y, month + 1, 0));
  return last.getUTCDate() - last.getUTCDay();
};
const rfc822 = (date, time = '18:00') => {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  // Riga: EEST (UTC+3) from the last Sunday of March to the last Sunday of October, else EET (UTC+2).
  const afterMar = m > 3 || (m === 3 && d >= lastSunday(y, 2));
  const beforeOct = m < 10 || (m === 10 && d < lastSunday(y, 9));
  const offset = afterMar && beforeOct ? 3 : 2;
  const dt = new Date(Date.UTC(y, m - 1, d, hh - offset, mm));
  return dt.toUTCString();
};

const items = events.map((e) => {
  const link = `${SITE}/events/${e.slug}`;
  const talks = (e.talks || [])
    .map((t) => `• ${t.title}${t.speaker ? ` — ${t.speaker}` : t.speakers ? ` — ${t.speakers.join(', ')}` : ''}`)
    .join('\n');
  const description = [e.description || '', talks].filter(Boolean).join('\n\n');
  const tags = (e.tags || []).map((t) => `    <category>${esc(t)}</category>`).join('\n');

  return `  <item>
    <title>${esc(e.title)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <pubDate>${rfc822(e.date, e.time || '18:00')}</pubDate>
    <description>${esc(description)}</description>
${tags}
  </item>`;
}).join('\n');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Cloud Native Latvia — Events</title>
  <link>${SITE}/events</link>
  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Meetups exploring Kubernetes, DevOps, platform engineering, and cloud native technologies in Riga, Latvia.</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <image>
    <url>${SITE}/images/logo.svg</url>
    <title>Cloud Native Latvia</title>
    <link>${SITE}</link>
  </image>
${items}
</channel>
</rss>
`;

mkdirSync(DIST, { recursive: true });
writeFileSync(path.join(DIST, 'feed.xml'), feed);
console.log(`✓ feed.xml (${events.length} events)`);
