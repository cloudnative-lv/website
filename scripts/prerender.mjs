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

// Cache-busting version stamped onto the social-preview image URLs (og:image /
// twitter:image) baked below. LinkedIn (and other crawlers) cache a scraped image
// by URL and will NOT re-fetch it on re-scrape unless the URL changes — so when we
// regenerate an artifact at the same path, an old downscaled copy keeps showing.
// A per-build token gives every deploy a fresh image URL, so crawlers always
// re-fetch at full resolution. Static hosting ignores the query string, so the
// file still resolves. Override with BUILD_ID for reproducible output.
const BUILD_ID = process.env.BUILD_ID || Date.now().toString(36);
const withVersion = (url) => (url ? `${url}${url.includes('?') ? '&' : '?'}v=${BUILD_ID}` : url);

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
  const imageV = withVersion(m.image);
  repl(/(<meta property="og:image" content=")[^"]*(")/, imageV);
  repl(/(<meta name="twitter:title" content=")[^"]*(")/, m.title);
  repl(/(<meta name="twitter:description" content=")[^"]*(")/, m.description);
  repl(/(<meta name="twitter:image" content=")[^"]*(")/, imageV);
  repl(/(<link rel="canonical" href=")[^"]*(")/, m.url);
  // Replace the property meta if present in the template, else append it (the static
  // <head> has og:type but not og:image:width/height or article:published_time).
  const setMeta = (prop, val) => {
    const re = new RegExp(`(<meta property="${prop}" content=")[^"]*(")`);
    out = re.test(out)
      ? out.replace(re, (_, p1, p2) => `${p1}${esc(val)}${p2}`)
      : out.replace('</head>', `    <meta property="${prop}" content="${esc(val)}" />\n  </head>`);
  };
  setMeta('og:type', m.type || 'website');
  setMeta('og:image:width', m.imageWidth || '1200');
  setMeta('og:image:height', m.imageHeight || '630');
  if (m.published) setMeta('article:published_time', m.published);
  // Bake the route's JSON-LD (Organization/Event/Talk/Person/Breadcrumb …) into the
  // static <head> so crawlers that don't run JS still see the structured data.
  if (m.jsonld?.length) {
    const scripts = m.jsonld.map((j) => `<script type="application/ld+json">${j}</script>`).join('\n');
    out = out.replace('</head>', `${scripts}\n</head>`);
  }
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage();

// Route list: static pages + every event detail page. (page.$eval is Playwright's
// DOM API — it runs the callback in the page and returns text; not JavaScript
// eval. The text is parsed with JSON.parse, never executed.)
await page.goto(`${BASE}/kit/manifest`, { waitUntil: 'networkidle' });
const { events } = JSON.parse(await page.$eval('[data-manifest]', (el) => el.textContent));

const routes = ['/', '/events', '/speakers', '/team', '/swag', '/sponsors', '/privacy', '/brand',
  ...events.flatMap((e) => [
    `/events/${e.slug}`,
    ...(e.talks || []).map((talkSlug) => `/events/${e.slug}/talks/${talkSlug}`),
  ]),
];

let done = 0;
// Collect every prerendered URL so the XML sitemap lists exactly what we ship —
// same source of truth as the static HTML, so the route list can't drift.
const sitemap = [];
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
      type: g('meta[property="og:type"]'),
      imageWidth: g('meta[property="og:image:width"]'),
      imageHeight: g('meta[property="og:image:height"]'),
      published: g('meta[property="article:published_time"]'),
      jsonld: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent),
    };
  });
  const dir = route === '/' ? DIST : path.join(DIST, route);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), inject(template, meta));
  if (meta.url) sitemap.push({ loc: meta.url, lastmod: (meta.published || '').slice(0, 10) });
  done += 1;
  console.log(`✓ ${route} → og:image ${meta.image.replace(/^https?:\/\/[^/]+/, '')}`);
}

// Write the XML sitemap from the URLs collected above (lastmod only where the route
// exposes a publish date, e.g. event/talk pages — Google ignores an empty one).
const urls = sitemap
  .map(({ loc, lastmod }) =>
    `  <url>\n    <loc>${esc(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`)
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
await writeFile(path.join(DIST, 'sitemap.xml'), xml);
console.log(`✓ sitemap.xml (${sitemap.length} urls)`);

await browser.close();
console.log(`\nprerendered ${done} routes`);
