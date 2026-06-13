import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';
import { SubscribeButton } from './SubscribeModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === '/';

  // The "Cloud Native Latvia" wordmark stays hidden while the hero is on screen
  // (home, not scrolled) and reveals once the hero scrolls under the navbar.
  // Off the home page there is no hero, so it shows immediately.
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const wordmark = document.getElementById('hero-wordmark');
    if (!wordmark) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPastHero(!entry.isIntersecting),
      { rootMargin: '-72px 0px 0px 0px' }
    );
    observer.observe(wordmark);
    return () => observer.disconnect();
  }, [isHome]);
  const showWordmark = !isHome || scrolledPastHero;

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-pink text-white'
        : 'text-gray-700 hover:text-burgundy hover:bg-rose-50'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg font-semibold transition-all ${
      isActive
        ? 'bg-pink text-white'
        : 'text-gray-700 hover:bg-rose-50'
    }`;

  const navLinks = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/events', label: t('nav.events') },
    { to: '/speakers', label: t('nav.speakers') },
    { to: '/team', label: t('nav.team') },
    { to: '/swag', label: t('nav.swag') },
    { to: '/sponsors', label: t('nav.sponsors') }
  ];

  return (
    <nav className="bg-white border-b border-rose-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Cloud Native Latvia">
            <img src="/images/logo.svg" alt="" className="h-9 md:h-10 w-auto shrink-0" />
            <img
              src="/images/wordmark.svg"
              alt="Cloud Native Latvia"
              className={`h-5 md:h-6 w-auto transition-opacity duration-300 ${showWordmark ? 'opacity-100' : 'opacity-0'}`}
            />
          </Link>

          {/* Desktop Navigation (centered) */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-1">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            <div className="ml-2">
              <SubscribeButton variant="primary" />
            </div>
          </div>

          {/* Language switcher */}
          <div className="hidden md:block shrink-0">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden ml-auto text-burgundy p-2 rounded-lg hover:bg-rose-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-rose-100">
            <div className="space-y-2">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={mobileLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="pt-4 border-t border-rose-100 mt-4 flex items-center gap-4">
                <SubscribeButton variant="outline" />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
