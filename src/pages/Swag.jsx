import SEO from '../components/SEO';
import { ProductListJsonLd } from '../components/JsonLd';
import PageHeader from '../components/PageHeader';
import FeatureCard from '../components/FeatureCard';
import CTASection from '../components/CTASection';
import Button from '../components/Button';
import { Container, Section, SectionHeading } from '../components/layout';
import { useLanguage } from '../i18n/LanguageContext';

const stickerConfigs = [
  { id: 1, key: 'linda', image: '/images/stickers/sticker_linda.svg' },
  { id: 2, key: 'andrey', image: '/images/stickers/sticker_andrey.svg' },
  { id: 3, key: 'cloudTech', image: '/images/stickers/sticker_cloud_tech.svg' },
  { id: 4, key: 'cncfLandscape', image: '/images/stickers/sticker_cncf_landscape.svg' },
  { id: 5, key: 'navigatingClouds', image: '/images/stickers/sticker_navigating_clouds.svg' },
  { id: 6, key: 'logo', image: '/images/stickers/sticker_cn_lv.svg' }
];

const methodIcons = [
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" key="attend">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>,
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" key="speak">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>,
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" key="help">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
];

const methodKeys = ['attendMeetups', 'speakAtEvents', 'helpOrganize'];
const methodDescKeys = ['attendDescription', 'speakDescription', 'helpDescription'];

export default function Swag() {
  const { t } = useLanguage();

  const stickers = stickerConfigs.map(s => ({
    ...s,
    name: t(`swag.stickerNames.${s.key}`),
    description: t(`swag.stickerDescriptions.${s.key}`)
  }));

  return (
    <div className="min-h-screen bg-pink-light">
      <SEO 
        title="Swag & Stickers - Cloud Native Latvia Merchandise"
        description="Get Cloud Native Latvia stickers and swag at our meetups. Unique Kubernetes, DevOps, and CNCF-themed designs for the tech community in Riga."
        keywords={['tech stickers Latvia', 'Kubernetes swag', 'DevOps merchandise', 'CNCF stickers']}
        path="/swag"
        image="/images/og/swag.png"
      />
      <ProductListJsonLd products={stickers} pageName="Cloud Native Latvia Swag & Stickers" />
      <PageHeader 
        title={t('swag.title')}
        subtitle={t('swag.subtitle')}
      />

      <Container className="py-12">
        <Section>
          <SectionHeading>{t('swag.stickers')}</SectionHeading>
          <p className="text-gray-600 mb-8">
            {t('swag.stickersDescription')}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stickers.map(sticker => (
              <div key={sticker.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-rose-50 flex items-center justify-center">
                  {sticker.image ? (
                    <img src={sticker.image} alt={sticker.name} className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-pink">
                      <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-burgundy mb-2">{sticker.name}</h3>
                  <p className="text-gray-600">{sticker.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <SectionHeading>{t('swag.merchandise')}</SectionHeading>
          <p className="text-gray-600 mb-8">
            {t('swag.merchandiseDescription')}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-rose-50 flex items-center justify-center">
                <img src="/images/swag/cup.png" alt={t('swag.cupName')} className="w-full h-full object-contain p-4" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-burgundy mb-2">{t('swag.cupName')}</h3>
                <p className="text-gray-600">{t('swag.cupDescription')}</p>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <SectionHeading>{t('swag.howToGet')}</SectionHeading>
          <div className="grid md:grid-cols-3 gap-6">
            {methodKeys.map((key, idx) => (
              <FeatureCard key={key} icon={methodIcons[idx]} title={t(`swag.${key}`)} description={t(`swag.${methodDescKeys[idx]}`)} />
            ))}
          </div>
        </Section>

        <CTASection
          title={t('swag.cta.title')}
          description={t('swag.cta.description')}
        >
          <Button href="mailto:hello@cloudnative.lv">{t('swag.cta.contact')}</Button>
        </CTASection>
      </Container>
    </div>
  );
}
