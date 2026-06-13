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

// All copy for an event: the announcement + one intro per talk that has speakers.
export const eventSocial = (event) => ({
  announcement: announcementPost(event),
  speakerIntros: (event.talks || [])
    .map((talk, i) => ({ talk, i }))
    .filter(({ talk }) => talkSpeakerNames(talk).length > 0)
    .map(({ talk, i }) => ({
      filename: `speaker-intro-${i + 1}-${speakerSlug(talkSpeakerNames(talk)[0])}.md`,
      text: speakerIntroPost(event, talk),
    })),
});
