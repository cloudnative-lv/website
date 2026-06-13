import { useState } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import { SocialLink } from './SocialIcons';
import { SOCIAL_LINKS } from '../data/socialLinks';

export default function SubscribeModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // For now, open the CNCF community page where they can subscribe
    // In the future, this could be connected to a mailing list service
    window.open('https://ocgroups.dev/cncf/group/xggmcq8', '_blank');
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
            {SOCIAL_LINKS.filter((s) => ['linkedin', 'bluesky', 'cncf'].includes(s.key)).map((s) => (
              <SocialLink key={s.key} href={s.href} title={s.title} icon={<s.Icon className="w-6 h-6" />} />
            ))}
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
    primary: 'bg-pink text-white hover:bg-rose-500 shadow-md hover:shadow-lg',
    secondary: 'bg-pink text-white hover:bg-rose-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-pink text-pink hover:bg-rose-50'
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
