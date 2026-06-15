import SpeakerBanner from './templates/SpeakerBanner';
import EventTitleBanner from './templates/EventTitleBanner';
import LinkedInPostImage from './templates/LinkedInPostImage';
import BevyBanner from './templates/BevyBanner';
import OcgBanner from './templates/OcgBanner';
import DeckBackground from './templates/DeckBackground';
import PlatformBanner from './templates/PlatformBanner';
import LogoArtifact from './templates/LogoArtifact';
import { talkSpeakerNames } from './fields';
import { getEvents } from '../data/events';

// The artifact matrix.
// - artifactsFor(event)  -> the event's artifacts (drives generator + kit page)
// - resolveVariant(...)  -> component + props for the /kit/:slug/raw/:variant route
// - allArtifacts()       -> flat list across every event (the manifest)

const EVENT_LEVEL = [
  { variant: 'linkedin-event', width: 1600, height: 900, filename: 'linkedin-event.png', label: 'LinkedIn event banner' },
  { variant: 'linkedin-event-speakers', width: 1600, height: 900, filename: 'linkedin-event-speakers.png', label: 'LinkedIn event banner (speakers)' },
  { variant: 'eventbrite', width: 2160, height: 1080, filename: 'eventbrite.png', label: 'Eventbrite banner' },
  { variant: 'eventbrite-speakers', width: 2160, height: 1080, filename: 'eventbrite-speakers.png', label: 'Eventbrite banner (speakers)' },
  { variant: 'linkedin-post', width: 1280, height: 720, filename: 'linkedin-post.png', label: 'LinkedIn post (date / venue)' },
  { variant: 'og', width: 1200, height: 630, filename: 'og.png', label: 'OG share image' },
  { variant: 'bevy', width: 2560, height: 650, filename: 'bevy.png', label: 'Bevy banner (legacy)' },
];

export function artifactsFor(event) {
  const list = EVENT_LEVEL.map((a) => ({ ...a }));
  (event.talks || []).forEach((talk, i) => {
    if (talkSpeakerNames(talk).length === 0) return;
    list.push({
      variant: `speaker-${i}`,
      width: 1280,
      height: 720,
      filename: `speaker-${i + 1}.png`,
      label: `Speaker banner — ${talk.title}`,
    });
  });
  return list;
}

export function resolveVariant(event, variant) {
  const fixed = {
    'linkedin-event': { Component: EventTitleBanner, props: { width: 1600, height: 900, event } },
    'linkedin-event-speakers': { Component: EventTitleBanner, props: { width: 1600, height: 900, event, withSpeakers: true } },
    eventbrite: { Component: EventTitleBanner, props: { width: 2160, height: 1080, event } },
    'eventbrite-speakers': { Component: EventTitleBanner, props: { width: 2160, height: 1080, event, withSpeakers: true } },
    'linkedin-post': { Component: LinkedInPostImage, props: { event } },
    og: { Component: EventTitleBanner, props: { width: 1200, height: 630, event } },
    bevy: { Component: BevyBanner, props: { event } },
  };
  if (fixed[variant]) return fixed[variant];

  const sp = variant.match(/^speaker-(\d+)$/);
  if (sp) {
    const talk = event.talks?.[Number(sp[1])];
    if (!talk || talkSpeakerNames(talk).length === 0) return null;
    return { Component: SpeakerBanner, props: { event, talk } };
  }
  return null;
}

// Brand assets are not per-event — they are set once for the whole platform.
// Two kinds: OCG banner strips (set-once decorative cover, WebP ≤1 MiB, inherited by
// every event) and the community's own channel covers at each platform's standard size
// (logo avatar, LinkedIn company page, Bluesky, Eventbrite organizer cover).
const PLATFORM_COVERS = new Set(['linkedin-company-banner', 'bluesky-banner', 'eventbrite-cover']);
const BRAND = [
  { variant: 'logo', width: 1024, height: 1024, filename: 'logo.png', label: 'Logo — square (avatar)' },
  { variant: 'linkedin-company-banner', width: 1128, height: 191, filename: 'linkedin-company-banner.png', label: 'LinkedIn company banner' },
  { variant: 'bluesky-banner', width: 1500, height: 500, filename: 'bluesky-banner.png', label: 'Bluesky banner' },
  { variant: 'eventbrite-cover', width: 2160, height: 1080, filename: 'eventbrite-cover.png', label: 'Eventbrite organizer cover' },
  { variant: 'ocg-banner-desktop', width: 2428, height: 192, filename: 'ocg-banner-desktop.webp', format: 'webp', label: 'OCG banner — desktop' },
  { variant: 'ocg-banner-mobile', width: 1220, height: 192, filename: 'ocg-banner-mobile.webp', format: 'webp', label: 'OCG banner — mobile' },
  { variant: 'deck-bg', width: 1920, height: 1080, filename: 'deck-bg.png', label: 'Deck slide background' },
];

export function brandArtifacts() {
  return BRAND.map((a) => ({ slug: 'brand', eventId: 'brand', ...a }));
}

export function resolveBrand(variant) {
  const b = BRAND.find((a) => a.variant === variant);
  if (!b) return null;
  if (variant === 'deck-bg') return { Component: DeckBackground, props: { width: b.width, height: b.height } };
  if (variant === 'logo') return { Component: LogoArtifact, props: { width: b.width, height: b.height } };
  if (PLATFORM_COVERS.has(variant)) return { Component: PlatformBanner, props: { width: b.width, height: b.height } };
  return { Component: OcgBanner, props: { width: b.width, height: b.height } };
}

export function allArtifacts() {
  const perEvent = getEvents().flatMap((event) =>
    artifactsFor(event).map((a) => ({ slug: event.slug, eventId: event.id, ...a }))
  );
  return [...perEvent, ...brandArtifacts()];
}
