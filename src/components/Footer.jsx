import { useLanguage } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-rose-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/logo.png" alt="Cloud Native Latvia" className="h-10 w-auto" />
              <div>
                <span className="font-bold">Cloud Native</span>
                <span className="font-black block text-sm">LATVIA</span>
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
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.connect')}</h4>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://community.cncf.io/cloud-native-latvia/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-200 hover:text-white transition-colors"
                title="CNCF Community"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/cloud-native-latvia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-200 hover:text-white transition-colors"
                title="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://bsky.app/profile/cloudnative.lv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-200 hover:text-white transition-colors"
                title="Bluesky"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
                </svg>
              </a>
              <a
                href="https://www.eventbrite.com/o/cloud-native-latvia-95498498498"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-200 hover:text-white transition-colors"
                title="Eventbrite"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.75 0C5.262 0 0 5.262 0 11.75S5.262 23.5 11.75 23.5 23.5 18.238 23.5 11.75 18.238 0 11.75 0zm5.34 17.296a.675.675 0 0 1-.957.09l-4.63-3.707a.68.68 0 0 1-.253-.527V6.093a.68.68 0 0 1 .68-.68h.003a.68.68 0 0 1 .68.68v6.686l4.387 3.56a.68.68 0 0 1 .09.957z"/>
                </svg>
              </a>
              <a
                href="https://github.com/cloud-native-latvia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-200 hover:text-white transition-colors"
                title="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="mailto:hello@cloudnative.lv"
                className="text-rose-200 hover:text-white transition-colors"
                title="Email"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
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
