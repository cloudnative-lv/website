import {
  CncfIcon, LinkedInIcon, BlueskyIcon, YouTubeIcon, EventbriteIcon, GitHubIcon, EmailIcon, RssIcon,
} from '../components/SocialIcons';

// Canonical social links — single source for the Footer and the subscribe modal.
export const SOCIAL_LINKS = [
  { key: 'cncf', href: 'https://community.cncf.io/cloud-native-latvia/', title: 'CNCF Community', Icon: CncfIcon },
  { key: 'linkedin', href: 'https://www.linkedin.com/company/cloud-native-latvia', title: 'LinkedIn', Icon: LinkedInIcon },
  { key: 'bluesky', href: 'https://bsky.app/profile/cloudnative.lv', title: 'Bluesky', Icon: BlueskyIcon },
  { key: 'youtube', href: 'https://www.youtube.com/@CloudNativeLatvia', title: 'YouTube', Icon: YouTubeIcon },
  { key: 'eventbrite', href: 'https://www.eventbrite.com/o/cloud-native-latvia-95498498498', title: 'Eventbrite', Icon: EventbriteIcon },
  { key: 'github', href: 'https://github.com/cloud-native-latvia', title: 'GitHub', Icon: GitHubIcon },
  { key: 'email', href: 'mailto:hello@cloudnative.lv', title: 'Email', Icon: EmailIcon },
  { key: 'rss', href: '/feed.xml', title: 'RSS Feed', Icon: RssIcon },
];
