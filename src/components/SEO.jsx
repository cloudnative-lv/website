import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const siteConfig = {
  siteName: 'Cloud Native Latvia',
  siteUrl: 'https://cloudnative.lv',
  defaultImage: '/images/og/default.png',
  defaultDescription: {
    en: 'Join Cloud Native Latvia for bi-monthly meetups in Riga exploring Kubernetes, DevOps, observability, platform engineering, and cloud native technologies.',
    lv: 'Pievienojies Cloud Native Latvia tikšanās reizēm Rīgā par Kubernetes, DevOps, novērojamību, platformu inženieriju un mākoņdatošanas tehnoloģijām.'
  }
};

export default function SEO({ 
  title, 
  description, 
  keywords = [],
  path = '',
  image = null
}) {
  const { language } = useLanguage();
  
  const defaultKeywords = [
    'Cloud Native', 'Kubernetes', 'K8s', 'DevOps', 'Platform Engineering',
    'Riga', 'Latvia', 'Meetup', 'CNCF', 'Docker', 'Containers',
    'Observability', 'Prometheus', 'Grafana', 'GitOps', 'ArgoCD'
  ];
  
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];
  const fullTitle = title 
    ? `${title} | ${siteConfig.siteName}` 
    : `${siteConfig.siteName} - Kubernetes & DevOps Meetups in Riga`;
  const fullDescription = description || siteConfig.defaultDescription[language] || siteConfig.defaultDescription.en;
  const canonicalUrl = `${siteConfig.siteUrl}${path}`;
  const ogImage = image 
    ? `${siteConfig.siteUrl}${image}` 
    : `${siteConfig.siteUrl}${siteConfig.defaultImage}`;

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
    updateMeta('keywords', allKeywords.join(', '));
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', fullDescription, true);
    updateMeta('og:url', canonicalUrl, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:image:width', '1200', true);
    updateMeta('og:image:height', '630', true);
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', fullDescription);
    updateMeta('twitter:image', ogImage);
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl);
    }
    
    document.documentElement.lang = language;
  }, [fullTitle, fullDescription, allKeywords, canonicalUrl, ogImage, language]);

  return null;
}
