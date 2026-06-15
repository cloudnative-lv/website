// generate:sponsors-card — a square (1080×1080) partners/supporters card for socials,
// built locally with sharp from src/data/partners.js + the brand frame. Standalone op
// (not part of the subscriber report). Output: reports/sponsors/ (gitignored).
//
//   npm run generate:sponsors-card
import { mkdir } from 'node:fs/promises';
import { renderSponsorsCard } from './lib/infographics.mjs';

const OUT = 'reports/sponsors';
await mkdir(OUT, { recursive: true });
const [file] = await renderSponsorsCard({ OUT });
console.log(`✓ ${OUT}/${file}`);
