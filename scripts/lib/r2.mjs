// R2 access through the wrangler CLI (no S3 SDK / credentials needed).
// Auth: `npx wrangler login` once, or set CLOUDFLARE_API_TOKEN in .env.
// Account/bucket come from .env (CLOUDFLARE_ACCOUNT_ID, R2_BUCKET).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const BUCKET = process.env.R2_BUCKET || 'cloudnative-lv';
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const ENV = ACCOUNT ? { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT } : process.env;
const WRANGLER = ['--yes', 'wrangler@4', 'r2', 'object'];

const isMissing = (msg) => /not exist|not found|404|NoSuchKey/i.test(msg);

// Read an object's text, or null if it doesn't exist yet. Any other failure
// (auth / network) aborts the process so a partial read never overwrites a list.
export function r2ReadText(key, { bucket = BUCKET } = {}) {
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

export function r2WriteText(key, text, { bucket = BUCKET, contentType = 'text/csv' } = {}) {
  const tmp = path.join(os.tmpdir(), `r2-${key.replace(/[/\\]/g, '_')}`);
  writeFileSync(tmp, text);
  try {
    // Cache-Control: no-store — `wrangler r2 object get` otherwise serves a cached copy
    // after the first read and never busts it on overwrite, which breaks read-modify-write
    // across separate op invocations. no-store keeps future reads of this object fresh.
    execFileSync('npx', [...WRANGLER, 'put', `${bucket}/${key}`, '--remote', '--file', tmp,
      '--content-type', contentType, '--cache-control', 'no-store, max-age=0'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: ENV });
  } catch (err) {
    throw new Error(`r2 put ${key} failed: ${String(err.stderr || err.stdout || err.message || '').trim()}`);
  }
}
