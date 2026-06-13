// Bake per-route SEO meta into static HTML so social crawlers (which don't run
// JS) see correct Open Graph previews. For each route we load the built SPA, let
// its own SEO component set the meta, read it back, and write a route-specific
// dist/<route>/index.html. Zero duplication of SEO logic — the app stays the
// single source of truth.
//
// Run after `npm run build` + generate, against the preview server:
//   ARTIFACT_BASE=http://localhost:4173 node scripts/prerender.mjs
import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.ARTIFACT_BASE || 'http://localhost:4173';
const DIST = path.resolve('dist');

const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inject(html, m) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(m.title)}</title>`);
  const repl = (re, val) => { out = out.replace(re, (_, p1, p2) => `${p1}${esc(val)}${p2}`); };
  repl(/(<meta name="title" content=")[^"]*(")/, m.title);
  repl(/(<meta name="description" content=")[^"]*(")/, m.description);
  repl(/(<meta property="og:title" content=")[^"]*(")/, m.title);
  repl(/(<meta property="og:description" content=")[^"]*(")/, m.description);
  repl(/(<meta property="og:url" content=")[^"]*(")/, m.url);
  repl(/(<meta property="og:image" content=")[^"]*(")/, m.image);
  repl(/(<meta name="twitter:title" content=")[^"]*(")/, m.title);
  repl(/(<meta name="twitter:description" content=")[^"]*(")/, m.description);
  repl(/(<meta name="twitter:image" content=")[^"]*(")/, m.image);
  repl(/(<link rel="canonical" href=")[^"]*(")/, m.url);
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage();

// Route list: static pages + every event detail page. (page.$eval is Playwright's
// DOM API — it runs the callback in the page and returns text; not JavaScript
// eval. The text is parsed with JSON.parse, never executed.)
await page.goto(`${BASE}/kit/manifest`, { waitUntil: 'networkidle' });
const { events } = JSON.parse(await page.$eval('[data-manifest]', (el) => el.textContent));
const routes = ['/', '/events', '/speakers', '/team', '/swag', '/sponsors',
  ...events.flatMap((e) => [
    `/events/${e.slug}`,
    ...(e.talks || []).map((talkSlug) => `/events/${e.slug}/talks/${talkSlug}`),
  ]),
];

let done = 0;
for (const route of routes) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300); // let the SEO effect set route-specific meta
  const meta = await page.evaluate(() => {
    const g = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) || '';
    return {
      title: document.title,
      description: g('meta[name="description"]'),
      url: g('link[rel="canonical"]', 'href') || g('meta[property="og:url"]'),
      image: g('meta[property="og:image"]'),
    };
  });
  const dir = route === '/' ? DIST : path.join(DIST, route);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), inject(template, meta));
  done += 1;
  console.log(`✓ ${route} → og:image ${meta.image.replace(/^https?:\/\/[^/]+/, '')}`);
}

await browser.close();
console.log(`\nprerendered ${done} routes`);
