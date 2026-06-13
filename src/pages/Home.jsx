import { Link } from 'react-router-dom';
import { getUpcomingEvents, getPastEvents } from '../data/events';
import EventCard from '../components/EventCard';
import AnimatedBackground from '../components/AnimatedBackground';
import SEO from '../components/SEO';
import { WebPageJsonLd } from '../components/JsonLd';
import { useLanguage } from '../i18n/useLanguage';
import { allPartners } from '../data/partners';

export default function Home() {
  const { t } = useLanguage();
  const upcomingEvents = getUpcomingEvents();
  const pastEvents = getPastEvents();
  const featuredEvents = [...upcomingEvents, ...pastEvents].slice(0, 3);

  return (
    <div className="min-h-screen">
      <SEO 
        title="Kubernetes, DevOps & Platform Engineering Meetups in Riga"
        description="Join Cloud Native Latvia for free meetups in Riga exploring Kubernetes, Docker, observability, GitOps, and cloud native technologies. Connect with DevOps engineers and developers in Latvia."
        keywords={['Kubernetes meetup Riga', 'DevOps Latvia', 'CNCF Latvia', 'tech meetups Riga', 'platform engineering']}
        path="/"
        image="/images/og/home.png"
      />
      <WebPageJsonLd 
        title="Cloud Native Latvia - Kubernetes & DevOps Meetups in Riga"
        description="The Kubernetes and DevOps community in Latvia. Free meetups exploring cloud native technologies, observability, and platform engineering."
        path="/"
      />
      
      {/* Hero Section */}
      <section id="hero" className="relative bg-pink-light overflow-hidden">
        <AnimatedBackground />
{/* Background image - add /images/riga-skyline.png for Riga skyline effect */}
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="mb-6">
            <img
              src="/images/wordmark.svg"
              alt=""
              className="mx-auto w-full max-w-xl"
            />
            <span className="sr-only">Cloud Native Latvia</span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold mb-4 uppercase tracking-wide">
            <span className="text-pink">{t('home.motto1')}</span>
            <br />
            <span className="text-burgundy">{t('home.motto2')}</span>
          </p>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t('home.heroDescription') }} />
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/events"
              className="bg-pink text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-500 transition-all shadow-lg hover:shadow-xl"
            >
              {t('home.viewEvents')}
            </Link>
            <a
              href="https://ocgroups.dev/cncf/group/xggmcq8"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-burgundy text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-800 transition-all shadow-lg hover:shadow-xl"
            >
              {t('home.joinCommunity')}
            </a>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-burgundy">{t('home.recentEvents')}</h2>
            <Link to="/events" className="text-pink hover:text-burgundy font-semibold transition-colors">
              {t('home.viewAll')}
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-pink-light">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-burgundy mb-6">{t('home.about.title')}</h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.about.p1') }} />
          <p className="text-lg text-gray-600 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.about.p2') }} />
          <p className="text-lg text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.about.p3') }} />
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-burgundy mb-2">{t('home.partners.title')}</h2>
          <p className="text-gray-600 mb-10">{t('home.partners.subtitle')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-8">
            {allPartners.map((p) => {
              const img = <img src={p.logo} alt={p.name} className="max-h-9 max-w-[130px] object-contain" />;
              return p.url ? (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" title={p.name} className="opacity-90 transition hover:opacity-100 hover:-translate-y-0.5">{img}</a>
              ) : (
                <span key={p.name} title={p.name}>{img}</span>
              );
            })}
          </div>
          <Link to="/sponsors" className="mt-8 inline-block font-semibold text-pink transition-colors hover:text-burgundy">{t('home.partners.cta')}</Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-rose-400 to-rose-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">{t('home.cta.title')}</h2>
          <p className="text-xl text-white/90 mb-8">
            {t('home.cta.description')}
          </p>
          <a
            href="mailto:hello@cloudnative.lv"
            className="inline-block bg-white text-burgundy px-8 py-3 rounded-full font-semibold hover:bg-rose-50 transition-all shadow-lg hover:shadow-xl"
          >
            {t('home.cta.contact')}
          </a>
        </div>
      </section>
    </div>
  );
}
