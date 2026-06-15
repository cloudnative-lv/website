import { getEventTalks } from '../data/events';
import { getSpeakerInfo } from '../data/speakers';
import { meetupNumber, cleanTitle, dateDots, startTime, talkSpeakerNames, speakerRole, eventSchedule } from './fields';
import { allPartners } from '../data/partners';
import { SOCIAL_LINKS } from '../data/socialLinks';

const SITE = 'https://cloudnative.lv';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Build time-based agenda lines from the event's structured schedule or synthesize from talks.
function buildAgendaHtml(event, talks) {
  const sched = eventSchedule(event);
  if (sched.length >= 3) {
    return sched.map((s) => {
      const cls = s.isTalk ? ' class="highlight"' : (/break|doors\s*close/i.test(s.label) ? ' class="dim"' : '');
      return `<li${cls}>${esc(`${s.time}:  ${s.label}`)}</li>`;
    }).join('');
  }
  // Fallback: synthesize from event time + talks.
  const lines = [];
  const doorTime = event.time || '18:00';
  const talkStart = startTime(event) || doorTime;
  lines.push(`<li>${esc(doorTime)}:  Doors open</li>`);
  lines.push(`<li class="highlight">${esc(talkStart)}:  Welcome by Cloud Native Latvia  ← we are here</li>`);
  talks.forEach((t, i) => {
    const names = talkSpeakerNames(t).join(', ');
    const suffix = names ? ` by ${esc(names)}` : '';
    const mins = parseInt(talkStart.split(':')[1] || '0', 10) + 15 + i * 60;
    const hrs = parseInt(talkStart.split(':')[0] || '18', 10) + Math.floor(mins / 60);
    const mm = String(mins % 60).padStart(2, '0');
    lines.push(`<li>${hrs}:${mm}:  ${esc(t.title)}${suffix}</li>`);
    if (i < talks.length - 1) {
      const bMins = mins + 45;
      const bHrs = parseInt(talkStart.split(':')[0] || '18', 10) + Math.floor(bMins / 60);
      const bMm = String(bMins % 60).padStart(2, '0');
      lines.push(`<li class="dim">${bHrs}:${bMm}:  Break with snacks</li>`);
    }
  });
  lines.push(`<li class="dim">${esc(event.endTime || '21:00')}:  Doors close</li>`);
  return lines.join('');
}

// A self-contained HTML presentation for an event (same content as the .pptx):
// scroll-snap slides + arrow-key navigation, no external dependencies. Logos
// reference absolute cloudnative.lv URLs so the file works opened anywhere.
function buildHtmlDeck(event) {
  const talks = getEventTalks(event);
  const slides = [];

  // 1) Title
  slides.push(`<section class="title"><p class="brand">CLOUD NATIVE LATVIA</p><h1>Meetup #${meetupNumber(event)}</h1><h2>${esc(cleanTitle(event.title))}</h2><p class="meta">${esc(dateDots(event.date))} · ${esc(event.venue?.name || '')}</p></section>`);

  // 2) Agenda — time-based
  slides.push(`<section class="agenda"><h1>AGENDA</h1><p class="sub">of today's meetup</p><ul>${buildAgendaHtml(event, talks)}</ul></section>`);

  // 3) "Next up:" per talk
  talks.forEach((t) => {
    const speakers = talkSpeakerNames(t);
    const who = speakers.map((n) => {
      const info = getSpeakerInfo(n);
      const r = speakerRole(info);
      return `<p class="who"><strong>${esc(n)}</strong>${r ? `<br><span class="dim">${esc(r)}</span>` : ''}</p>`;
    }).join('');
    slides.push(`<section><p class="next-label">Next up:</p><div class="talk-title">${esc(t.title)}</div>${who}</section>`);
  });

  // 4) Sponsors
  if (allPartners.length) {
    slides.push(`<section><h1>Sponsors</h1><div class="logos">${allPartners.map((p) => `<figure><img src="${SITE}${esc(p.logo)}" alt="${esc(p.name)}"><figcaption>${esc(p.name)}</figcaption></figure>`).join('')}</div></section>`);
  }

  // 5) How to connect?
  const socials = SOCIAL_LINKS.filter((s) => ['linkedin', 'bluesky', 'youtube', 'cncf', 'eventbrite'].includes(s.key));
  slides.push(`<section class="connect"><h1>How to connect?</h1><p class="email">hello@cloudnative.lv</p><p class="socials">${socials.map((s) => `<a href="${esc(s.href)}">${esc(s.title)}</a>`).join(' · ')}</p><p class="site">cloudnative.lv</p></section>`);

  // 6) Feedback
  slides.push(`<section class="feedback"><h1>Help us get better for future events!</h1><p class="qr-url">${SITE}/events/${esc(event.slug)}/feedback</p></section>`);

  // 7) Thank you
  slides.push(`<section class="closing"><h1>Thank you!</h1><p class="dim">Slides &amp; photos: cloudnative.lv/events/${esc(event.slug)}</p></section>`);

  const nav = "document.addEventListener('keydown',function(e){var s=[].slice.call(document.querySelectorAll('section'));var i=s.findIndex(function(el){return el.getBoundingClientRect().top>=-innerHeight/2});if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key===' '){e.preventDefault();(s[i+1]||s[i]).scrollIntoView({behavior:'smooth'})}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();(s[Math.max(0,i-1)]).scrollIntoView({behavior:'smooth'})}});";

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(cleanTitle(event.title))} — Cloud Native Latvia</title><style>
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;700&display=swap');
:root{--burgundy:#8b1538;--pink:#d4567c;--rose:#fdf2f4}
*{box-sizing:border-box;margin:0}html,body{height:100%}
body{font-family:'Lexend',system-ui,sans-serif;scroll-snap-type:y mandatory;overflow-y:scroll}
section{min-height:100vh;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:8vh 10vw;background:var(--rose);text-align:center}
section.title{color:#333}
section.closing{background:var(--burgundy);color:#fff}
h1{font-size:clamp(28px,5vw,56px);font-weight:300;color:var(--burgundy);margin-bottom:.4em}
section.title h1{font-size:clamp(40px,8vw,90px);font-weight:700}
section.closing h1{color:#fff}
h2{font-size:clamp(20px,3vw,34px);font-weight:400;color:#333}
.brand{letter-spacing:.2em;color:var(--pink);font-weight:700;margin-bottom:.6em}
.meta,.dim{color:#777}.closing .dim{color:#f2d3dc}
.sub{color:#777;font-size:clamp(14px,1.5vw,18px);margin-bottom:1.5em}
.agenda ul{font-size:clamp(15px,2vw,22px);line-height:2.2;color:#303030;list-style:none;text-align:left}
.agenda ul li.highlight{font-weight:700;font-size:clamp(16px,2.2vw,24px)}
.agenda ul li.dim{color:#999}
.next-label{font-size:clamp(22px,4vw,42px);font-weight:300;color:var(--burgundy);margin-bottom:.3em}
.talk-title{font-size:clamp(20px,3vw,34px);font-weight:700;color:#303030;margin-bottom:1em;max-width:70ch}
.who{font-size:clamp(16px,2vw,22px);color:var(--burgundy);margin:.3em 0}
.logos{display:flex;gap:4vw;flex-wrap:wrap;align-items:center;justify-content:center;margin-top:1em}
.logos img{height:60px;max-width:180px;object-fit:contain}.logos figcaption{font-size:12px;color:#777;text-align:center;margin-top:.5em}
.connect .email{font-size:clamp(18px,2.5vw,28px);color:var(--pink);margin:.5em 0}
.connect .socials{font-size:clamp(14px,1.8vw,20px);color:var(--burgundy);margin:.8em 0}
.connect .socials a{color:var(--burgundy);text-decoration:none}.connect .socials a:hover{text-decoration:underline}
.connect .site{font-size:clamp(20px,3vw,30px);font-weight:700;color:var(--burgundy);margin-top:1em}
.feedback h1{font-weight:300;font-size:clamp(22px,3.5vw,40px)}
.feedback .qr-url{font-size:clamp(14px,1.6vw,18px);color:#999;margin-top:1em}
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
