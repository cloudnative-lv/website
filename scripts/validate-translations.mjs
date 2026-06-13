// Fail the build if translation coverage is incomplete — every key present in
// one language must exist in all the others. Run in CI before build.
import { translations } from '../src/i18n/translations.js';

function keyPaths(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...keyPaths(v, p));
    else out.push(p);
  }
  return out;
}

const langs = Object.keys(translations);
const sets = Object.fromEntries(langs.map((l) => [l, new Set(keyPaths(translations[l]))]));
const allKeys = new Set(langs.flatMap((l) => [...sets[l]]));

const missing = [];
for (const l of langs) {
  for (const k of allKeys) {
    if (!sets[l].has(k)) missing.push(`  [${l}] missing: ${k}`);
  }
}

if (missing.length) {
  console.error(`✗ Translation coverage FAILED (${missing.length} gaps):`);
  console.error(missing.sort().join('\n'));
  process.exit(1);
}
console.log(`✓ Translation coverage OK — ${allKeys.size} keys × ${langs.length} languages (${langs.join(', ')})`);
