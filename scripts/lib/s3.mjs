// Direct R2 access through its S3-compatible API, signed with AWS SigV4 (zero deps,
// node:crypto + global fetch). This is the cache-immune read/write path: unlike
// `wrangler r2 object get` (which serves a cached copy after the first read and won't
// bust it on overwrite), the S3 API always returns the live object. Ops prefer this
// whenever the four R2_* S3 keys are present in .env; otherwise they fall back to
// wrangler (scripts/lib/r2.mjs).
//
// Env: R2_ENDPOINT (https://<account>.r2.cloudflarestorage.com), R2_BUCKET,
//      R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY. Region is "auto".
import crypto from 'node:crypto';

const ENDPOINT = (process.env.R2_ENDPOINT || '').replace(/\/+$/, '');
export const BUCKET = process.env.R2_BUCKET || 'cloudnative-lv';
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID || '';
const SECRET = process.env.R2_SECRET_ACCESS_KEY || '';
const REGION = process.env.R2_REGION || 'auto';

export const s3Available = () => Boolean(ENDPOINT && ACCESS_KEY && SECRET && BUCKET);

const sha256hex = (b) => crypto.createHash('sha256').update(b).digest('hex');
const hmac = (key, str) => crypto.createHmac('sha256', key).update(str).digest();
const EMPTY_HASH = sha256hex('');

// RFC 3986 / AWS-style percent-encoding over UTF-8 bytes; keeps unreserved chars and,
// for object keys, the path separators.
const uriEncode = (str, encodeSlash = true) => {
  let out = '';
  for (const b of Buffer.from(String(str), 'utf8')) {
    const c = String.fromCharCode(b);
    if ((b >= 0x41 && b <= 0x5a) || (b >= 0x61 && b <= 0x7a) || (b >= 0x30 && b <= 0x39) ||
        c === '-' || c === '_' || c === '.' || c === '~') out += c;
    else if (c === '/' && !encodeSlash) out += '/';
    else out += '%' + b.toString(16).toUpperCase().padStart(2, '0');
  }
  return out;
};

const xmlDecode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&amp;/g, '&');

// YYYYMMDDTHHMMSSZ + YYYYMMDD from the wall clock (plain Node script — Date is fine here).
const stamp = () => {
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
};

// Pure, synchronous SigV4 signer. `key === null` targets the bucket itself (used by
// list); otherwise the path-style object URL `/<bucket>/<key>`. Returns the request URL,
// the payload buffer, and the headers to send — `host` is signed but omitted from the
// returned headers (both fetch and curl set Host from the URL). Shared by the async
// fetch wrappers here and the synchronous curl transport in r2.mjs.
export function signS3(method, key, { query = {}, body = null, contentType } = {}) {
  if (!s3Available()) {
    throw new Error('R2 S3 credentials missing — set R2_ENDPOINT / R2_BUCKET / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY in .env');
  }
  const host = new URL(ENDPOINT).host;
  const { amzDate, dateStamp } = stamp();
  const payload = body == null ? Buffer.alloc(0) : (Buffer.isBuffer(body) ? body : Buffer.from(String(body)));
  const payloadHash = payload.length === 0 ? EMPTY_HASH : sha256hex(payload);
  const canonicalUri = key === null ? `/${BUCKET}` : `/${BUCKET}/${uriEncode(key, false)}`;
  const canonicalQuery = Object.keys(query).sort()
    .map((k) => `${uriEncode(k)}=${uriEncode(query[k])}`).join('&');

  // Headers we sign. `host` is signed but not returned (the transport sets it from URL).
  const signed = { host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate };
  if (contentType) signed['content-type'] = contentType;
  const names = Object.keys(signed).map((h) => h.toLowerCase()).sort();
  const canonicalHeaders = names.map((n) => `${n}:${String(signed[n]).trim()}\n`).join('');
  const signedHeaders = names.join(';');

  const canonicalRequest = [method, canonicalUri, canonicalQuery, canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const scope = `${dateStamp}/${REGION}/s3/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256hex(canonicalRequest)].join('\n');
  const kSigning = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, dateStamp), REGION), 's3'), 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers = { 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate, authorization };
  if (contentType) headers['content-type'] = contentType;
  const url = `${ENDPOINT}${canonicalUri}${canonicalQuery ? `?${canonicalQuery}` : ''}`;
  return { url, method, headers, body: payload };
}

// Async transport over global fetch (used by the verify / restore ops here).
async function s3Request(method, key, opts = {}) {
  const { url, headers, body } = signS3(method, key, opts);
  return fetch(url, { method, headers, body: method === 'GET' || method === 'HEAD' ? undefined : body });
}

// Read an object's text, or null if it doesn't exist (404). Other failures throw.
export async function s3GetText(key) {
  const res = await s3Request('GET', key);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`S3 GET ${key} -> ${res.status} ${(await res.text().catch(() => '')).trim()}`.trim());
  return res.text();
}

export async function s3GetBuffer(key) {
  const res = await s3Request('GET', key);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`S3 GET ${key} -> ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// Write an object. Cache-Control no-store keeps any later wrangler reads fresh too.
export async function s3Put(key, body, contentType = 'text/csv') {
  const res = await s3Request('PUT', key, { body, contentType });
  if (!res.ok) throw new Error(`S3 PUT ${key} -> ${res.status} ${(await res.text().catch(() => '')).trim()}`.trim());
}

// List every object under a prefix (follows continuation tokens). Returns
// [{ key, size, lastModified }].
export async function s3List(prefix = '') {
  const out = [];
  let token;
  do {
    const query = { 'list-type': '2', 'max-keys': '1000' };
    if (prefix) query.prefix = prefix;
    if (token) query['continuation-token'] = token;
    const res = await s3Request('GET', null, { query });
    if (!res.ok) throw new Error(`S3 LIST ${prefix} -> ${res.status} ${(await res.text().catch(() => '')).trim()}`.trim());
    const xml = await res.text();
    for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const key = (m[1].match(/<Key>([\s\S]*?)<\/Key>/) || [])[1];
      if (key == null) continue;
      out.push({
        key: xmlDecode(key),
        size: Number((m[1].match(/<Size>(\d+)<\/Size>/) || [])[1] || 0),
        lastModified: (m[1].match(/<LastModified>([\s\S]*?)<\/LastModified>/) || [])[1] || '',
      });
    }
    token = /<IsTruncated>true<\/IsTruncated>/.test(xml)
      ? (xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/) || [])[1]
      : null;
  } while (token);
  return out;
}
