import { Link } from 'react-router-dom';
import { upcomingEvents, pastEvents } from '../data/events';
import EventCard from '../components/EventCard';
import AnimatedBackground from '../components/AnimatedBackground';
import SEO from '../components/SEO';
import { WebPageJsonLd } from '../components/JsonLd';
import { useLanguage } from '../i18n/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const featuredEvents = [...upcomingEvents, ...pastEvents].slice(0, 3);

  return (
    <div className="min-h-screen">
      <SEO 
        title="Kubernetes, DevOps & Platform Engineering Meetups in Riga"
        description="Join Cloud Native Latvia for free bi-monthly meetups in Riga exploring Kubernetes, Docker, observability, GitOps, and cloud native technologies. Connect with DevOps engineers and developers in Latvia."
        keywords={['Kubernetes meetup Riga', 'DevOps Latvia', 'CNCF Latvia', 'tech meetups Riga', 'platform engineering']}
        path="/"
        image="/images/og/home.png"
      />
      <WebPageJsonLd 
        title="Cloud Native Latvia - Kubernetes & DevOps Meetups in Riga"
        description="The premier Kubernetes and DevOps community in Latvia. Free bi-monthly meetups exploring cloud native technologies, observability, and platform engineering."
        path="/"
      />
      
      {/* Hero Section */}
      <section className="relative bg-pink-light overflow-hidden">
        <AnimatedBackground />
{/* Background image - add /images/riga-skyline.png for Riga skyline effect */}
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <img src="/images/logo.svg" alt="Cloud Native Latvia - Kubernetes and DevOps Community in Riga" className="h-32 w-auto mx-auto mb-6" />
          <h1 className="font-black mb-4 uppercase tracking-tight">
            <span className="block text-4xl md:text-5xl text-pink">Cloud Native</span>
            <span className="block text-5xl md:text-7xl text-burgundy">Latvia</span>
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
              href="https://community.cncf.io/cloud-native-latvia/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-burgundy text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-800 transition-all shadow-lg hover:shadow-xl"
            >
              {t('home.joinCommunity')}
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-rose-50 hover:shadow-lg transition-shadow">
              <p className="text-5xl font-black text-burgundy">{pastEvents.length}</p>
              <p className="text-gray-600 font-medium mt-2">{t('home.stats.eventsHeld')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-rose-50 hover:shadow-lg transition-shadow">
              <p className="text-5xl font-black text-burgundy">{upcomingEvents.length}</p>
              <p className="text-gray-600 font-medium mt-2">{t('home.stats.upcoming')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-rose-50 hover:shadow-lg transition-shadow">
              <p className="text-5xl font-black text-burgundy">6</p>
              <p className="text-gray-600 font-medium mt-2">{t('home.stats.plannedFor2026')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-rose-50 hover:shadow-lg transition-shadow">
              <p className="text-3xl font-black text-burgundy">{t('home.stats.bimonthly')}</p>
              <p className="text-gray-600 font-medium mt-2">{t('home.stats.meetupFrequency')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-pink-light">
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
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-burgundy mb-6">{t('home.about.title')}</h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.about.p1') }} />
          <p className="text-lg text-gray-600 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.about.p2') }} />
          <p className="text-lg text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.about.p3') }} />
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
