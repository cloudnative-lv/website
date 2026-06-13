import { useLanguage } from '../i18n/useLanguage';

const languages = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'lv', label: 'LV', flag: '🇱🇻' }
];

export default function LanguageSwitcher() {
  const { language, switchLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-rose-50 rounded-full p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
            language === lang.code
              ? 'bg-pink text-white'
              : 'text-gray-600 hover:bg-rose-100'
          }`}
          title={lang.code === 'en' ? 'English' : 'Latviešu'}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
