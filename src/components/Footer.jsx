import { useLanguage } from '../i18n/useLanguage';
import { SocialLink } from './SocialIcons';
import { SOCIAL_LINKS } from '../data/socialLinks';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-rose-900 text-white py-12 print:hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/logo.svg" alt="Cloud Native Latvia" className="h-10 w-auto" />
              <div className="flex flex-col leading-tight uppercase text-center">
                <span className="text-white font-bold text-sm tracking-tight">Cloud Native</span>
                <span className="text-pink font-black text-lg tracking-wide">LATVIA</span>
              </div>
            </div>
            <p className="text-rose-200">
              {t('footer.description')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-rose-200">
              <li><a href="/events" className="hover:text-white transition-colors">{t('nav.events')}</a></li>
              <li><a href="/speakers" className="hover:text-white transition-colors">{t('nav.speakers')}</a></li>
              <li><a href="/team" className="hover:text-white transition-colors">{t('nav.team')}</a></li>
              <li><a href="/swag" className="hover:text-white transition-colors">{t('nav.swag')}</a></li>
              <li><a href="/sponsors" className="hover:text-white transition-colors">{t('nav.sponsors')}</a></li>
              <li><a href="/brand" className="hover:text-white transition-colors">{t('brand.title')}</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">{t('privacy.title')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.connect')}</h4>
            <div className="flex flex-wrap gap-4">
              {SOCIAL_LINKS.map((s) => (
                <SocialLink
                  key={s.key}
                  href={s.href}
                  title={s.title}
                  icon={<s.Icon className="w-6 h-6" />}
                  className="text-rose-200 hover:text-white transition-colors"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-rose-800 mt-8 pt-8 text-center text-rose-200">
          <p>&copy; {new Date().getFullYear()} Cloud Native Latvia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
