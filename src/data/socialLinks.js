import {
  CncfIcon, LinkedInIcon, BlueskyIcon, YouTubeIcon, EventbriteIcon, GitHubIcon, EmailIcon, RssIcon,
} from '../components/SocialIcons';

// Canonical social links — single source for the Footer and the subscribe modal.
export const SOCIAL_LINKS = [
  { key: 'cncf', href: 'https://community.cncf.io/cloud-native-latvia/', title: 'CNCF Community', Icon: CncfIcon },
  { key: 'linkedin', href: 'https://www.linkedin.com/company/cloud-native-latvia', title: 'LinkedIn', Icon: LinkedInIcon },
  { key: 'bluesky', href: 'https://bsky.app/profile/cloudnativelatvia.bsky.social', title: 'Bluesky', Icon: BlueskyIcon },
  { key: 'youtube', href: 'https://www.youtube.com/@CloudNativeLatvia', title: 'YouTube', Icon: YouTubeIcon },
  { key: 'eventbrite', href: 'https://www.eventbrite.com/o/cloud-native-latvia-114451584951', title: 'Eventbrite', Icon: EventbriteIcon },
  { key: 'github', href: 'https://github.com/cloudnative-lv', title: 'GitHub', Icon: GitHubIcon },
  { key: 'email', href: 'mailto:hello@cloudnative.lv?subject=Hello from cloudnative.lv', title: 'Email', Icon: EmailIcon },
  { key: 'rss', href: '/feed.xml', title: 'RSS Feed', Icon: RssIcon },
];

// The social platforms shown on the deck's "How to connect?" slide — each as a
// platform icon + label + scannable QR code. Mirrors the original opening deck
// (LinkedIn · BlueSky · Eventbrite) plus the CNCF/OCG community hub where people
// RSVP. YouTube can be appended here too if we ever want it on the slide.
export const CONNECT_KEYS = ['cncf', 'linkedin', 'bluesky', 'eventbrite'];

// The connect-slide socials, in CONNECT_KEYS order.
export const connectSocials = () =>
  CONNECT_KEYS.map((k) => SOCIAL_LINKS.find((s) => s.key === k)).filter(Boolean);
