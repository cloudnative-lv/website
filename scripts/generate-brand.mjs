// Generate monochrome logo variants from the brand source SVGs into
// public/images/brand/. The /brand page links to these + the existing colour SVGs.
// Run once and commit the output (brand assets are stable):  npm run generate:brand
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'public/images';
const OUT = 'public/images/brand';
await mkdir(OUT, { recursive: true });

// Recolour the cube/cloud faces to one tone, but keep the Latvian flag recognisable.
// The flag's three cube-face bands carry class hooks in the source SVGs:
// `flag-stripe-center` is the white middle band, `flag-stripe-side` the two carmine
// bands above/below it.
//   mono-black: dark mark on light; the carmine sides go dark and the white middle band
//     stays white — reads as carmine/white/carmine.
//   mono-white: white mark on dark; the middle band stays WHITE while the two side bands
//     go TRANSPARENT, so the dark background shows through as the carmine stripes — a
//     recognisable flag in negative (white centre, open edges).
const setFillByClass = (svg, cls, fill) =>
  svg.replace(/<path\b[\s\S]*?\/>/g, (el) =>
    el.includes(`"${cls}"`) ? el.replace(/fill="[^"]*"/i, `fill="${fill}"`) : el);

const monoBlack = (svg) => svg.replace(/#cd4a77/gi, '#1a1a1a').replace(/#9c213b/gi, '#1a1a1a');
const monoWhite = (svg) => {
  const TMP = '#012345'; // park existing whites so the faces→white swap doesn't catch them
  let out = svg
    .replace(/#ffffff/gi, TMP).replace(/fill="white"/gi, `fill="${TMP}"`)
    .replace(/#cd4a77/gi, '#ffffff').replace(/#9c213b/gi, '#ffffff')
    .replaceAll(TMP, '#1a1a1a');
  out = setFillByClass(out, 'flag-stripe-center', '#ffffff'); // middle band stays white
  out = setFillByClass(out, 'flag-stripe-side', 'none');      // side bands transparent
  return out;
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
// Riga skyline illustrations used across the banners — copy to a public path so the
// /brand page can preview + offer them for download (detailed + the simple silhouette).
try {
  await copyFile('src/artifacts/assets/skyline.svg', path.join(OUT, 'skyline.svg'));
  await copyFile('src/artifacts/assets/skyline-simple.svg', path.join(OUT, 'skyline-simple.svg'));
  console.log('✓ skyline.svg + skyline-simple.svg');
} catch (err) {
  console.warn(`skyline copy skipped: ${err.message}`);
}

console.log(`\nbrand variants → ${OUT}`);
