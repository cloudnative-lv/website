import { getEventTalks } from '../data/events';
import { getSpeakerInfo } from '../data/speakers';
import { meetupNumber, cleanTitle, dateDots } from './fields';
import { allPartners } from '../data/partners';

const SITE = 'https://cloudnative.lv';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// A self-contained HTML presentation for an event (same content as the .pptx):
// scroll-snap slides + arrow-key navigation, no external dependencies. Logos
// reference absolute cloudnative.lv URLs so the file works opened anywhere.
function buildHtmlDeck(event) {
  const talks = getEventTalks(event);
  const slides = [];

  slides.push(`<section class="title"><p class="brand">CLOUD NATIVE LATVIA</p><h1>Meetup #${meetupNumber(event)}</h1><h2>${esc(cleanTitle(event.title))}</h2><p class="meta">${esc(dateDots(event.date))} · ${esc(event.venue?.name || '')}</p></section>`);

  slides.push(`<section><h1>Agenda</h1><ul>${talks.map((t) => {
    const sp = (t.speakers || (t.speaker ? [t.speaker] : [])).join(', ');
    return `<li>${esc(t.title)}${sp ? ` <span class="dim">— ${esc(sp)}</span>` : ''}</li>`;
  }).join('')}</ul></section>`);

  talks.forEach((t) => {
    const speakers = t.speakers || (t.speaker ? [t.speaker] : []);
    const who = speakers.map((n) => {
      const i = getSpeakerInfo(n);
      const r = [i.title, i.company].filter(Boolean).join(' · ');
      return `<p class="who"><strong>${esc(n)}</strong>${r ? `<br><span class="dim">${esc(r)}</span>` : ''}</p>`;
    }).join('');
    slides.push(`<section><div class="bar"><h1>${esc(t.title)}</h1></div>${who}${t.description ? `<p class="desc">${esc(t.description)}</p>` : ''}</section>`);
  });

  if (allPartners.length) {
    slides.push(`<section><h1>Thanks to our partners</h1><div class="logos">${allPartners.map((p) => `<figure><img src="${SITE}${esc(p.logo)}" alt="${esc(p.name)}"><figcaption>${esc(p.name)}</figcaption></figure>`).join('')}</div></section>`);
  }

  slides.push(`<section class="closing"><h1>Thank you!</h1><p class="big">cloudnative.lv</p><p class="dim">Slides &amp; photos: cloudnative.lv/events/${esc(event.slug)}</p></section>`);

  const nav = "document.addEventListener('keydown',function(e){var s=[].slice.call(document.querySelectorAll('section'));var i=s.findIndex(function(el){return el.getBoundingClientRect().top>=-innerHeight/2});if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key===' '){e.preventDefault();(s[i+1]||s[i]).scrollIntoView({behavior:'smooth'})}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();(s[Math.max(0,i-1)]).scrollIntoView({behavior:'smooth'})}});";

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(cleanTitle(event.title))} — Cloud Native Latvia</title><style>
:root{--burgundy:#8b1538;--pink:#d4567c;--rose:#fdf2f4}
*{box-sizing:border-box;margin:0}html,body{height:100%}
body{font-family:'Noto Sans',system-ui,sans-serif;scroll-snap-type:y mandatory;overflow-y:scroll}
section{min-height:100vh;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:center;padding:8vh 10vw;background:#fff}
section.title{background:var(--rose);color:#333;text-align:center;align-items:center}
section.closing{background:var(--burgundy);color:#fff;text-align:center;align-items:center}
h1{font-size:clamp(28px,5vw,56px);color:var(--burgundy);margin-bottom:.4em}
section.title h1{font-size:clamp(40px,8vw,90px)}section.closing h1{color:#fff}
h2{font-size:clamp(20px,3vw,34px);font-weight:600;color:#333}
.brand{letter-spacing:.2em;color:var(--pink);font-weight:700;margin-bottom:.6em}
.meta,.dim{color:#777}.closing .dim{color:#f2d3dc}
ul{font-size:clamp(18px,2.4vw,28px);line-height:2;color:#333;list-style:none}
ul li::before{content:'▸ ';color:var(--pink)}
.bar{background:var(--burgundy);margin:-8vh -10vw 1em;padding:6vh 10vw}.bar h1{color:#fff;margin:0}
.who{font-size:clamp(16px,2vw,22px);color:var(--burgundy);margin:.3em 0}
.desc{font-size:clamp(14px,1.6vw,18px);color:#555;margin-top:1em;max-width:62ch}
.big{font-size:clamp(22px,3vw,34px);margin:.4em 0}
.logos{display:flex;gap:4vw;flex-wrap:wrap;align-items:center}
.logos img{height:60px;max-width:180px;object-fit:contain}.logos figcaption{font-size:12px;color:#777;text-align:center;margin-top:.5em}
</style></head><body>${slides.join('')}<script>${nav}</script></body></html>`;

  return html;
}

export function openHtmlDeck(event) {
  const url = URL.createObjectURL(new Blob([buildHtmlDeck(event)], { type: 'text/html' }));
  window.open(url, '_blank');
}

export function downloadHtmlDeck(event) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([buildHtmlDeck(event)], { type: 'text/html' }));
  a.download = `${event.slug}-deck.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
