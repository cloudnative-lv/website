import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { SubscribeButton } from './SubscribeModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-white text-rose-700'
        : 'text-white hover:bg-white/20'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg font-semibold transition-all ${
      isActive
        ? 'bg-white text-rose-700'
        : 'text-white hover:bg-white/10'
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
    <nav className="bg-linear-to-r from-rose-400 to-rose-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/images/logo_light.svg" alt="Cloud Native Latvia" className="h-10 w-auto" />
            <div className="hidden sm:flex flex-col leading-tight uppercase text-center">
              <span className="text-white font-bold text-sm tracking-tight">Cloud Native</span>
              <span className="text-burgundy font-black text-lg tracking-wide" style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' }}>LATVIA</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            <div className="ml-2">
              <SubscribeButton variant="primary" />
            </div>
            <div className="ml-2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
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
          <div className="md:hidden py-4 border-t border-white/20">
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
              <div className="pt-4 border-t border-white/20 mt-4 flex items-center gap-4">
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
