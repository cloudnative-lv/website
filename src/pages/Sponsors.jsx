import SEO from '../components/SEO';
import { SponsorsPageJsonLd } from '../components/JsonLd';
import PageHeader from '../components/PageHeader';
import FeatureCard from '../components/FeatureCard';
import CTASection from '../components/CTASection';
import Button from '../components/Button';
import { Container, Section, SectionHeading } from '../components/layout';
import { useLanguage } from '../i18n/LanguageContext';

const benefitIcons = [
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" key="talent">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>,
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" key="visibility">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>,
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" key="engagement">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>,
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" key="opensource">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
];

const tierConfigs = [
  {
    nameKey: 'gold',
    price: '€1,500',
    periodKey: 'perYear',
    color: 'from-yellow-400 to-yellow-600',
    benefitKeys: ['logoHomepage', 'logoAllMaterials', 'introEachMeetup', 'socialShoutouts', 'boothTable', 'jobNewsletter']
  },
  {
    nameKey: 'silver',
    price: '€800',
    periodKey: 'perYear',
    color: 'from-gray-300 to-gray-500',
    benefitKeys: ['logoSponsorsPage', 'logoMaterials', 'socialMentions', 'jobQuarterly']
  },
  {
    nameKey: 'bronze',
    price: '€400',
    periodKey: 'perYear',
    color: 'from-orange-400 to-orange-600',
    benefitKeys: ['logoSponsorsPage', 'mentionEvents']
  },
  {
    nameKey: 'event',
    price: '€300',
    periodKey: 'perEvent',
    color: 'from-rose-400 to-rose-700',
    benefitKeys: ['logoSpecificEvent', 'introEvent', 'socialPromotion', 'swagDistribution']
  }
];

export default function Sponsors() {
  const { t } = useLanguage();

  const benefitKeys = ['talent', 'visibility', 'engagement', 'openSource'];

  return (
    <div className="min-h-screen bg-pink-light">
      <SEO 
        title="Sponsor Cloud Native Latvia - Tech Community Sponsorship"
        description="Sponsor Cloud Native Latvia meetups and connect with Kubernetes, DevOps, and platform engineering professionals in Riga. Reach tech talent in the Baltic region."
        keywords={['sponsor tech event Latvia', 'IT sponsorship Riga', 'DevOps community sponsor', 'Baltic tech recruitment']}
        path="/sponsors"
        image="/images/og/sponsors.png"
      />
      <SponsorsPageJsonLd />
      <PageHeader 
        title={t('sponsors.title')}
        subtitle={t('sponsors.subtitle')}
      />

      <Container className="py-12">
        <Section>
          <SectionHeading className="text-center">{t('sponsors.whySponsor')}</SectionHeading>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefitKeys.map((key, idx) => (
              <FeatureCard 
                key={key} 
                icon={benefitIcons[idx]} 
                title={t(`sponsors.benefits.${key}.title`)} 
                description={t(`sponsors.benefits.${key}.description`)} 
              />
            ))}
          </div>
        </Section>

        <Section>
          <SectionHeading className="text-center">{t('sponsors.tiers')}</SectionHeading>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tierConfigs.map((tier, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`bg-linear-to-r ${tier.color} text-white p-6 text-center`}>
                  <h3 className="text-2xl font-black">{t(`sponsors.tierNames.${tier.nameKey}`)}</h3>
                  <p className="text-3xl font-bold mt-2">{tier.price}</p>
                  <p className="text-sm opacity-90">{t(`sponsors.${tier.periodKey}`)}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {tier.benefitKeys.map((benefitKey) => (
                      <li key={benefitKey} className="flex items-start gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{t(`sponsors.tierBenefits.${benefitKey}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <CTASection
            title={t('sponsors.custom.title')}
            description={t('sponsors.custom.description')}
          >
            <Button href="mailto:sponsors@cloudnative.lv">{t('sponsors.custom.contact')}</Button>
          </CTASection>
        </Section>

        <Section className="mb-0">
          <SectionHeading className="text-center">{t('sponsors.ourSponsors')}</SectionHeading>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-6">
              {t('sponsors.beFirst')}
            </p>
            <div className="flex justify-center gap-8 flex-wrap">
              <div className="w-40 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                {t('sponsors.yourLogo')}
              </div>
              <div className="w-40 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                {t('sponsors.yourLogo')}
              </div>
              <div className="w-40 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                {t('sponsors.yourLogo')}
              </div>
            </div>
          </div>
        </Section>
      </Container>
    </div>
  );
}
