import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <img src="/police_logo_v4.png" alt="Police Logo" width="40" />
          <span>{t('nav.brand')}</span>
        </div>

        <div className="nav-links">
          <a href="#home" onClick={() => navigate('/')}>{t('nav.home')}</a>
          <a href="#about">{t('nav.about')}</a>
          <a href="#contact">{t('nav.contact')}</a>
        </div>

        <div className="nav-language">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'te' | 'hi')}
            className="language-select"
          >
            <option value="en">🇬🇧 English</option>
            <option value="te">🇮🇳 తెలుగు</option>
            <option value="hi">🇮🇳 हिंदी</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
