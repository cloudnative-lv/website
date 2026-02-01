import { useLanguage } from '../i18n/LanguageContext';

const languages = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'lv', label: 'LV', flag: '🇱🇻' }
];

export default function LanguageSwitcher() {
  const { language, switchLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
            language === lang.code
              ? 'bg-white text-rose-700'
              : 'text-white hover:bg-white/20'
          }`}
          title={lang.code === 'en' ? 'English' : 'Latviešu'}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
