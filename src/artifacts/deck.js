import pptxgen from 'pptxgenjs';
import { getEventTalks } from '../data/events';
import { getSpeakerInfo } from '../data/speakers';
import { meetupNumber, cleanTitle, dateDots } from './fields';

const BURGUNDY = '8B1538';
const PINK = 'D4567C';
const ROSE = 'FDF2F4';

// Build and download an opening deck (.pptx) for an event, from its metadata:
// title slide, agenda, one slide per talk (speaker + role + abstract), closing.
export async function downloadDeck(event) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
  pptx.author = 'Cloud Native Latvia';
  pptx.company = 'Cloud Native Latvia';
  pptx.title = cleanTitle(event.title);

  const talks = getEventTalks(event);
  const W = 13.333;

  const t1 = pptx.addSlide();
  t1.background = { color: ROSE };
  t1.addText('CLOUD NATIVE LATVIA', { x: 0.8, y: 2.1, w: W - 1.6, h: 0.7, fontSize: 26, bold: true, color: PINK, charSpacing: 3 });
  t1.addText(`Meetup #${meetupNumber(event)}`, { x: 0.8, y: 2.85, w: W - 1.6, h: 1.1, fontSize: 48, bold: true, color: BURGUNDY });
  t1.addText(cleanTitle(event.title), { x: 0.8, y: 4.15, w: W - 1.6, h: 1, fontSize: 26, color: '333333' });
  t1.addText(`${dateDots(event.date)}   ·   ${event.venue?.name || ''}`, { x: 0.8, y: 5.3, w: W - 1.6, h: 0.6, fontSize: 18, color: '777777' });

  const ag = pptx.addSlide();
  ag.background = { color: 'FFFFFF' };
  ag.addText('Agenda', { x: 0.8, y: 0.5, w: W - 1.6, h: 0.9, fontSize: 34, bold: true, color: BURGUNDY });
  ag.addText(
    talks.map((t) => {
      const sp = (t.speakers || (t.speaker ? [t.speaker] : [])).join(', ');
      return { text: t.title + (sp ? `   —   ${sp}` : ''), options: { fontSize: 22, color: '333333', bullet: { code: '2022', indent: 20 }, paraSpaceAfter: 16 } };
    }),
    { x: 1.0, y: 1.7, w: W - 2, h: 5 },
  );

  talks.forEach((t) => {
    const s = pptx.addSlide();
    s.background = { color: 'FFFFFF' };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 1.7, fill: { color: BURGUNDY } });
    s.addText(t.title, { x: 0.8, y: 0.2, w: W - 1.6, h: 1.3, fontSize: 28, bold: true, color: 'FFFFFF', valign: 'middle' });
    const speakers = t.speakers || (t.speaker ? [t.speaker] : []);
    if (speakers.length) {
      s.addText(
        speakers.map((name) => {
          const info = getSpeakerInfo(name);
          const role = [info.title, info.company].filter(Boolean).join('  ·  ');
          return { text: name + (role ? `\n${role}` : ''), options: { fontSize: 20, bold: true, color: BURGUNDY, paraSpaceAfter: 12 } };
        }),
        { x: 1.0, y: 2.2, w: W - 2, h: 1.6 },
      );
    }
    if (t.description) s.addText(t.description, { x: 1.0, y: 3.9, w: W - 2, h: 3, fontSize: 14, color: '555555' });
  });

  const cl = pptx.addSlide();
  cl.background = { color: BURGUNDY };
  cl.addText('Thank you!', { x: 0.8, y: 2.6, w: W - 1.6, h: 1.1, fontSize: 44, bold: true, color: 'FFFFFF' });
  cl.addText('cloudnative.lv', { x: 0.8, y: 3.9, w: W - 1.6, h: 0.7, fontSize: 26, color: 'FFFFFF' });
  cl.addText(`Slides & photos: cloudnative.lv/events/${event.slug}`, { x: 0.8, y: 4.7, w: W - 1.6, h: 0.6, fontSize: 16, color: 'F2D3DC' });

  await pptx.writeFile({ fileName: `${event.slug}-deck.pptx` });
}
