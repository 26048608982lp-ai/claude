import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative group">
        <button className="bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all duration-300 flex items-center gap-2">
          <span>🌐</span>
          <span>{currentLanguage.nativeName}</span>
          <span>▼</span>
        </button>
        
        <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-white/20">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-white/50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                i18n.language === language.code ? 'bg-qixi-pink text-white' : 'text-gray-800'
              }`}
            >
              <div className="font-medium">{language.nativeName}</div>
              <div className="text-xs opacity-75">{language.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;