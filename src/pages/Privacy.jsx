import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import { useLanguage } from '../i18n/useLanguage';

const SECTIONS = ['collect', 'basis', 'storage', 'retention', 'sharing', 'rights'];

export default function Privacy() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-pink-light">
      <SEO
        title="Privacy Policy"
        description="How Cloud Native Latvia collects and handles your data."
        path="/privacy"
      />
      <PageHeader title={t('privacy.title')} subtitle={t('privacy.updated')} />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <p className="text-gray-600">{t('privacy.intro')}</p>
          {SECTIONS.map((key) => (
            <div key={key}>
              <h2 className="text-xl font-bold text-burgundy mb-2">{t(`privacy.${key}.title`)}</h2>
              <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: t(`privacy.${key}.body`) }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
