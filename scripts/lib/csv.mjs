// Tiny dependency-free CSV utilities (RFC-4180-ish), shared by the local ops.
// Extracted from the original import scripts so every op parses/writes the same way.

export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  const push = () => { row.push(field); field = ''; };
  const endRow = () => { push(); if (row.length > 1 || row[0] !== '') rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') push();
    else if (c === '\n') endRow();
    else if (c === '\r') { /* swallow; \n ends the row */ }
    else field += c;
  }
  if (field !== '' || row.length) endRow();
  return rows;
}

export const cell = (s) => (/[",\n\r]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s));
export const toCsv = (rows) => rows.map((r) => r.map(cell).join(',')).join('\n') + '\n';

export const norm = (s) => String(s ?? '').trim();
export const lower = (s) => norm(s).toLowerCase();
export const isEmail = (s) => /^[^@\s,]+@[^@\s,]+\.[^@\s,]+$/.test(s);
export const stripBom = (s) => String(s ?? '').replace(/^﻿/, '');

// Given a header row, return finder(names[]) -> first matching column index (or -1).
export function headerFinder(headers) {
  const h = headers.map(lower);
  return (names) => h.findIndex((x) => names.includes(x));
}
