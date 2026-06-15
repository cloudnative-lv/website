// Brand share-card generators — hand-built SVG rasterised with sharp, reusing the brand
// palette + the Riga skyline + the stacked Cloud Native Latvia lockup. No kit/CI pipeline.
//   renderInfographics  — community "Year One" stat cards (part of report:subscribers)
//   renderSponsorsCard  — partners/supporters card (its own op: generate:sponsors-card)
import sharp from 'sharp';
import path from 'node:path';
import { venueProviders, supporters } from '../../src/data/partners.js';

const BURGUNDY = '#8b1538', PINK = '#d4567c', ROSE = '#fdf2f4';
const SUBTITLE = 'A full year of cloud native in Latvia';
const FONT = 'Helvetica, Arial, sans-serif';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (x, y, s, { size, fill, weight = 700, anchor = 'middle', spacing = 0 }) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ''}>${esc(s)}</text>`;

// A stat = big pink number with a small burgundy uppercase label below (centred on cx).
const statCentered = (cx, numBaseline, { value, label }, numSize, labelSize) =>
  text(cx, numBaseline, value, { size: numSize, fill: PINK, weight: 800 }) +
  text(cx, numBaseline + labelSize + numSize * 0.06, label, { size: labelSize, fill: BURGUNDY, weight: 700, spacing: labelSize * 0.08 });

// Rasterise an SVG/PNG asset to a base64 PNG data URI so it can be <image>-embedded
// (librsvg renders nested SVG unreliably; a flattened PNG always composites cleanly).
async function pngUri(file, width) {
  const buf = await sharp(file, { density: 320 }).resize({ width: Math.round(width), withoutEnlargement: false }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

// Load the brand assets once and return the rose-field frame + lockup helpers.
async function brandFrame(assets) {
  const SKY = await pngUri(path.join(assets, 'brand/skyline.svg'), 1600);
  const LOGO = await pngUri(path.join(assets, 'logo-stacked.svg'), 520);
  const skyImage = (W, H, opacity = 0.16) => {
    const h = W * (1024 / 1536); // skyline viewBox is 1536×1024
    return `<image href="${SKY}" x="0" y="${H - h}" width="${W}" height="${h}" opacity="${opacity}" preserveAspectRatio="xMidYMax slice"/>`;
  };
  const logoImage = (cx, y, w) => `<image href="${LOGO}" x="${cx - w / 2}" y="${y}" width="${w}" height="${w}"/>`;
  const frame = (W, H, body) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + `<rect width="${W}" height="${H}" fill="${ROSE}"/>${skyImage(W, H)}${body}</svg>`;
  return { frame, logoImage };
}

// Community "Year One" stat cards in three channel sizes.
export async function renderInfographics({ stats, subtitle = SUBTITLE, OUT, assets = 'public/images' }) {
  const { frame, logoImage } = await brandFrame(assets);

  const square = () => {
    const W = 1080, cx = W / 2;
    return frame(W, 1080, logoImage(cx, 60, 240)
      + text(cx, 432, 'YEAR ONE', { size: 62, fill: BURGUNDY, weight: 800, spacing: 8 })
      + text(cx, 480, subtitle, { size: 28, fill: PINK, weight: 600 })
      + statCentered(326, 636, stats[0], 116, 30) + statCentered(754, 636, stats[1], 116, 30)
      + statCentered(326, 884, stats[2], 116, 30) + statCentered(754, 884, stats[3], 116, 30)
      + text(cx, 1034, 'cloudnative.lv', { size: 30, fill: PINK, weight: 700, spacing: 2 }));
  };
  const wide = () => {
    const W = 1200, H = 630;
    return frame(W, H, logoImage(1010, 44, 150)
      + text(70, 250, 'YEAR ONE', { size: 78, fill: BURGUNDY, weight: 800, anchor: 'start', spacing: 4 })
      + text(72, 300, subtitle, { size: 30, fill: PINK, weight: 600, anchor: 'start' })
      + [0, 1, 2, 3].map((i) => statCentered(192 + i * 272, 500, stats[i], 96, 26)).join(''));
  };
  const story = () => {
    const W = 1080, cx = W / 2, rows = [710, 880, 1050, 1220];
    return frame(W, 1350, logoImage(cx, 80, 230)
      + text(cx, 470, 'YEAR ONE', { size: 72, fill: BURGUNDY, weight: 800, spacing: 8 })
      + text(cx, 524, subtitle, { size: 30, fill: PINK, weight: 600 })
      + stats.map((s, i) =>
        text(500, rows[i], s.value, { size: 104, fill: PINK, weight: 800, anchor: 'end' })
        + text(540, rows[i], s.label, { size: 34, fill: BURGUNDY, weight: 700, anchor: 'start', spacing: 2 })).join('')
      + text(cx, 1316, 'cloudnative.lv', { size: 28, fill: PINK, weight: 700, spacing: 2 }));
  };

  const files = [];
  for (const [name, build] of [['community-square', square], ['community-wide', wide], ['community-story', story]]) {
    await sharp(Buffer.from(build())).png().toFile(path.join(OUT, `${name}.png`));
    files.push(`${name}.png`);
  }
  return files;
}

// Square partners/supporters card for socials. Logos come from src/data/partners.js.
export async function renderSponsorsCard({ OUT, assets = 'public/images' }) {
  const { frame, logoImage } = await brandFrame(assets);

  // A partner logo on a white rounded tile (logos vary in colour/aspect — a white tile
  // keeps them legible on the rose field; preserveAspectRatio centres + fits each).
  const logoUri = (partner) => pngUri(path.join(assets, partner.logo.replace(/^\/images\//, '')), 640);
  const tile = (uri, x, y, w, h) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.14}" fill="#ffffff"/>`
    + `<image href="${uri}" x="${x + w * 0.13}" y="${y + h * 0.18}" width="${w * 0.74}" height="${h * 0.64}" preserveAspectRatio="xMidYMid meet"/>`;

  const W = 1080, cx = W / 2;
  const venueUris = await Promise.all(venueProviders.map(logoUri));
  const supUris = await Promise.all(supporters.map(logoUri));
  let body = logoImage(cx, 54, 176)
    + text(cx, 320, 'OUR PARTNERS', { size: 54, fill: BURGUNDY, weight: 800, spacing: 6 })
    + text(cx, 362, 'The organizations that host and support us', { size: 25, fill: PINK, weight: 600 })
    + text(cx, 446, 'VENUE PARTNERS', { size: 24, fill: PINK, weight: 700, spacing: 4 });
  const vW = 380, vGap = 44, vX = (W - (2 * vW + vGap)) / 2, vY = 470, vH = 156;
  venueUris.forEach((u, i) => { body += tile(u, vX + i * (vW + vGap), vY, vW, vH); });
  body += text(cx, 706, 'SUPPORTERS', { size: 24, fill: PINK, weight: 700, spacing: 4 });
  const sW = 292, sGap = 28, sX = (W - (3 * sW + 2 * sGap)) / 2, sY = 730, sH = 146;
  supUris.forEach((u, i) => { body += tile(u, sX + i * (sW + sGap), sY, sW, sH); });
  body += text(cx, 1030, 'cloudnative.lv', { size: 30, fill: PINK, weight: 700, spacing: 2 });

  await sharp(Buffer.from(frame(W, 1080, body))).png().toFile(path.join(OUT, 'sponsors-card.png'));
  return ['sponsors-card.png'];
}
