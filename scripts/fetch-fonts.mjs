// Download the self-hosted web fonts into public/fonts/ (latin + latin-ext
// subsets, which cover English + Latvian diacritics). Run with: npm run fetch:fonts
//
// Noto Sans is the site font (wired up in src/index.css); Lexend is the opening
// deck font (wired up in src/artifacts/htmlDeck.js). Both are SIL OFL licensed.
// Re-run this if you need to refresh the files or add a subset/family.
import { mkdir, writeFile } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const OUT = 'public/fonts';
const KEEP = new Set(['latin', 'latin-ext']);

const TARGETS = [
  { slug: 'lexend', family: 'Lexend', url: 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap' },
  { slug: 'noto-sans', family: 'Noto Sans', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap' },
];

await mkdir(OUT, { recursive: true });

for (const t of TARGETS) {
  const css = await (await fetch(t.url, { headers: { 'User-Agent': UA } })).text();
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const subset = m[1];
    if (!KEEP.has(subset)) continue;
    const block = m[2];
    const style = /font-style:\s*italic/.test(block) ? 'italic' : 'normal';
    const src = (block.match(/url\(([^)]+)\)/) || [])[1];
    const file = `${t.slug}${style === 'italic' ? '-italic' : ''}-${subset}.woff2`;
    const buf = Buffer.from(await (await fetch(src, { headers: { 'User-Agent': UA } })).arrayBuffer());
    await writeFile(`${OUT}/${file}`, buf);
    console.log(`saved ${file} (${(buf.length / 1024).toFixed(1)} KB)`);
  }
}
