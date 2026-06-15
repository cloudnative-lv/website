// Generate monochrome logo variants from the brand source SVGs into
// public/images/brand/. The /brand page links to these + the existing colour SVGs.
// Run once and commit the output (brand assets are stable):  npm run generate:brand
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'public/images';
const OUT = 'public/images/brand';
await mkdir(OUT, { recursive: true });

// Flatten every fill (pink #cd4a77, burgundy #9c213b, white highlight) to one colour
// → a clean single-colour silhouette of the mark / lockup.
const monoize = (svg, color) => svg
  .replace(/#cd4a77/gi, color)
  .replace(/#9c213b/gi, color)
  .replace(/#ffffff/gi, color)
  .replace(/fill="white"/gi, `fill="${color}"`);

const sources = [
  { src: 'logo.svg', name: 'logo-mark' },
  { src: 'logo-horizontal.svg', name: 'logo-horizontal' },
];

for (const s of sources) {
  const svg = await readFile(path.join(SRC, s.src), 'utf8');
  await writeFile(path.join(OUT, `${s.name}-mono-black.svg`), monoize(svg, '#1a1a1a'));
  await writeFile(path.join(OUT, `${s.name}-mono-white.svg`), monoize(svg, '#ffffff'));
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
