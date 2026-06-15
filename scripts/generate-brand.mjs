// Generate monochrome logo variants from the brand source SVGs into
// public/images/brand/. The /brand page links to these + the existing colour SVGs.
// Run once and commit the output (brand assets are stable):  npm run generate:brand
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'public/images';
const OUT = 'public/images/brand';
await mkdir(OUT, { recursive: true });

// Recolour the cube/cloud faces to one tone, but KEEP the flag slit (the cube's
// red-white-red stripe) contrasting so the Latvian flag stays recognisable:
//   mono-black: dark mark, white flag stripe (the #ffffff stripe is left untouched).
//   mono-white: white mark, dark flag stripe.
const monoBlack = (svg) => svg.replace(/#cd4a77/gi, '#1a1a1a').replace(/#9c213b/gi, '#1a1a1a');
const monoWhite = (svg) => {
  const TMP = '#012345'; // park the stripe so the faces→white swap doesn't catch it
  return svg
    .replace(/#ffffff/gi, TMP).replace(/fill="white"/gi, `fill="${TMP}"`)
    .replace(/#cd4a77/gi, '#ffffff').replace(/#9c213b/gi, '#ffffff')
    .replaceAll(TMP, '#1a1a1a');
};

const sources = [
  { src: 'logo.svg', name: 'logo-mark' },
  { src: 'logo-horizontal.svg', name: 'logo-horizontal' },
];

for (const s of sources) {
  const svg = await readFile(path.join(SRC, s.src), 'utf8');
  await writeFile(path.join(OUT, `${s.name}-mono-black.svg`), monoBlack(svg));
  await writeFile(path.join(OUT, `${s.name}-mono-white.svg`), monoWhite(svg));
  console.log(`✓ ${s.name}-mono-black.svg + ${s.name}-mono-white.svg`);
}
// Riga skyline illustration used across the banners — copy to a public path so the
// /brand page can preview + offer it for download.
try {
  await copyFile('src/artifacts/assets/skyline.svg', path.join(OUT, 'skyline.svg'));
  console.log('✓ skyline.svg');
} catch (err) {
  console.warn(`skyline copy skipped: ${err.message}`);
}

console.log(`\nbrand variants → ${OUT}`);
