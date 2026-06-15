import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import { WebPageJsonLd } from '../components/JsonLd';
import { useLanguage } from '../i18n/useLanguage';

// Logo variants. `dark` tiles preview on the deep rose background.
const LOGOS = [
  { name: 'Primary lockup', file: '/images/logo-horizontal.svg', dark: false },
  { name: 'Stacked lockup', file: '/images/logo-stacked.svg', dark: false },
  { name: 'Mark', file: '/images/logo.svg', dark: false },
  { name: 'Light (on dark)', file: '/images/logo_light.svg', dark: true },
  { name: 'Mono black', file: '/images/brand/logo-horizontal-mono-black.svg', dark: false },
  { name: 'Mono white (on dark)', file: '/images/brand/logo-horizontal-mono-white.svg', dark: true },
];

const COLORS = [
  { name: 'Burgundy', hex: '#8b1538' },
  { name: 'Pink', hex: '#d4567c' },
  { name: 'Pink Light', hex: '#fdf2f4', border: true },
  { name: 'Ink', hex: '#1a1a1a' },
];

export default function Brand() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-pink-light">
      <SEO
        title={t('brand.title')}
        description={t('brand.subtitle')}
        keywords={['Cloud Native Latvia brand', 'logo', 'brand assets', 'press kit']}
        path="/brand"
        image="/images/og/default.png"
      />
      <WebPageJsonLd title={`${t('brand.title')} - Cloud Native Latvia`} description={t('brand.subtitle')} path="/brand" />
      <PageHeader title={t('brand.title')} subtitle={t('brand.subtitle')} />

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Logos */}
        <section>
          <h2 className="text-2xl font-black text-burgundy mb-2">{t('brand.logos')}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl">{t('brand.logosNote')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOGOS.map((l) => (
              <div key={l.name} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
                <div className={`flex items-center justify-center p-8 h-44 ${l.dark ? 'bg-rose-900' : 'bg-pink-light'}`}>
                  <img src={l.file} alt={l.name} className="max-h-24 max-w-[80%] w-auto" />
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-rose-100">
                  <span className="text-sm font-semibold text-burgundy">{l.name}</span>
                  <a href={l.file} download className="text-sm font-semibold text-pink hover:text-burgundy transition-colors">
                    {t('brand.download')} ↓
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Colors */}
        <section>
          <h2 className="text-2xl font-black text-burgundy mb-6">{t('brand.colors')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {COLORS.map((c) => (
              <div key={c.hex} className="bg-white rounded-xl shadow overflow-hidden">
                <div className={`h-24 ${c.border ? 'border-b border-rose-100' : ''}`} style={{ backgroundColor: c.hex }} />
                <div className="p-3">
                  <p className="text-sm font-semibold text-burgundy">{c.name}</p>
                  <p className="text-xs text-gray-500 uppercase">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Illustrations */}
        <section>
          <h2 className="text-2xl font-black text-burgundy mb-2">{t('brand.illustrations')}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl">{t('brand.skylineNote')}</p>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-pink-light p-6 flex items-center justify-center">
              <img src="/images/brand/skyline.svg" alt="Riga skyline" className="max-h-56 w-auto opacity-90" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-rose-100">
              <span className="text-sm font-semibold text-burgundy">Riga skyline</span>
              <a href="/images/brand/skyline.svg" download className="text-sm font-semibold text-pink hover:text-burgundy transition-colors">
                {t('brand.download')} ↓
              </a>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-black text-burgundy mb-2">{t('brand.typography')}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl">{t('brand.typographyNote')}</p>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-burgundy font-black text-4xl">Noto Sans</p>
            <p className="text-gray-700 text-2xl mt-3">ABCDEFGHIJKLM abcdefghijklm 0123456789</p>
            <p className="text-gray-500 mt-2">Āā Čč Ēē Ģģ Īī Ķķ Ļļ Ņņ Šš Ūū Žž</p>
          </div>
        </section>

        {/* Usage */}
        <section>
          <h2 className="text-2xl font-black text-burgundy mb-6">{t('brand.usage')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-emerald-700 mb-3">✓ {t('brand.do')}</h3>
              <ul className="space-y-2 text-gray-600 text-sm list-disc pl-5">
                <li>{t('brand.do1')}</li>
                <li>{t('brand.do2')}</li>
                <li>{t('brand.do3')}</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-burgundy mb-3">✗ {t('brand.dont')}</h3>
              <ul className="space-y-2 text-gray-600 text-sm list-disc pl-5">
                <li>{t('brand.dont1')}</li>
                <li>{t('brand.dont2')}</li>
                <li>{t('brand.dont3')}</li>
              </ul>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-6">{t('brand.kitNote')}</p>
        </section>
      </div>
    </div>
  );
}
