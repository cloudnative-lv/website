import { useEffect } from 'react';
import { useLanguage } from '../i18n/useLanguage';

const siteConfig = {
  siteName: 'Cloud Native Latvia',
  siteUrl: 'https://cloudnative.lv',
  defaultImage: '/images/og/default.png',
  defaultDescription: {
    en: 'Join Cloud Native Latvia for meetups in Riga exploring Kubernetes, DevOps, observability, platform engineering, and cloud native technologies.',
    lv: 'Pievienojies Cloud Native Latvia tikšanās reizēm Rīgā par Kubernetes, DevOps, novērojamību, platformu inženieriju un mākoņdatošanas tehnoloģijām.'
  }
};

const DEFAULT_KEYWORDS = [
  'Cloud Native', 'Kubernetes', 'K8s', 'DevOps', 'Platform Engineering',
  'Riga', 'Latvia', 'Meetup', 'CNCF', 'Docker', 'Containers',
  'Observability', 'Prometheus', 'Grafana', 'GitOps', 'ArgoCD'
];

export default function SEO({ 
  title, 
  description, 
  keywords = [],
  path = '',
  image = null,
  noindex = false,
  type = 'website',
  publishedTime = null,
  imageWidth = 1200,
  imageHeight = 630
}) {
  const { language } = useLanguage();

  const fullTitle = title
    ? `${title} | ${siteConfig.siteName}` 
    : `${siteConfig.siteName} - Kubernetes & DevOps Meetups in Riga`;
  const fullDescription = description || siteConfig.defaultDescription[language] || siteConfig.defaultDescription.en;
  const canonicalUrl = `${siteConfig.siteUrl}${path}`;
  const ogImage = image
    ? `${siteConfig.siteUrl}${image}`
    : `${siteConfig.siteUrl}${siteConfig.defaultImage}`;
  // Joined to a string so the effect dependency compares by value — callers
  // pass inline array literals whose identity changes every render.
  const allKeywords = [...new Set([...keywords, ...DEFAULT_KEYWORDS])].join(', ');

  useEffect(() => {
    document.title = fullTitle;

    const updateMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateMeta('description', fullDescription);
    updateMeta('keywords', allKeywords);
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', fullDescription, true);
    updateMeta('og:url', canonicalUrl, true);
    updateMeta('og:type', type, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:image:width', String(imageWidth), true);
    updateMeta('og:image:height', String(imageHeight), true);
    updateMeta('article:published_time', publishedTime || '', true);
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', fullDescription);
    updateMeta('twitter:image', ogImage);
    updateMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl);
    }
    
    document.documentElement.lang = language;
  }, [fullTitle, fullDescription, allKeywords, canonicalUrl, ogImage, language, noindex, type, publishedTime, imageWidth, imageHeight]);

  return null;
}
