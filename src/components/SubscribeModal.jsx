import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function SubscribeModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // For now, open the CNCF community page where they can subscribe
    // In the future, this could be connected to a mailing list service
    window.open('https://community.cncf.io/cloud-native-latvia/', '_blank');
    setStatus('success');
    
    setTimeout(() => {
      setEmail('');
      setStatus('idle');
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-burgundy mb-2">
            {t('subscribe.title')}
          </h2>
          <p className="text-gray-600">
            {t('subscribe.description')}
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-semibold">{t('subscribe.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('subscribe.placeholder')}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-pink text-white py-3 rounded-xl font-semibold hover:bg-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? t('subscribe.loading') : t('subscribe.button')}
            </button>
          </form>
        )}

        {/* Social links */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center mb-3">{t('subscribe.followUs')}</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://www.linkedin.com/company/cloud-native-latvia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-rose-600 transition-colors"
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
              className="text-gray-400 hover:text-rose-600 transition-colors"
              title="Bluesky"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
              </svg>
            </a>
            <a
              href="https://community.cncf.io/cloud-native-latvia/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-rose-600 transition-colors"
              title="CNCF Community"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubscribeButton({ className = '', variant = 'primary' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all';
  const variants = {
    primary: 'bg-white text-burgundy hover:bg-rose-50 shadow-lg hover:shadow-xl',
    secondary: 'bg-pink text-white hover:bg-rose-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-white text-white hover:bg-white/10'
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`${baseClasses} ${variants[variant]} ${className}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {t('subscribe.buttonShort')}
      </button>
      <SubscribeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
