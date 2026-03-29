import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LandingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const isLanding = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-brand" onClick={() => handleHome()} style={{ cursor: 'pointer' }}>
          <img src="/police_logo_v4.png" alt="Police Logo" width="40" />
          <span>{t('nav.logo')}</span>
        </div>

        {isLanding && (
          <div className="nav-links">
            <a href="/" onClick={handleHome}>{t('nav.home')}</a>
            <a href="#about">{t('nav.about')}</a>
            <a href="#contact" onClick={handleContact}>{t('nav.contact')}</a>
          </div>
        )}

        <div className="nav-language">
          <div className="prof-lang-selector">
            {(['en', 'te', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                className={`lang-option ${language === lang ? 'active' : ''}`}
                onClick={() => setLanguage(lang)}
              >
                {lang === 'en' ? 'EN' : lang === 'te' ? 'తె' : 'हि'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
