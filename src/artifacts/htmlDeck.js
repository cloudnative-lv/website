import { getEventTalks } from '../data/events';
import { getSpeakerInfo } from '../data/speakers';
import { cleanTitle, startTime, talkSpeakerNames, eventSchedule } from './fields';
import { allPartners } from '../data/partners';
import { connectSocials } from '../data/socialLinks';
import { filledIconSvg, emailIconSvg } from './deckIcons';
import QRCode from 'qrcode';

const SITE = 'https://cloudnative.lv';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Existing brand SVGs, reused so the deck matches the site / banners exactly.
const SKYLINE = `${SITE}/images/brand/skyline.svg`;
const LOGO = `${SITE}/images/logo-stacked.svg`;
const ANDREY = `${SITE}/images/stickers/sticker_andrey.svg`;
const LINDA = `${SITE}/images/stickers/sticker_linda.svg`;

// Absolute URL for a (possibly relative) asset href, so the standalone file works anywhere.
const abs = (href) => (/^https?:/.test(href) ? href : `${SITE}${href}`);
const socialUrl = (href) => (/^https?:|^mailto:/.test(href) ? href : `${SITE}${href}`);

// The skyline as an inline <svg><image preserveAspectRatio="none"> so it stretches
// to fill its box (the source SVG's own preserveAspectRatio would otherwise letterbox
// it). `extraClass` lets the title slide use a taller strip.
const skylineEl = (extraClass = '') => `<svg class="skyline ${extraClass}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><image href="${SKYLINE}" x="0" y="0" width="100" height="100" preserveAspectRatio="none"/></svg>`;

// Shared bottom chrome on content slides: the Riga skyline strip + the stacked logo
// bottom-right, mirroring the original opening deck.
const chrome = () => `${skylineEl()}<img class="deck-logo" src="${LOGO}" alt="Cloud Native Latvia" aria-hidden="true">`;

// Inline SVG QR for a connect link; embeds directly so the deck stays a single
// self-contained file with no network dependency.
async function qrSvg(url) {
  try {
    return await QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#8b1538', light: '#ffffff' } });
  } catch {
    return '';
  }
}

// Build time-based agenda rows from the event's structured schedule or synthesize from talks.
// Each row: { time, label, isTalk, isDim, here } so the template can colour talks burgundy.
function agendaRows(event, talks) {
  const sched = eventSchedule(event);
  if (sched.length >= 3) {
    return sched.map((s) => ({
      time: s.time,
      label: s.label,
      isTalk: s.isTalk,
      isDim: /break|doors\s*close/i.test(s.label),
    }));
  }
  const rows = [];
  const doorTime = event.time || '18:00';
  const talkStart = startTime(event) || doorTime;
  rows.push({ time: doorTime, label: 'Doors open' });
  rows.push({ time: talkStart, label: 'Welcome by Cloud Native Latvia', here: true });
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

function agendaHtml(event, talks) {
  return agendaRows(event, talks).map((r) => {
    const cls = r.isTalk ? ' class="talk"' : (r.isDim ? ' class="dim"' : '');
    const here = r.here ? ' <i class="here">&larr; we are here</i>' : '';
    return `<li${cls}><span class="t">${esc(r.time)}:</span> <span class="l">${esc(r.label)}</span>${here}</li>`;
  }).join('');
}

// A burgundy "Next up" speaker card: circular ringed photo on the left, name +
// role + company on the right — matching the original deck's talk slides.
function speakerCard(name) {
  const info = getSpeakerInfo(name);
  const role = info.title;
  const org = info.company;
  const photo = info.photo
    ? `<img class="spk-photo" src="${abs(info.photo)}" alt="${esc(name)}">`
    : '<span class="spk-photo spk-photo--blank"></span>';
  return `<div class="spk-card">${photo}<div class="spk-meta"><p class="spk-name">${esc(name)}</p>${role ? `<p class="spk-role">${esc(role)}</p>` : ''}${org ? `<p class="spk-org">@ ${esc(org)}</p>` : ''}</div></div>`;
}

async function buildHtmlDeck(event) {
  const talks = getEventTalks(event);
  const slides = [];

  // 1) Title — big centered logo over the skyline (branding only, like the original).
  slides.push(`<section class="title"><img class="title-logo" src="${LOGO}" alt="Cloud Native Latvia">${skylineEl('title-skyline')}</section>`);

  // 2) Agenda — time-based; talk titles in burgundy.
  slides.push(`<section class="agenda"><div class="content"><h1>AGENDA</h1><p class="sub">of today's meetup</p><ul>${agendaHtml(event, talks)}</ul></div>${chrome()}</section>`);

  // 3) Organizers intro — Andrey & Linda illustrations.
  slides.push(`<section class="intro"><div class="content"><div class="intro-people"><figure><img src="${ANDREY}" alt="Andrey"><figcaption class="burgundy">ANDREY</figcaption></figure><figure><img src="${LINDA}" alt="Linda"><figcaption class="pink">LINDA</figcaption></figure></div></div>${chrome()}</section>`);

  // 4) Sponsors
  if (allPartners.length) {
    const logos = allPartners.map((p) => `<figure><img src="${abs(p.logo)}" alt="${esc(p.name)}"></figure>`).join('');
    slides.push(`<section class="sponsors"><div class="content"><h1>Sponsors</h1><div class="logos">${logos}</div><p class="join">Wanna join?</p></div>${chrome()}</section>`);
  }

  // 5) How to connect? — email + platform icon/label/QR.
  const socials = connectSocials();
  const qrs = await Promise.all(socials.map((s) => qrSvg(socialUrl(s.href))));
  const channels = socials.map((s, i) => `<a class="ch" href="${esc(socialUrl(s.href))}"><span class="ch-icon">${filledIconSvg(s.key, '#8b1538', '100%')}</span><span class="ch-label">${esc(s.title)}</span><span class="ch-qr">${qrs[i]}</span></a>`).join('');
  slides.push(`<section class="connect"><div class="content"><h1>How to connect?</h1><p class="email"><span class="email-icon">${emailIconSvg('#8b1538', '100%')}</span> hello@cloudnative.lv</p><div class="connect-grid">${channels}</div></div>${chrome()}</section>`);

  // 6) "Next up:" per talk — burgundy speaker cards (shown between talks at the event).
  talks.forEach((t) => {
    const cards = talkSpeakerNames(t).map(speakerCard).join('');
    slides.push(`<section class="nextup"><div class="content"><p class="next-label">Next up:</p><h2 class="talk-title">${esc(t.title)}</h2><div class="cards">${cards}</div></div>${chrome()}</section>`);
  });

  // 7) Feedback — QR to the event feedback form (closing slide, like the original).
  const fbUrl = `${SITE}/events/${event.slug}/feedback`;
  const fbQr = await qrSvg(fbUrl);
  slides.push(`<section class="feedback"><div class="content"><h1>Help us get better for future events!</h1><div class="fb-qr">${fbQr}</div><p class="qr-url">${esc(`cloudnative.lv/events/${event.slug}/feedback`)}</p></div>${chrome()}</section>`);

  // 8) Thank you
  slides.push(`<section class="closing"><div class="content"><h1>Thank you!</h1><p class="dim">Slides &amp; photos: cloudnative.lv/events/${esc(event.slug)}</p></div></section>`);

  const nav = "document.addEventListener('keydown',function(e){var s=[].slice.call(document.querySelectorAll('section'));var i=s.findIndex(function(el){return el.getBoundingClientRect().top>=-innerHeight/2});if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key===' '){e.preventDefault();(s[i+1]||s[i]).scrollIntoView({behavior:'smooth'})}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();(s[Math.max(0,i-1)]).scrollIntoView({behavior:'smooth'})}});";

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(cleanTitle(event.title))} — Cloud Native Latvia</title><style>
@font-face{font-family:'Lexend';font-style:normal;font-weight:100 900;font-display:swap;src:url('${SITE}/fonts/lexend-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Lexend';font-style:normal;font-weight:100 900;font-display:swap;src:url('${SITE}/fonts/lexend-latin-ext.woff2') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
:root{--burgundy:#8b1538;--pink:#d4567c;--rose:#fdf2f4;--ink:#303030}
*{box-sizing:border-box;margin:0}html,body{height:100%}
body{font-family:'Lexend',system-ui,sans-serif;color:var(--ink);background:var(--rose);scroll-snap-type:y mandatory;overflow-y:scroll}
section{position:relative;min-height:100vh;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:7vh 8vw;text-align:center;overflow:hidden}
.content{position:relative;z-index:2;width:100%;display:flex;flex-direction:column;align-items:center}
/* Content slides: a short skyline strip along the bottom, stretched full-width
   (vertically compressed, like the original deck). */
.skyline{position:absolute;left:0;right:0;bottom:0;width:100%;height:clamp(108px,20vh,190px);z-index:0;pointer-events:none;user-select:none}
.deck-logo{position:absolute;right:3.5vw;bottom:3vh;width:clamp(96px,9vw,150px);height:auto;z-index:1;pointer-events:none}
/* Section headings use Lexend Light (300), near-black — matching the original deck. */
h1{font-size:clamp(30px,4.6vw,54px);font-weight:300;color:var(--ink);margin-bottom:.5em}
.dim{color:#8a7d80}.burgundy{color:var(--burgundy)}.pink{color:var(--pink)}
/* Title */
section.title{justify-content:center;padding:0 0 15vh}
.title-logo{width:clamp(320px,46vw,720px);height:auto;z-index:2}
/* Title skyline: full width along the bottom ~62% (so the wordmark clears the
   building tops, like the original). */
.title-skyline{height:62vh}
/* Agenda */
.agenda .sub{font-style:italic;color:#555;font-size:clamp(15px,1.7vw,21px);margin-top:-.4em;margin-bottom:1.6em}
.agenda ul{list-style:none;text-align:left;font-size:clamp(15px,1.85vw,23px);line-height:1.85;max-width:64ch}
.agenda li{margin:.15em 0}
.agenda li .t{font-weight:800;color:var(--ink)}
.agenda li .l{font-weight:600;color:var(--ink)}
.agenda li.talk .l{font-weight:700;color:var(--burgundy)}
.agenda li.dim .l{color:#8a7d80;font-weight:500}
.agenda li .here{color:var(--burgundy);font-weight:500}
/* Intro (Andrey & Linda) */
.intro-people{display:flex;gap:5vw;align-items:flex-start;justify-content:center}
.intro-people figure{display:flex;flex-direction:column;align-items:center}
.intro-people img{height:clamp(200px,40vh,430px);width:auto}
.intro-people figcaption{font-size:clamp(22px,3vw,40px);font-weight:800;letter-spacing:.04em;margin-top:.15em}
/* Next up — speaker cards */
.next-label{font-size:clamp(22px,3.4vw,40px);font-weight:300;color:var(--ink);margin-bottom:.4em}
.talk-title{font-size:clamp(22px,3vw,38px);font-weight:700;color:var(--ink);margin-bottom:1.1em;max-width:24ch;line-height:1.15}
.cards{display:flex;flex-direction:column;gap:clamp(14px,2vh,26px);width:100%;max-width:760px}
.spk-card{display:flex;align-items:center;gap:clamp(16px,2vw,30px);background:var(--burgundy);border-radius:14px;padding:clamp(12px,1.6vh,20px) clamp(24px,2.6vw,38px) clamp(12px,1.6vh,20px) clamp(120px,13vw,180px);position:relative;min-height:clamp(108px,16vh,160px)}
.spk-photo{position:absolute;left:clamp(-30px,-2vw,-20px);width:clamp(104px,12vw,160px);height:clamp(104px,12vw,160px);border-radius:50%;object-fit:cover;border:4px solid var(--rose);box-shadow:0 3px 12px rgba(0,0,0,.25)}
.spk-photo--blank{background:#b07487}
.spk-meta{text-align:left;color:#fff}
.spk-name{font-size:clamp(18px,2.2vw,30px);font-weight:700}
.spk-role{font-size:clamp(14px,1.6vw,21px);font-style:italic;font-weight:300;opacity:.95}
.spk-org{font-size:clamp(14px,1.6vw,21px);font-style:italic;font-weight:300;opacity:.85}
/* Sponsors */
.sponsors .logos{display:flex;gap:clamp(24px,5vw,72px);flex-wrap:wrap;align-items:center;justify-content:center;margin:1.4em 0}
.sponsors .logos img{height:clamp(40px,6vh,72px);max-width:230px;object-fit:contain}
.sponsors .join{font-size:clamp(20px,2.6vw,32px);font-weight:800;color:var(--ink);margin-top:.6em}
/* Connect */
.connect .email{display:flex;align-items:center;justify-content:center;gap:.5em;font-size:clamp(20px,2.6vw,32px);color:var(--burgundy);font-weight:500;margin-bottom:1.2em}
.connect .email-icon{width:clamp(28px,2.6vw,40px);height:clamp(28px,2.6vw,40px);display:inline-flex}
.connect-grid{display:flex;gap:clamp(28px,5vw,80px);flex-wrap:wrap;align-items:flex-start;justify-content:center}
.ch{display:flex;flex-direction:column;align-items:center;gap:.6em;text-decoration:none;color:var(--burgundy)}
.ch-icon{width:clamp(40px,4vw,60px);height:clamp(40px,4vw,60px);display:flex}
.ch-label{font-size:clamp(15px,1.7vw,22px);font-weight:700}
.ch-qr{display:block;width:clamp(110px,12vw,170px);background:#fff;padding:8px;border-radius:8px}
.ch-qr svg{display:block;width:100%;height:auto}
/* Feedback */
.feedback h1{font-weight:300;font-size:clamp(22px,3.2vw,40px)}
.fb-qr{width:clamp(180px,20vw,260px);background:#fff;padding:12px;border-radius:12px;margin:.4em 0 .8em}
.fb-qr svg{display:block;width:100%;height:auto}
.feedback .qr-url{font-size:clamp(13px,1.5vw,18px);color:#8a7d80}
/* Closing */
section.closing{background:var(--burgundy);color:#fff}
section.closing h1{color:#fff;font-weight:300}
section.closing .dim{color:#f2d3dc}
</style></head><body>${slides.join('')}<script>${nav}</script></body></html>`;

  return html;
}

export async function openHtmlDeck(event) {
  const url = URL.createObjectURL(new Blob([await buildHtmlDeck(event)], { type: 'text/html' }));
  window.open(url, '_blank');
}

export async function downloadHtmlDeck(event) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([await buildHtmlDeck(event)], { type: 'text/html' }));
  a.download = `${event.slug}-deck.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
