const siteConfig = {
  siteName: 'Cloud Native Latvia',
  siteUrl: 'https://cloudnative.lv',
  logo: 'https://cloudnative.lv/images/logo.svg',
  description: 'A community of cloud native enthusiasts in Latvia exploring Kubernetes, DevOps, and platform engineering through bi-monthly meetups in Riga.',
  email: 'hello@cloudnative.lv',
  socialLinks: [
    'https://www.linkedin.com/company/cloud-native-latvia',
    'https://community.cncf.io/cloud-native-latvia/',
    'https://bsky.app/profile/cloudnative.lv',
    'https://www.eventbrite.com/o/cloud-native-latvia-95498498498',
    'https://github.com/cloud-native-latvia'
  ]
};

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebPageJsonLd({ title, description, path }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: `${siteConfig.siteUrl}${path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.siteName,
      url: siteConfig.siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.siteName,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.logo
      }
    }
  };
  return <JsonLd data={data} />;
}

export function EventJsonLd({ event }) {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.date,
    endDate: event.date,
    eventStatus: isUpcoming ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventMovedOnline',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue || 'Riga, Latvia',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Riga',
        addressCountry: 'LV'
      }
    },
    organizer: {
      '@type': 'Organization',
      name: siteConfig.siteName,
      url: siteConfig.siteUrl
    },
    performer: event.talks?.map(talk => ({
      '@type': 'Person',
      name: talk.speaker
    })) || [],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: isUpcoming ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: event.eventbrite || event.cncf || `${siteConfig.siteUrl}/events/${event.slug}`
    },
    image: `${siteConfig.siteUrl}/images/og/events.png`
  };
  return <JsonLd data={data} />;
}

export function EventsListJsonLd({ events }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Cloud Native Latvia Events',
    description: 'Upcoming and past cloud native meetup events in Riga, Latvia',
    url: `${siteConfig.siteUrl}/events`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: events.slice(0, 10).map((event, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Event',
          name: event.title,
          startDate: event.date,
          url: `${siteConfig.siteUrl}/events/${event.slug}`,
          location: {
            '@type': 'Place',
            name: event.venue || 'Riga, Latvia'
          }
        }
      }))
    }
  };
  return <JsonLd data={data} />;
}

export function PersonJsonLd({ person, role }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: role || person.role,
    description: person.bio,
    image: person.image ? `${siteConfig.siteUrl}${person.image}` : undefined,
    worksFor: {
      '@type': 'Organization',
      name: siteConfig.siteName
    },
    sameAs: [
      person.social?.linkedin,
      person.social?.twitter
    ].filter(Boolean)
  };
  return <JsonLd data={data} />;
}

export function TeamPageJsonLd({ members }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Cloud Native Latvia Team',
    description: 'Meet the organizers behind Cloud Native Latvia meetups in Riga',
    url: `${siteConfig.siteUrl}/team`,
    mainEntity: {
      '@type': 'Organization',
      name: siteConfig.siteName,
      url: siteConfig.siteUrl,
      member: members.map(member => ({
        '@type': 'Person',
        name: member.name,
        jobTitle: member.role,
        description: member.bio,
        sameAs: [member.social?.linkedin, member.social?.twitter].filter(Boolean)
      }))
    }
  };
  return <JsonLd data={data} />;
}

export function SpeakersPageJsonLd({ speakers }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Cloud Native Latvia Speakers',
    description: 'Speakers who have presented at Cloud Native Latvia meetups',
    url: `${siteConfig.siteUrl}/speakers`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: speakers.map((speaker, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Person',
          name: speaker.name,
          description: `Speaker at Cloud Native Latvia with ${speaker.talks.length} talk(s)`
        }
      }))
    }
  };
  return <JsonLd data={data} />;
}

export function SponsorsPageJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Sponsor Cloud Native Latvia',
    description: 'Sponsorship opportunities for Cloud Native Latvia meetups in Riga',
    url: `${siteConfig.siteUrl}/sponsors`,
    mainEntity: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Event Sponsorship',
        description: 'Sponsor Cloud Native Latvia meetups and connect with tech professionals in Latvia',
        provider: {
          '@type': 'Organization',
          name: siteConfig.siteName
        }
      }
    }
  };
  return <JsonLd data={data} />;
}

export function ProductListJsonLd({ products, pageName }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageName,
    description: 'Cloud Native Latvia merchandise and stickers',
    url: `${siteConfig.siteUrl}/swag`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image ? `${siteConfig.siteUrl}${product.image}` : undefined,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock'
          }
        }
      }))
    }
  };
  return <JsonLd data={data} />;
}

export function BreadcrumbJsonLd({ items }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.siteUrl}${item.path}`
    }))
  };
  return <JsonLd data={data} />;
}
