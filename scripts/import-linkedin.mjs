// Parse a LinkedIn FOLLOWERS HTML export into the common CRM (subscribers.csv).
// Node port of the old extract_linkedin.py (pass --out to also save a reviewable CSV).
//
// Manual step: in LinkedIn Page admin -> Analytics -> Followers, open the "All
// followers" modal and scroll to the bottom so every follower is in the DOM, then save
// the page as HTML to data/linkedin-followers.html.
//   npm run import:linkedin [-- --in data/linkedin-followers.html --out data/linkedin-followers.csv --dry-run]
// LinkedIn has no email — rows land in the CRM as source=linkedin with the profile URL.
// (For per-event LinkedIn attendee lists, see import:linkedin-events.)
import { readFile, writeFile } from 'node:fs/promises';
import { toCsv } from './lib/csv.mjs';
import { parseLinkedinHtml } from './lib/linkedin.mjs';
import { makeContact, upsertCrm } from './lib/crm.mjs';

const argv = process.argv.slice(2);
const opts = { in: 'data/linkedin-followers.html', out: '', dryRun: false, parseOnly: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--in') opts.in = argv[++i];
  else if (a === '--out') opts.out = argv[++i];
  else if (a === '--dry-run') opts.dryRun = true;
  else if (a === '--parse-only') opts.parseOnly = true;
}

const people = parseLinkedinHtml(await readFile(opts.in, 'utf8'));
if (!people.length) {
  console.error(`No followers parsed from ${opts.in}. Did the followers modal fully load before saving the HTML?`);
  process.exit(1);
}

if (opts.parseOnly) {
  console.log(`Parsed ${people.length} followers from ${opts.in}. First 5:`);
  for (const p of people.slice(0, 5)) console.log(`  ${p.name} — ${p.headline} — ${p.profile_url}`);
  process.exit(0);
}

if (opts.out) {
  const csv = toCsv([['name', 'headline', 'profile_url'], ...people.map((p) => [p.name, p.headline, p.profile_url])]);
  await writeFile(opts.out, csv);
  console.log(`Parsed ${people.length} followers from ${opts.in} -> ${opts.out}`);
} else {
  console.log(`Parsed ${people.length} followers from ${opts.in}`);
}

const crm = upsertCrm(people.map((p) => makeContact({ name: p.name, linkedin: p.profile_url, source: 'linkedin' })), { dryRun: opts.dryRun });
console.log(`CRM (subscribers.csv): ${crm.before} -> ${crm.after}  (+${crm.added} new, ${crm.updated} enriched)${opts.dryRun ? ' [dry run — R2 not written]' : ''}`);
