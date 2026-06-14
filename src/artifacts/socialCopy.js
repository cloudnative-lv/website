import {
  meetupNumber, cleanTitle, dateLong, startTime, venueLine,
  talkSpeakerNames, speakerRole,
} from './fields';
import { getSpeakerInfo, speakerSlug } from '../data/speakers';

// Deterministic English post copy generated from event metadata. Returned as
// plain strings so the same output feeds both the .md files and the kit page's
// copy-to-clipboard blocks.

const HOUSE_TAGS = ['#CloudNative', '#Kubernetes', '#Riga', '#Latvia'];

const tagToHashtag = (tag) => {
  const t = String(tag).trim();
  if (t.length <= 3) return '#' + t.toUpperCase(); // ai -> #AI, gpu -> #GPU
  return '#' + t.split(/[-\s]+/).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
};

const hashtags = (event) =>
  [...new Set([...(event.tags || []).map(tagToHashtag), ...HOUSE_TAGS])].join(' ');

const registerLine = (event) =>
  event.cncfUrl ? `Register: ${event.cncfUrl}` : (event.eventbriteUrl ? `Register: ${event.eventbriteUrl}` : '');

const firstSentence = (text) => {
  const s = String(text || '').trim().match(/^.*?[.!?](\s|$)/);
  return s ? s[0].trim() : String(text || '').trim();
};

export const announcementPost = (event) => {
  const lines = [
    `🚀 Cloud Native Latvia Meetup #${meetupNumber(event)}: ${cleanTitle(event.title)}`,
    '',
    `📅 ${dateLong(event.date)}${startTime(event) ? `, ${startTime(event)}` : ''}`,
    `📍 ${venueLine(event.venue)}`,
    '',
    'Talks:',
    ...(event.talks || []).map((t) => {
      const who = talkSpeakerNames(t).join(' & ');
      return `• ${t.title}${who ? ` - ${who}` : ''}`;
    }),
    '',
  ];
  const reg = registerLine(event);
  if (reg) lines.push(reg, '');
  lines.push(hashtags(event));
  return lines.join('\n');
};

export const speakerIntroPost = (event, talk) => {
  const speakers = talkSpeakerNames(talk).map(getSpeakerInfo);
  const names = speakers.map((s) => s.name).join(' & ');
  const roles = speakers.map(speakerRole).filter(Boolean).join(' · ');
  const lines = [
    `🎤 Speaker spotlight - Meetup #${meetupNumber(event)}: ${names}${roles ? ` (${roles})` : ''}`,
    '',
    `“${talk.title}”`,
    '',
  ];
  if (talk.description) lines.push(firstSentence(talk.description), '');
  lines.push(`📅 ${dateLong(event.date)} · ${venueLine(event.venue)}`);
  const reg = registerLine(event);
  if (reg) lines.push('', reg);
  lines.push('', hashtags(event));
  return lines.join('\n');
};

// A thank-you email draft for one speaker (the organizer sends it manually).
// Links to the site so they can find the recap/photos and share it.
export const speakerThankYou = (event, name, talkTitle) => {
  const subject = `Thank you for speaking at Cloud Native Latvia Meetup #${meetupNumber(event)}`;
  const body = [
    `Hi ${name.split(/\s+/)[0]},`,
    '',
    `Thank you for your talk${talkTitle ? ` “${talkTitle}”` : ''} at Cloud Native Latvia Meetup #${meetupNumber(event)} on ${dateLong(event.date)} — the community really appreciated it.`,
    '',
    'Recap, slides and photos from our meetups are on the site: https://cloudnative.lv',
    '',
    'Hope to have you back — and feel free to share it with your network.',
    '',
    'Thanks again,',
    'Cloud Native Latvia',
  ].join('\n');
  return { subject, body };
};

// Long-form Eventbrite listing description (the organizer pastes it into the
// Eventbrite event body). Fuller than the social post: the whole agenda with a
// one-line abstract per talk.
export const eventbriteDescription = (event) => {
  const lines = [
    `Cloud Native Latvia Meetup #${meetupNumber(event)} - ${cleanTitle(event.title)}`,
    '',
    `${dateLong(event.date)}${startTime(event) ? ` · ${startTime(event)}` : ''}`,
    venueLine(event.venue),
    '',
    'Join the Cloud Native Latvia community for an evening of talks on Kubernetes, cloud native tooling and the CNCF ecosystem. Free to attend - everyone welcome.',
    '',
    'Agenda:',
  ];
  (event.talks || []).forEach((t) => {
    const who = talkSpeakerNames(t).join(' & ');
    lines.push(`• ${t.title}${who ? ` - ${who}` : ''}`);
    if (t.description) lines.push(`  ${firstSentence(t.description)}`);
  });
  lines.push('');
  const reg = registerLine(event);
  if (reg) lines.push(reg, '');
  lines.push('Organized by Cloud Native Latvia · https://cloudnative.lv');
  return lines.join('\n');
};

// All copy for an event: the announcement + one intro per talk that has speakers.
export const eventSocial = (event) => ({
  announcement: announcementPost(event),
  eventbrite: eventbriteDescription(event),
  speakerIntros: (event.talks || [])
    .map((talk, i) => ({ talk, i }))
    .filter(({ talk }) => talkSpeakerNames(talk).length > 0)
    .map(({ talk, i }) => ({
      filename: `speaker-intro-${i + 1}-${speakerSlug(talkSpeakerNames(talk)[0])}.md`,
      text: speakerIntroPost(event, talk),
    })),
  speakerThankYous: [...new Set((event.talks || []).flatMap(talkSpeakerNames))].map((name) => {
    const talk = (event.talks || []).find((t) => talkSpeakerNames(t).includes(name));
    const { subject, body } = speakerThankYou(event, name, talk ? talk.title : '');
    return { name, filename: `thank-you-${speakerSlug(name)}.md`, subject, text: `Subject: ${subject}\n\n${body}` };
  }),
});
