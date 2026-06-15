import pptxgen from 'pptxgenjs';
import { getSpeakerInfo } from '../data/speakers';
import { meetupNumber, cleanTitle, dateDots, startTime, talkSpeakerNames, speakerRole } from './fields';
import { allPartners } from '../data/partners';
import { SOCIAL_LINKS } from '../data/socialLinks';
import QRCode from 'qrcode';

const BURGUNDY = '8B1538';
const PINK = 'D4567C';
const ROSE = 'FDF2F4'; // bg-rose-50, matches the banners/infographics cream
const W = 13.333; // LAYOUT_WIDE inches (16:9)
const H = 7.5;
const FONT_TITLE = 'Lexend Light';
const FONT_BODY = 'Lexend';

// Fetch an image as a data URL for embedding; returns null on failure so a
// missing/unsupported asset never breaks the whole deck (e.g. artifacts that
// only exist after a build, or in dev).
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

// Build and download an opening deck (.pptx) that matches the real Cloud Native
// Latvia presentation style: Lexend fonts, cream background with Riga skyline,
// centered headings, time-based agenda, "Next up:" talk slides with speaker
// photos, social connect slide, and branded feedback QR.
export async function downloadDeck(event) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Cloud Native Latvia';
  pptx.company = 'Cloud Native Latvia';
  pptx.title = cleanTitle(event.title);

  const base = `/artifacts/${event.id}`;
  const talks = event.talks || [];

  // Shared cream + skyline + logo background for text slides.
  const deckBg = await loadImage('/artifacts/brand/deck-bg.png');
  const textSlide = () => {
    const s = pptx.addSlide();
    s.background = { color: ROSE };
    if (deckBg) s.addImage({ data: deckBg, x: 0, y: 0, w: W, h: H });
    return s;
  };

  // --- 1) Title — the event banner, full-bleed (fallback: text on cream bg).
  const titleImg = await loadImage(`${base}/linkedin-event-speakers.png`);
  if (titleImg) {
    const t = pptx.addSlide();
    t.background = { color: ROSE };
    t.addImage({ data: titleImg, x: 0, y: 0, w: W, h: H });
  } else {
    const t = textSlide();
    t.addText(`Meetup #${meetupNumber(event)}`, {
      x: 0, y: 1.8, w: W, h: 1.2, fontSize: 48, bold: true, fontFace: FONT_TITLE, color: BURGUNDY, align: 'center',
    });
    t.addText(cleanTitle(event.title), {
      x: 1.5, y: 3.1, w: W - 3, h: 1.0, fontSize: 28, fontFace: FONT_BODY, color: '333333', align: 'center',
    });
    t.addText(`${dateDots(event.date)}  ·  ${event.venue?.name || ''}`, {
      x: 1.5, y: 4.2, w: W - 3, h: 0.5, fontSize: 18, fontFace: FONT_BODY, color: '777777', align: 'center',
    });
  }

  // --- 2) Agenda — time-based format matching the real deck.
  const ag = textSlide();
  ag.addText([
    { text: 'AGENDA\n', options: { fontSize: 28, bold: true, color: BURGUNDY, fontFace: FONT_TITLE } },
    { text: "of today's meetup", options: { fontSize: 14, color: '777777', fontFace: FONT_TITLE } },
  ], { x: 0, y: 0.4, w: W, h: 1.1, align: 'center' });

  // Build time-based agenda lines from event description or talks.
  const agendaLines = buildAgendaLines(event, talks);
  ag.addText(
    agendaLines.map((line) => ({
      text: line.text + '\n',
      options: {
        fontSize: line.highlight ? 18 : 15,
        fontFace: line.highlight ? FONT_BODY : FONT_TITLE,
        bold: line.highlight,
        color: line.dim ? '999999' : '303030',
        paraSpaceAfter: 6,
      },
    })),
    { x: 1.8, y: 1.8, w: W - 3.6, h: 5.0, valign: 'top' },
  );

  // --- 3) "Next up:" slide per talk — speaker photo + title.
  for (let i = 0; i < talks.length; i++) {
    const t = talks[i];
    const names = talkSpeakerNames(t);

    // Try the generated speaker banner first.
    const banner = names.length ? await loadImage(`${base}/speaker-${i + 1}.png`) : null;
    if (banner) {
      const s = pptx.addSlide();
      s.background = { color: ROSE };
      s.addImage({ data: banner, x: 0, y: 0, w: W, h: H });
    } else {
      const s = textSlide();
      // "Next up:" heading
      s.addText('Next up:', {
        x: 0, y: 0.5, w: W, h: 0.7, fontSize: 28, fontFace: FONT_TITLE, color: BURGUNDY, align: 'center',
      });
      // Talk title
      s.addText(t.title, {
        x: 1.5, y: 1.5, w: W - 3, h: 1.2, fontSize: 24, fontFace: FONT_BODY, bold: true, color: '303030', align: 'center',
      });
      // Speaker photos + names
      if (names.length) {
        const photoSize = names.length === 1 ? 2.2 : 1.8;
        const totalW = names.length * photoSize + (names.length - 1) * 0.8;
        const startX = (W - totalW) / 2;
        const photoY = 3.2;

        for (let j = 0; j < names.length; j++) {
          const info = getSpeakerInfo(names[j]);
          const cx = startX + j * (photoSize + 0.8);

          // Try speaker photo
          if (info.photo) {
            const photo = await loadImage(info.photo);
            if (photo) {
              s.addImage({ data: photo, x: cx, y: photoY, w: photoSize, h: photoSize, rounding: true });
            }
          }
          // Speaker name + role below photo
          s.addText(names[j], {
            x: cx - 0.5, y: photoY + photoSize + 0.2, w: photoSize + 1, h: 0.4,
            fontSize: 14, fontFace: FONT_BODY, bold: true, color: BURGUNDY, align: 'center',
          });
          const role = speakerRole(info);
          if (role) {
            s.addText(role, {
              x: cx - 0.5, y: photoY + photoSize + 0.55, w: photoSize + 1, h: 0.35,
              fontSize: 11, fontFace: FONT_TITLE, italic: true, color: '666666', align: 'center',
            });
          }
        }
      }
    }
  }

  // --- 4) Partners (logos + names).
  if (allPartners.length) {
    const logos = await Promise.all(allPartners.map((p) => loadImage(p.logo)));
    const pa = textSlide();
    pa.addText('Sponsors', {
      x: 0, y: 0.5, w: W, h: 0.8, fontSize: 28, fontFace: FONT_TITLE, bold: true, color: BURGUNDY, align: 'center',
    });
    const cellW = Math.min(3.0, (W - 3) / allPartners.length);
    const totalW = cellW * allPartners.length;
    const startX = (W - totalW) / 2;
    allPartners.forEach((p, i) => {
      const x = startX + i * cellW;
      if (logos[i]) pa.addImage({ data: logos[i], x: x + 0.3, y: 2.2, w: cellW - 0.6, h: 1.6, sizing: { type: 'contain', w: cellW - 0.6, h: 1.6 } });
      pa.addText(p.name, { x, y: 4.0, w: cellW, h: 0.4, fontSize: 12, fontFace: FONT_BODY, align: 'center', color: '666666' });
    });
  }

  // --- 5) How to connect? — social links.
  const co = textSlide();
  co.addText('How to connect?', {
    x: 0, y: 0.5, w: W, h: 0.8, fontSize: 28, fontFace: FONT_TITLE, bold: true, color: BURGUNDY, align: 'center',
  });
  co.addText('hello@cloudnative.lv', {
    x: 0, y: 1.5, w: W, h: 0.5, fontSize: 20, fontFace: FONT_TITLE, color: PINK, align: 'center',
  });
  const socials = SOCIAL_LINKS.filter((s) => ['linkedin', 'bluesky', 'youtube', 'cncf', 'eventbrite'].includes(s.key));
  co.addText(
    socials.flatMap((s, i) => [
      ...(i ? [{ text: '    ·    ', options: { color: '999999' } }] : []),
      { text: s.title, options: { color: BURGUNDY, fontFace: FONT_BODY, hyperlink: { url: s.href } } },
    ]),
    { x: 1.5, y: 2.6, w: W - 3, h: 0.5, fontSize: 16, align: 'center' },
  );
  co.addText('cloudnative.lv', {
    x: 0, y: 3.5, w: W, h: 0.5, fontSize: 22, fontFace: FONT_BODY, bold: true, color: BURGUNDY, align: 'center',
    hyperlink: { url: 'https://cloudnative.lv' },
  });

  // --- 6) Feedback QR (optional — skipped if generation fails).
  try {
    const qr = await QRCode.toDataURL(`https://cloudnative.lv/events/${event.slug}/feedback`, { margin: 1, width: 600, color: { dark: '#8B1538', light: '#ffffff' } });
    const fb = textSlide();
    fb.addText('Help us get better for future events!', {
      x: 1.5, y: 1.0, w: W - 3, h: 0.7, fontSize: 24, fontFace: FONT_TITLE, color: '303030', align: 'center',
    });
    fb.addImage({ data: qr, x: (W - 3.0) / 2, y: 2.2, w: 3.0, h: 3.0 });
    fb.addText(`cloudnative.lv/events/${event.slug}/feedback`, {
      x: 1.5, y: 5.5, w: W - 3, h: 0.4, fontSize: 12, fontFace: FONT_TITLE, color: '999999', align: 'center',
    });
  } catch { /* QR optional */ }

  // --- 7) Thank you + event page link.
  const cl = textSlide();
  cl.addText('Thank you!', {
    x: 0, y: 2.4, w: W, h: 1.2, fontSize: 48, fontFace: FONT_TITLE, bold: true, color: BURGUNDY, align: 'center',
  });
  cl.addText(`Slides & photos: cloudnative.lv/events/${event.slug}`, {
    x: 1.5, y: 3.8, w: W - 3, h: 0.5, fontSize: 16, fontFace: FONT_TITLE, color: '777777', align: 'center',
  });

  await pptx.writeFile({ fileName: `${event.slug}-deck.pptx` });
}

// Build time-based agenda lines from the event description (which contains the
// time slots) or fall back to synthesizing from talks.
function buildAgendaLines(event, talks) {
  // Try parsing timed lines from the description (format: "HH:MM: Description").
  const desc = event.description || '';
  const timedLines = desc.split('\n').filter((l) => /^\s*\d{1,2}:\d{2}\s*:/.test(l));
  if (timedLines.length >= 3) {
    return timedLines.map((l) => {
      const text = l.trim();
      const isTalk = talks.some((t) => text.toLowerCase().includes(t.title?.toLowerCase()?.slice(0, 20)));
      return { text, highlight: isTalk, dim: false };
    });
  }

  // Fallback: synthesize from event time + talks.
  const lines = [];
  const doorTime = event.time || '18:00';
  const talkStart = startTime(event) || doorTime;
  lines.push({ text: `${doorTime}:  Doors open`, highlight: false, dim: false });
  lines.push({ text: `${talkStart}:  Welcome by Cloud Native Latvia  ← we are here`, highlight: true, dim: false });

  talks.forEach((t, i) => {
    const names = talkSpeakerNames(t).join(', ');
    const suffix = names ? ` by ${names}` : '';
    // Estimate time offset (15 min welcome + 45 min per talk + 15 min break).
    const mins = parseInt(talkStart.split(':')[1] || '0', 10) + 15 + i * 60;
    const hrs = parseInt(talkStart.split(':')[0] || '18', 10) + Math.floor(mins / 60);
    const mm = String(mins % 60).padStart(2, '0');
    lines.push({ text: `${hrs}:${mm}:  ${t.title}${suffix}`, highlight: false, dim: false });
    if (i < talks.length - 1) {
      const bMins = mins + 45;
      const bHrs = parseInt(talkStart.split(':')[0] || '18', 10) + Math.floor(bMins / 60);
      const bMm = String(bMins % 60).padStart(2, '0');
      lines.push({ text: `${bHrs}:${bMm}:  Break with snacks`, highlight: false, dim: true });
    }
  });

  const endTime = event.endTime || '21:00';
  lines.push({ text: `${endTime}:  Doors close`, highlight: false, dim: true });
  return lines;
}
