import pptxgen from 'pptxgenjs';
import { getSpeakerInfo } from '../data/speakers';
import { meetupNumber, cleanTitle, dateDots, talkSpeakerNames, speakerRole } from './fields';
import { allPartners } from '../data/partners';
import { SOCIAL_LINKS } from '../data/socialLinks';
import QRCode from 'qrcode';

const BURGUNDY = '8B1538';
const PINK = 'D4567C';
const ROSE = 'FDF2F4';
const W = 13.333; // LAYOUT_WIDE inches (16:9)
const H = 7.5;

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

// Build and download an opening deck (.pptx) that matches the banner design
// system: the title and per-talk slides ARE the generated banners (cream + Riga
// skyline + burgundy bands), and the text slides (agenda, partners, feedback,
// closing) sit on the shared cream + skyline + logo background.
export async function downloadDeck(event) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Cloud Native Latvia';
  pptx.company = 'Cloud Native Latvia';
  pptx.title = cleanTitle(event.title);

  const base = `/artifacts/${event.id}`;
  const talks = event.talks || [];

  // Shared cream + skyline + logo background for the text slides.
  const deckBg = await loadImage('/artifacts/brand/deck-bg.png');
  const textSlide = () => {
    const s = pptx.addSlide();
    s.background = { color: ROSE };
    if (deckBg) s.addImage({ data: deckBg, x: 0, y: 0, w: W, h: H });
    return s;
  };

  // 1) Title — the event banner, full-bleed (fallback: text on the cream bg).
  const titleImg = await loadImage(`${base}/linkedin-event.png`);
  if (titleImg) {
    const t = pptx.addSlide();
    t.background = { color: ROSE };
    t.addImage({ data: titleImg, x: 0, y: 0, w: W, h: H });
  } else {
    const t = textSlide();
    t.addText('CLOUD NATIVE LATVIA', { x: 0.9, y: 2.2, w: W - 1.8, h: 0.6, fontSize: 24, bold: true, color: PINK, charSpacing: 3 });
    t.addText(`Meetup #${meetupNumber(event)}`, { x: 0.9, y: 2.9, w: W - 1.8, h: 1.0, fontSize: 46, bold: true, color: BURGUNDY });
    t.addText(cleanTitle(event.title), { x: 0.9, y: 4.0, w: W - 1.8, h: 1.0, fontSize: 26, color: '333333' });
    t.addText(`${dateDots(event.date)}   ·   ${event.venue?.name || ''}`, { x: 0.9, y: 5.0, w: W - 1.8, h: 0.5, fontSize: 18, color: '777777' });
  }

  // 2) Agenda.
  const ag = textSlide();
  ag.addText('Agenda', { x: 0.9, y: 0.55, w: W - 1.8, h: 0.9, fontSize: 34, bold: true, color: BURGUNDY });
  ag.addText(
    talks.map((t) => {
      const who = talkSpeakerNames(t).join(', ');
      return { text: cleanTitle(t.title) + (who ? `   —   ${who}` : ''), options: { fontSize: 22, color: '333333', bullet: { code: '2022', indent: 20 }, paraSpaceAfter: 16 } };
    }),
    { x: 1.1, y: 1.7, w: W - 2.2, h: 4.6 },
  );

  // 3) One slide per talk — the speaker banner, full-bleed (fallback: text).
  for (let i = 0; i < talks.length; i++) {
    const t = talks[i];
    const names = talkSpeakerNames(t);
    const banner = names.length ? await loadImage(`${base}/speaker-${i + 1}.png`) : null;
    if (banner) {
      const s = pptx.addSlide();
      s.background = { color: ROSE };
      s.addImage({ data: banner, x: 0, y: 0, w: W, h: H });
    } else {
      const s = textSlide();
      s.addText(cleanTitle(t.title), { x: 0.9, y: 0.7, w: W - 1.8, h: 1.3, fontSize: 30, bold: true, color: BURGUNDY });
      if (names.length) {
        s.addText(
          names.map((name) => {
            const info = getSpeakerInfo(name);
            const role = speakerRole(info);
            return { text: name + (role ? `\n${role}` : ''), options: { fontSize: 20, bold: true, color: BURGUNDY, paraSpaceAfter: 12 } };
          }),
          { x: 1.1, y: 2.1, w: W - 2.2, h: 1.6 },
        );
      }
      if (t.description) s.addText(t.description, { x: 1.1, y: 3.8, w: W - 2.2, h: 2.8, fontSize: 15, color: '555555' });
    }
  }

  // 4) Partners (logos best-effort; names always shown).
  if (allPartners.length) {
    const logos = await Promise.all(allPartners.map((p) => loadImage(p.logo)));
    const pa = textSlide();
    pa.addText('Thanks to our partners', { x: 0.9, y: 0.6, w: W - 1.8, h: 0.9, fontSize: 32, bold: true, color: BURGUNDY });
    const cellW = (W - 1.8) / allPartners.length;
    allPartners.forEach((p, i) => {
      const x = 0.9 + i * cellW;
      if (logos[i]) pa.addImage({ data: logos[i], x: x + 0.2, y: 2.7, w: cellW - 0.4, h: 1.3, sizing: { type: 'contain', w: cellW - 0.4, h: 1.3 } });
      pa.addText(p.name, { x, y: 4.2, w: cellW, h: 0.4, fontSize: 12, align: 'center', color: '666666' });
    });
  }

  // 5) Feedback QR (optional — skipped if generation fails).
  try {
    const qr = await QRCode.toDataURL(`https://cloudnative.lv/events/${event.slug}/feedback`, { margin: 1, width: 600, color: { dark: '#881337', light: '#ffffff' } });
    const fb = textSlide();
    fb.addText('Your feedback', { x: 0.9, y: 0.9, w: W - 1.8, h: 0.9, fontSize: 34, bold: true, color: BURGUNDY, align: 'center' });
    fb.addImage({ data: qr, x: (W - 2.8) / 2, y: 2.0, w: 2.8, h: 2.8 });
    fb.addText('Scan to share your thoughts', { x: 0.9, y: 5.0, w: W - 1.8, h: 0.5, fontSize: 18, color: '666666', align: 'center' });
  } catch { /* QR optional */ }

  // 6) Closing + connect.
  const cl = textSlide();
  cl.addText('Thank you!', { x: 0.9, y: 1.6, w: W - 1.8, h: 1.1, fontSize: 46, bold: true, color: BURGUNDY });
  cl.addText('cloudnative.lv', { x: 0.9, y: 2.8, w: W - 1.8, h: 0.6, fontSize: 26, bold: true, color: PINK });
  const socials = SOCIAL_LINKS.filter((s) => ['linkedin', 'bluesky', 'youtube', 'cncf', 'eventbrite'].includes(s.key));
  cl.addText(
    socials.flatMap((s, i) => [
      ...(i ? [{ text: '    ·    ', options: { color: '999999' } }] : []),
      { text: s.title, options: { color: BURGUNDY, hyperlink: { url: s.href } } },
    ]),
    { x: 0.9, y: 3.7, w: W - 1.8, h: 0.5, fontSize: 16 },
  );
  cl.addText(`Slides & photos: cloudnative.lv/events/${event.slug}`, { x: 0.9, y: 4.4, w: W - 1.8, h: 0.5, fontSize: 14, color: '777777' });

  await pptx.writeFile({ fileName: `${event.slug}-deck.pptx` });
}
