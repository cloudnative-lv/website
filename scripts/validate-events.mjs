// Fail the build if any event YAML is missing mandatory data or has malformed
// fields. Run in CI before build. Keeps the site from shipping broken events.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const DIR = 'src/data/events';
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;

const files = (await readdir(DIR)).filter((f) => f.endsWith('.yaml')).sort();
const errors = [];

for (const file of files) {
  let e;
  try {
    // js-yaml v4 load() uses the safe default schema (no code-executing tags);
    // input is our own trusted event YAML.
    e = yaml.load(await readFile(path.join(DIR, file), 'utf8'));
  } catch (err) {
    errors.push(`${file}: invalid YAML — ${err.message}`);
    continue;
  }
  const err = (m) => errors.push(`${file}: ${m}`);

  if (!isStr(e.id)) err('missing "id"');
  else if (file !== `${e.id}.yaml`) err(`filename should match id (expected ${e.id}.yaml)`);
  if (!isStr(e.title)) err('missing "title"');
  if (!isStr(e.slug)) err('missing "slug"');
  if (!DATE.test(String(e.date ?? ''))) err(`"date" must be quoted YYYY-MM-DD (got ${JSON.stringify(e.date)})`);
  if (!TIME.test(String(e.time ?? ''))) err(`"time" must be quoted HH:MM (got ${JSON.stringify(e.time)})`);
  if (!TIME.test(String(e.endTime ?? ''))) err(`"endTime" must be quoted HH:MM (got ${JSON.stringify(e.endTime)})`);
  if (e.startTime != null && !TIME.test(String(e.startTime))) err(`"startTime" must be HH:MM (got ${JSON.stringify(e.startTime)})`);
  if (!e.venue || !isStr(e.venue.name) || !isStr(e.venue.address)) err('missing "venue.name" / "venue.address"');
  if (!isStr(e.description)) err('missing "description"');

  if (!Array.isArray(e.talks) || e.talks.length === 0) err('missing "talks"');
  else {
    e.talks.forEach((t, i) => {
      if (!isStr(t.title)) err(`talk ${i + 1} missing "title"`);
      const speakers = t.speakers || (t.speaker ? [t.speaker] : []);
      if (!Array.isArray(speakers) || speakers.length === 0 || !speakers.every(isStr)) {
        err(`talk ${i + 1} ("${t.title ?? '?'}") missing "speaker" / "speakers"`);
      }
    });
  }
  if (!Array.isArray(e.tags) || e.tags.length === 0) err('missing "tags"');
}

if (errors.length) {
  console.error(`✗ Event validation FAILED (${errors.length} issues):`);
  console.error('  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`✓ Event data OK — ${files.length} events, all mandatory fields present`);
