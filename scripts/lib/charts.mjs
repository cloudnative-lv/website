// Brand-styled SVG charts, rasterized to PNG by render.svgToPng (sharp).
// Deliberately tiny and dependency-free — just hand-built SVG strings.

const C = {
  burgundy: '#8b1538', pink: '#d4567c', rose: '#e7a9bd', cream: '#fdf2f4',
  ink: '#3b1722', grid: '#e9d8de', text: '#5b2233',
};
export const SERIES_COLORS = [C.burgundy, C.pink, C.rose];

function niceMax(rawMax, ticks = 5) {
  if (rawMax <= 0) return ticks;
  const rough = rawMax / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const r = rough / mag;
  const nice = r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10;
  return nice * mag * ticks;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function frame({ width, height, title }) {
  return {
    head: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Helvetica, Arial, sans-serif">`
      + `<rect width="${width}" height="${height}" fill="#ffffff"/>`
      + (title ? `<text x="${width / 2}" y="46" text-anchor="middle" font-size="30" font-weight="700" fill="${C.burgundy}">${esc(title)}</text>` : ''),
    foot: `</svg>`,
  };
}

// Grouped vertical bars. groups: string[]; series: [{name, color, values:number[]}].
export function barsSvg({ title, groups, series, yMax, yLabel = '', width = 1100, height = 640, fmt = (v) => String(Math.round(v)) }) {
  const m = { top: title ? 84 : 40, right: 40, bottom: 96, left: 84 };
  const plotW = width - m.left - m.right;
  const plotH = height - m.top - m.bottom;
  const max = yMax ?? niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const y = (v) => m.top + plotH - (v / max) * plotH;
  const groupW = plotW / groups.length;
  const n = series.length;
  const barW = Math.min(64, (groupW * 0.72) / n);
  let s = '';
  const ticks = 5;
  for (let i = 0; i <= ticks; i++) {
    const v = (max / ticks) * i, yy = y(v);
    s += `<line x1="${m.left}" y1="${yy}" x2="${m.left + plotW}" y2="${yy}" stroke="${C.grid}"/>`;
    s += `<text x="${m.left - 12}" y="${yy + 5}" text-anchor="end" font-size="18" fill="${C.text}">${fmt(v)}</text>`;
  }
  if (yLabel) s += `<text x="22" y="${m.top + plotH / 2}" transform="rotate(-90 22 ${m.top + plotH / 2})" text-anchor="middle" font-size="18" fill="${C.text}">${esc(yLabel)}</text>`;
  groups.forEach((g, gi) => {
    const gx = m.left + groupW * gi + groupW / 2;
    const total = n * barW + (n - 1) * 8;
    let bx = gx - total / 2;
    series.forEach((ser) => {
      const v = ser.values[gi] ?? 0, yy = y(v);
      s += `<rect x="${bx}" y="${yy}" width="${barW}" height="${m.top + plotH - yy}" rx="4" fill="${ser.color}"/>`;
      s += `<text x="${bx + barW / 2}" y="${yy - 8}" text-anchor="middle" font-size="16" font-weight="600" fill="${C.ink}">${fmt(v)}</text>`;
      bx += barW + 8;
    });
    s += `<text x="${gx}" y="${m.top + plotH + 30}" text-anchor="middle" font-size="19" fill="${C.text}">${esc(g)}</text>`;
  });
  if (n > 1) {
    let lx = m.left; const ly = height - 26;
    series.forEach((ser) => {
      s += `<rect x="${lx}" y="${ly - 15}" width="18" height="18" rx="3" fill="${ser.color}"/>`;
      s += `<text x="${lx + 26}" y="${ly}" font-size="18" fill="${C.text}">${esc(ser.name)}</text>`;
      lx += 54 + ser.name.length * 11;
    });
  }
  const f = frame({ width, height, title });
  return f.head + s + f.foot;
}

// Simple line/area chart for time series. points: [{label, value}].
export function lineSvg({ title, points, yLabel = '', width = 1100, height = 560, fmt = (v) => String(Math.round(v)) }) {
  const m = { top: title ? 84 : 40, right: 40, bottom: 96, left: 84 };
  const plotW = width - m.left - m.right;
  const plotH = height - m.top - m.bottom;
  const max = niceMax(Math.max(1, ...points.map((p) => p.value)));
  const x = (i) => m.left + (points.length === 1 ? plotW / 2 : (plotW * i) / (points.length - 1));
  const y = (v) => m.top + plotH - (v / max) * plotH;
  let s = '';
  const ticks = 5;
  for (let i = 0; i <= ticks; i++) {
    const v = (max / ticks) * i, yy = y(v);
    s += `<line x1="${m.left}" y1="${yy}" x2="${m.left + plotW}" y2="${yy}" stroke="${C.grid}"/>`;
    s += `<text x="${m.left - 12}" y="${yy + 5}" text-anchor="end" font-size="18" fill="${C.text}">${fmt(v)}</text>`;
  }
  const pts = points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');
  s += `<polygon points="${m.left},${m.top + plotH} ${pts} ${m.left + plotW},${m.top + plotH}" fill="${C.pink}" opacity="0.16"/>`;
  s += `<polyline points="${pts}" fill="none" stroke="${C.burgundy}" stroke-width="3"/>`;
  points.forEach((p, i) => {
    s += `<circle cx="${x(i)}" cy="${y(p.value)}" r="5" fill="${C.burgundy}"/>`;
    s += `<text x="${x(i)}" y="${y(p.value) - 14}" text-anchor="middle" font-size="15" fill="${C.ink}">${fmt(p.value)}</text>`;
    s += `<text x="${x(i)}" y="${m.top + plotH + 30}" text-anchor="middle" font-size="16" fill="${C.text}">${esc(p.label)}</text>`;
  });
  if (yLabel) s += `<text x="22" y="${m.top + plotH / 2}" transform="rotate(-90 22 ${m.top + plotH / 2})" text-anchor="middle" font-size="18" fill="${C.text}">${esc(yLabel)}</text>`;
  const f = frame({ width, height, title });
  return f.head + s + f.foot;
}

// A table image. headers: string[]; rows: string[][].
// colWeights: optional number[] proportional column widths (e.g. [3,1,1,1] = first col 3x wider).
export function tableSvg({ title, headers, rows, width = 1100, highlightLast = false, colWeights }) {
  const top = title ? 84 : 30;
  const headH = 56, rowH = 52;
  const height = top + headH + rows.length * rowH + 30;
  const mx = 30, tableW = width - mx * 2, cols = headers.length;
  const w = colWeights || Array(cols).fill(1);
  const wSum = w.reduce((a, b) => a + b, 0);
  const colStarts = []; let cx = 0;
  for (let i = 0; i < cols; i++) { colStarts.push(cx); cx += (w[i] / wSum) * tableW; }
  const colW = (i) => (w[i] / wSum) * tableW;
  const cellX = (i) => mx + colStarts[i] + (i === 0 ? 18 : colW(i) / 2);
  const anchor = (i) => (i === 0 ? 'start' : 'middle');
  let s = `<rect x="${mx}" y="${top}" width="${tableW}" height="${headH}" rx="8" fill="${C.burgundy}"/>`;
  headers.forEach((h, i) => {
    s += `<text x="${cellX(i)}" y="${top + headH / 2 + 7}" text-anchor="${anchor(i)}" font-size="20" font-weight="700" fill="#fff">${esc(h)}</text>`;
  });
  rows.forEach((r, ri) => {
    const ry = top + headH + ri * rowH;
    const last = highlightLast && ri === rows.length - 1;
    s += `<rect x="${mx}" y="${ry}" width="${tableW}" height="${rowH}" fill="${last ? C.cream : (ri % 2 ? '#faf3f5' : '#ffffff')}"/>`;
    r.forEach((v, ci) => {
      s += `<text x="${cellX(ci)}" y="${ry + rowH / 2 + 7}" text-anchor="${anchor(ci)}" font-size="20" font-weight="${last ? 700 : 400}" fill="${C.ink}">${esc(v)}</text>`;
    });
  });
  s += `<rect x="${mx}" y="${top}" width="${tableW}" height="${headH + rows.length * rowH}" fill="none" stroke="${C.grid}" rx="8"/>`;
  const f = frame({ width, height, title });
  return f.head + s + f.foot;
}
