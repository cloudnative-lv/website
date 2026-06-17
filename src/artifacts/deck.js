import pptxgen from 'pptxgenjs';
import { getSpeakerInfo } from '../data/speakers';
import { cleanTitle, startTime, talkSpeakerNames, eventSchedule } from './fields';
import { allPartners } from '../data/partners';
import { connectSocials } from '../data/socialLinks';
import { filledIconSvg, emailIconSvg } from './deckIcons';
import QRCode from 'qrcode';

const BURGUNDY = '8B1538';
const PINK = 'D4567C';
const ROSE = 'FDF2F4'; // bg-rose-50, the cream backdrop
const INK = '303030';   // dark heading/body text (matching the original deck)
const W = 13.333; // LAYOUT_WIDE inches (16:9)
const H = 7.5;
const FONT_TITLE = 'Lexend Light';
const FONT_BODY = 'Lexend';

// Existing brand SVGs, reused so the deck matches the site / banners / HTML deck.
const SKYLINE = '/images/brand/skyline.svg';      // tall skyline (title slide, natural aspect)
const WIDE_SKYLINE = '/images/brand/skyline-wide.png'; // wide skyline (content footer strips)
const LOGO = '/images/logo-stacked.svg';
const ANDREY = '/images/stickers/sticker_andrey.svg';
const LINDA = '/images/stickers/sticker_linda.svg';

const socialUrl = (href) => (/^https?:|^mailto:/.test(href) ? href : `https://cloudnative.lv${href}`);

// Fetch an image as a data URL for embedding; returns null on failure so a
// missing/unsupported asset never breaks the whole deck.
async function loadImage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Like loadImage but also returns the image's natural pixel size, so logos can be
// placed at their true aspect ratio.
async function loadImageSized(url) {
  const data = await loadImage(url);
  if (!data) return null;
  const dims = await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.onerror = () => resolve({ w: 1, h: 1 });
    img.src = data;
  });
  return { data, ...dims };
}

// Rasterise an SVG (by URL or inline markup) to a PNG data URL at w×h CSS px.
// `stretch` ignores aspect ratio (used for the skyline strip); otherwise the art
// is contained, centered. PowerPoint embeds the resulting PNG reliably.
async function svgToPng(srcOrMarkup, w, h, { stretch = false, markup = false } = {}) {
  try {
    const svgText = markup ? srcOrMarkup : await (await fetch(srcOrMarkup)).text();
    const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = 2;
    const cw = Math.round(w * scale), ch = Math.round(h * scale);
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (stretch) {
      ctx.drawImage(img, 0, 0, cw, ch);
    } else {
      const ar = (img.naturalWidth || 1) / (img.naturalHeight || 1);
      let dw = cw, dh = cw / ar;
      if (dh > ch) { dh = ch; dw = ch * ar; }
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }
    URL.revokeObjectURL(url);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

// Agenda rows split into time + label so talks can be coloured burgundy.
function agendaRows(event, talks) {
  const sched = eventSchedule(event);
  if (sched.length >= 3) {
    return sched.map((s) => ({ time: s.time, label: s.label, isTalk: s.isTalk, isDim: /break|doors\s*close/i.test(s.label) }));
  }
  const rows = [];
  const doorTime = event.time || '18:00';
  const talkStart = startTime(event) || doorTime;
  rows.push({ time: doorTime, label: 'Doors open' });
  rows.push({ time: talkStart, label: 'Welcome by Cloud Native Latvia  ← we are here' });
  talks.forEach((t, i) => {
    const names = talkSpeakerNames(t).join(', ');
    const mins = parseInt(talkStart.split(':')[1] || '0', 10) + 15 + i * 60;
    const hrs = parseInt(talkStart.split(':')[0] || '18', 10) + Math.floor(mins / 60);
    const mm = String(mins % 60).padStart(2, '0');
    rows.push({ time: `${hrs}:${mm}`, label: names ? `${t.title} by ${names}` : t.title, isTalk: true });
    if (i < talks.length - 1) {
      const bMins = mins + 45;
      const bHrs = parseInt(talkStart.split(':')[0] || '18', 10) + Math.floor(bMins / 60);
      const bMm = String(bMins % 60).padStart(2, '0');
      rows.push({ time: `${bHrs}:${bMm}`, label: 'Break with snacks', isDim: true });
    }
  });
  rows.push({ time: event.endTime || '21:00', label: 'Doors close', isDim: true });
  return rows;
}

// Build and download an opening deck (.pptx) matching the Cloud Native Latvia
// opening presentation: cream + Riga skyline chrome, Lexend fonts, centered
// light headings, time-based agenda (talks in burgundy), organizer intro,
// "Next up:" burgundy speaker cards, sponsors, a "How to connect?" slide with
// platform icons + QR codes, a feedback QR, and a thank-you.
export async function downloadDeck(event) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Cloud Native Latvia';
  pptx.company = 'Cloud Native Latvia';
  pptx.title = cleanTitle(event.title);

  const talks = event.talks || [];

  // Pre-rasterise the shared brand art once. The content strips use the wide
  // skyline PNG (short, undistorted); the title uses the tall skyline at its
  // natural proportions.
  const [logoPng, skylineWide, skylineTall, andreyPng, lindaPng] = await Promise.all([
    svgToPng(LOGO, 600, 600),
    loadImage(WIDE_SKYLINE),
    svgToPng(SKYLINE, 2000, 1333),
    svgToPng(ANDREY, 760, 912),
    svgToPng(LINDA, 760, 912),
  ]);

  // Cream slide + wide skyline strip along the foot + stacked logo bottom-right.
  const SKY_H = 2.4, LOGO_SZ = 1.5;
  const chrome = (s) => {
    if (skylineWide) s.addImage({ data: skylineWide, x: 0, y: H - SKY_H, w: W, h: SKY_H });
    if (logoPng) s.addImage({ data: logoPng, x: W - LOGO_SZ - 0.35, y: H - LOGO_SZ - 0.15, w: LOGO_SZ, h: LOGO_SZ });
  };
  const contentSlide = () => {
    const s = pptx.addSlide();
    s.background = { color: ROSE };
    chrome(s);
    return s;
  };
  const heading = (s, text, opts = {}) => s.addText(text, {
    x: 0, y: 0.55, w: W, h: 1.0, fontSize: 32, fontFace: FONT_TITLE, color: INK, align: 'center', ...opts,
  });

  // --- 1) Title — big stacked logo over the skyline (branding only). The tall
  // skyline sits full-width at natural proportions, anchored to the bottom.
  const t = pptx.addSlide();
  t.background = { color: ROSE };
  const skyTallH = W / 1.5; // natural aspect of skyline.svg (1.5:1)
  if (skylineTall) t.addImage({ data: skylineTall, x: 0, y: H - skyTallH, w: W, h: skyTallH });
  if (logoPng) t.addImage({ data: logoPng, x: (W - 5.2) / 2, y: 0.9, w: 5.2, h: 5.2 });

  // --- 2) Agenda — time-based; talk titles in burgundy.
  const ag = contentSlide();
  ag.addText([
    { text: 'AGENDA', options: { fontSize: 34, fontFace: FONT_TITLE, color: INK, breakLine: true } },
    { text: "of today's meetup", options: { fontSize: 15, italic: true, color: '666666', fontFace: FONT_TITLE } },
  ], { x: 0, y: 0.45, w: W, h: 1.2, align: 'center' });
  const rows = agendaRows(event, talks);
  ag.addText(
    rows.flatMap((r) => {
      const labelColor = r.isTalk ? BURGUNDY : (r.isDim ? '999999' : INK);
      const [main, here] = r.label.split('←');
      const runs = [
        { text: `${r.time}:  `, options: { bold: true, color: r.isDim ? '999999' : INK, fontFace: FONT_BODY } },
        { text: main.trim(), options: { bold: r.isTalk, color: labelColor, fontFace: r.isTalk ? FONT_BODY : FONT_TITLE } },
      ];
      if (here) runs.push({ text: `  ← ${here.trim()}`, options: { italic: true, color: INK, fontFace: FONT_TITLE } });
      runs[runs.length - 1].options.breakLine = true;
      runs[runs.length - 1].options.paraSpaceAfter = 10;
      return runs;
    }),
    { x: 1.7, y: 1.95, w: W - 3.0, h: 4.5, fontSize: 17, valign: 'top' },
  );

  // --- 3) Organizers intro — Andrey & Linda.
  const intro = contentSlide();
  if (andreyPng) intro.addImage({ data: andreyPng, x: 2.7, y: 1.0, w: 3.0, h: 3.6 });
  if (lindaPng) intro.addImage({ data: lindaPng, x: 7.7, y: 1.0, w: 3.0, h: 3.6 });
  intro.addText('ANDREY', { x: 2.2, y: 4.7, w: 4.0, h: 0.6, fontSize: 26, bold: true, color: BURGUNDY, fontFace: FONT_BODY, align: 'center' });
  intro.addText('LINDA', { x: 7.2, y: 4.7, w: 4.0, h: 0.6, fontSize: 26, bold: true, color: PINK, fontFace: FONT_BODY, align: 'center' });

  // --- 4) Sponsors.
  if (allPartners.length) {
    const logos = await Promise.all(allPartners.map((p) => loadImageSized(p.logo)));
    const sp = contentSlide();
    heading(sp, 'Sponsors');
    const cellW = Math.min(3.0, (W - 3) / allPartners.length);
    const totalW = cellW * allPartners.length;
    const startX = (W - totalW) / 2;
    const boxW = cellW - 0.6, boxH = 1.7, boxY = 2.6;
    allPartners.forEach((p, i) => {
      const x = startX + i * cellW;
      const L = logos[i];
      if (L) {
        const scale = Math.min(boxW / L.w, boxH / L.h);
        const w = L.w * scale, h = L.h * scale;
        sp.addImage({ data: L.data, x: x + 0.3 + (boxW - w) / 2, y: boxY + (boxH - h) / 2, w, h });
      }
    });
    sp.addText('Wanna join?', { x: 0, y: 4.7, w: W, h: 0.6, fontSize: 24, bold: true, color: INK, fontFace: FONT_BODY, align: 'center' });
  }

  // --- 5) How to connect? — email + platform icon/label/QR.
  const socials = connectSocials();
  const [iconPngs, qrPngs, emailPng] = await Promise.all([
    Promise.all(socials.map((s) => svgToPng(filledIconSvg(s.key, '#8B1538', '100'), 100, 100, { markup: true }))),
    Promise.all(socials.map((s) => QRCode.toDataURL(socialUrl(s.href), { margin: 1, width: 600, color: { dark: `#${BURGUNDY}`, light: '#ffffff' } }).catch(() => null))),
    svgToPng(emailIconSvg('#8B1538', '100'), 100, 100, { markup: true }),
  ]);
  const co = contentSlide();
  heading(co, 'How to connect?');
  if (emailPng) co.addImage({ data: emailPng, x: W / 2 - 2.5, y: 1.62, w: 0.42, h: 0.42 });
  co.addText('hello@cloudnative.lv', { x: W / 2 - 2.0, y: 1.55, w: 4.5, h: 0.6, fontSize: 22, fontFace: FONT_TITLE, color: BURGUNDY, align: 'left', valign: 'middle' });
  const n = socials.length;
  const colW = 2.5, qr = 1.5;
  const rowW = n * colW;
  const sx = (W - rowW) / 2;
  socials.forEach((s, i) => {
    const cx = sx + i * colW + colW / 2;
    if (iconPngs[i]) co.addImage({ data: iconPngs[i], x: cx - 0.28, y: 2.5, w: 0.56, h: 0.56, hyperlink: { url: socialUrl(s.href) } });
    co.addText(s.title, { x: cx - colW / 2, y: 3.12, w: colW, h: 0.35, fontSize: 13, bold: true, color: BURGUNDY, fontFace: FONT_BODY, align: 'center', hyperlink: { url: socialUrl(s.href) } });
    if (qrPngs[i]) co.addImage({ data: qrPngs[i], x: cx - qr / 2, y: 3.55, w: qr, h: qr, hyperlink: { url: socialUrl(s.href) } });
  });

  // --- 6) "Next up:" per talk — burgundy speaker cards (shown between talks at the event).
  for (const talk of talks) {
    const names = talkSpeakerNames(talk);
    const s = contentSlide();
    s.addText('Next up:', { x: 0, y: 0.5, w: W, h: 0.7, fontSize: 30, fontFace: FONT_TITLE, color: INK, align: 'center' });
    s.addText(talk.title, { x: 1.5, y: 1.3, w: W - 3, h: 1.1, fontSize: 24, bold: true, color: INK, fontFace: FONT_BODY, align: 'center' });

    const cardW = 9.0, cardH = 1.35, gap = 0.28;
    const photoD = cardH + 0.35; // circle is taller than the bar, like the original
    const totalH = names.length * cardH + (names.length - 1) * gap;
    let cy = 2.5 + Math.max(0, (2.5 - totalH) / 2);
    for (const name of names) {
      const info = getSpeakerInfo(name);
      const cardX = (W - cardW) / 2;
      const photoX = cardX - photoD / 2; // photo centered on the card's left edge
      const photoY = cy + (cardH - photoD) / 2;
      s.addShape(pptx.ShapeType.roundRect, { x: cardX, y: cy, w: cardW, h: cardH, fill: { color: BURGUNDY }, line: { type: 'none' }, rectRadius: 0.12 });
      const photo = info.photo ? await loadImage(info.photo) : null;
      if (photo) {
        s.addShape(pptx.ShapeType.ellipse, { x: photoX - 0.05, y: photoY - 0.05, w: photoD + 0.1, h: photoD + 0.1, fill: { color: ROSE }, line: { type: 'none' } });
        s.addImage({ data: photo, x: photoX, y: photoY, w: photoD, h: photoD, rounding: true });
      }
      const tx = cardX + photoD / 2 + 0.35;
      const tw = cardW - (photoD / 2 + 0.6);
      s.addText(name, { x: tx, y: cy + 0.16, w: tw, h: 0.5, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: FONT_BODY, align: 'left', valign: 'middle' });
      const sub = [info.title, info.company ? `@ ${info.company}` : ''].filter(Boolean).join('\n');
      if (sub) s.addText(sub, { x: tx, y: cy + 0.62, w: tw, h: 0.7, fontSize: 13, italic: true, color: 'F2D3DC', fontFace: FONT_TITLE, align: 'left', valign: 'top', lineSpacingMultiple: 1.05 });
      cy += cardH + gap;
    }
  }

  // --- 7) Feedback QR.
  try {
    const fbUrl = `https://cloudnative.lv/events/${event.slug}/feedback`;
    const qrImg = await QRCode.toDataURL(fbUrl, { margin: 1, width: 600, color: { dark: `#${BURGUNDY}`, light: '#ffffff' } });
    const fb = contentSlide();
    fb.addText('Help us get better for future events!', { x: 1.5, y: 0.9, w: W - 3, h: 0.7, fontSize: 26, fontFace: FONT_TITLE, color: INK, align: 'center' });
    fb.addImage({ data: qrImg, x: (W - 2.6) / 2, y: 1.9, w: 2.6, h: 2.6 });
    fb.addText(`cloudnative.lv/events/${event.slug}/feedback`, { x: 1.5, y: 4.7, w: W - 3, h: 0.4, fontSize: 13, fontFace: FONT_TITLE, color: '999999', align: 'center' });
  } catch { /* QR optional */ }

  // --- 8) Thank you — QR to the event page (slides & photos).
  const cl = pptx.addSlide();
  cl.background = { color: BURGUNDY };
  cl.addText('Thank you!', { x: 0, y: 1.1, w: W, h: 1.1, fontSize: 44, fontFace: FONT_TITLE, color: 'FFFFFF', align: 'center' });
  try {
    const evQr = await QRCode.toDataURL(`https://cloudnative.lv/events/${event.slug}`, { margin: 1, width: 600, color: { dark: `#${BURGUNDY}`, light: '#ffffff' } });
    const qrSz = 2.3, qrX = (W - qrSz) / 2, qrY = 2.5;
    cl.addShape(pptx.ShapeType.roundRect, { x: qrX - 0.14, y: qrY - 0.14, w: qrSz + 0.28, h: qrSz + 0.28, fill: { color: 'FFFFFF' }, line: { type: 'none' }, rectRadius: 0.1 });
    cl.addImage({ data: evQr, x: qrX, y: qrY, w: qrSz, h: qrSz });
  } catch { /* QR optional */ }
  cl.addText(`Slides & photos: cloudnative.lv/events/${event.slug}`, { x: 1.5, y: 5.3, w: W - 3, h: 0.5, fontSize: 15, fontFace: FONT_TITLE, color: 'F2D3DC', align: 'center' });

  await pptx.writeFile({ fileName: `${event.slug}-deck.pptx` });
}
