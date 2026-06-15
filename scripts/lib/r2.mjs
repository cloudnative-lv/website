// R2 read/write for the local ops, with a synchronous API the import/report/cleanup
// scripts call directly.
//
// Two transports:
//   • S3 API (preferred) — when the R2_* S3 keys are in .env. Signed with SigV4
//     (scripts/lib/s3.mjs) and sent with curl. This is CACHE-IMMUNE: it always reads
//     the live object, unlike `wrangler r2 object get` which serves a stale cached copy
//     after the first read. Writes also set Cache-Control: no-store.
//   • wrangler CLI (fallback) — when no S3 keys are set. Auth via `npx wrangler login`
//     or CLOUDFLARE_API_TOKEN. Writes set Cache-Control: no-store so later reads stay
//     fresh, but cross-run reads can still be stale (the reason S3 is preferred).
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { signS3, s3Available } from './s3.mjs';

export const BUCKET = process.env.R2_BUCKET || 'cloudnative-lv';
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const ENV = ACCOUNT ? { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT } : process.env;
const WRANGLER = ['--yes', 'wrangler@4', 'r2', 'object'];
const NO_STORE = 'no-store, max-age=0';

const isMissing = (msg) => /not exist|not found|404|NoSuchKey/i.test(msg);
const tmpFor = (tag, key) => path.join(os.tmpdir(), `r2-${tag}-${key.replace(/[/\\]/g, '_')}`);

// --- S3 transport (curl + SigV4) ---------------------------------------------------

const headerArgs = (headers) => Object.entries(headers).flatMap(([k, v]) => ['-H', `${k}: ${v}`]);

function s3GetSync(key) {
  const { url, headers } = signS3('GET', key);
  const out = tmpFor('get', key);
  try {
    const code = execFileSync('curl', ['-sS', '-X', 'GET', ...headerArgs(headers), '-o', out, '-w', '%{http_code}', url],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    if (code === '404') return null;
    if (!code.startsWith('2')) {
      const detail = (() => { try { return readFileSync(out, 'utf8'); } catch { return ''; } })();
      throw new Error(`S3 GET ${key} -> ${code} ${detail.trim()}`.trim());
    }
    return readFileSync(out, 'utf8');
  } finally {
    rmSync(out, { force: true });
  }
}

function s3PutSync(key, text, contentType) {
  const { url, headers, body } = signS3('PUT', key, { body: text, contentType });
  const src = tmpFor('put', key);
  writeFileSync(src, body);
  try {
    // cache-control is sent unsigned (not an x-amz-* header) so SigV4 ignores it; R2
    // still stores it, keeping any later wrangler reads of this object fresh.
    const code = execFileSync('curl', ['-sS', '-X', 'PUT', ...headerArgs(headers),
      '-H', `cache-control: ${NO_STORE}`, '--data-binary', `@${src}`, '-o', '/dev/null', '-w', '%{http_code}', url],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    if (!code.startsWith('2')) throw new Error(`S3 PUT ${key} -> ${code}`);
  } finally {
    rmSync(src, { force: true });
  }
}

// --- wrangler transport (fallback) -------------------------------------------------

function wranglerGet(key, bucket) {
  try {
    return execFileSync('npx', [...WRANGLER, 'get', `${bucket}/${key}`, '--remote', '--pipe'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: ENV });
  } catch (err) {
    const msg = `${err.stderr || ''}${err.stdout || ''}${err.message || ''}`;
    if (isMissing(msg)) return null;
    console.error(`Failed to read ${key} from R2 (aborting so existing data is not overwritten):\n${msg.trim()}`);
    process.exit(1);
  }
}

function wranglerPut(key, text, bucket, contentType) {
  const tmp = tmpFor('put', key);
  writeFileSync(tmp, text);
  try {
    execFileSync('npx', [...WRANGLER, 'put', `${bucket}/${key}`, '--remote', '--file', tmp,
      '--content-type', contentType, '--cache-control', NO_STORE],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: ENV });
  } catch (err) {
    throw new Error(`r2 put ${key} failed: ${String(err.stderr || err.stdout || err.message || '').trim()}`);
  } finally {
    rmSync(tmp, { force: true });
  }
}

// --- public API --------------------------------------------------------------------

// Read an object's text, or null if it doesn't exist yet. Any other failure aborts so a
// partial read never overwrites a list.
export function r2ReadText(key, { bucket = BUCKET } = {}) {
  return s3Available() ? s3GetSync(key) : wranglerGet(key, bucket);
}

export function r2WriteText(key, text, { bucket = BUCKET, contentType = 'text/csv' } = {}) {
  return s3Available() ? s3PutSync(key, text, contentType) : wranglerPut(key, text, bucket, contentType);
}
