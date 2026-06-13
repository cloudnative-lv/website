import {
  GlobeIcon, LinkedInIcon, BlueskyIcon, EventbriteIcon, GitHubIcon, EmailIcon,
} from '../components/SocialIcons';

// Canonical social links — single source for the Footer and the subscribe modal.
export const SOCIAL_LINKS = [
  { key: 'cncf', href: 'https://ocgroups.dev/cncf/group/xggmcq8', title: 'CNCF Community', Icon: GlobeIcon },
  { key: 'linkedin', href: 'https://www.linkedin.com/company/cloud-native-latvia', title: 'LinkedIn', Icon: LinkedInIcon },
  { key: 'bluesky', href: 'https://bsky.app/profile/cloudnative.lv', title: 'Bluesky', Icon: BlueskyIcon },
  { key: 'eventbrite', href: 'https://www.eventbrite.com/o/cloud-native-latvia-95498498498', title: 'Eventbrite', Icon: EventbriteIcon },
  { key: 'github', href: 'https://github.com/cloud-native-latvia', title: 'GitHub', Icon: GitHubIcon },
  { key: 'email', href: 'mailto:hello@cloudnative.lv', title: 'Email', Icon: EmailIcon },
];
