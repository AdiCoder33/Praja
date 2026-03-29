import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar({ onRestart }: { onRestart?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const isComplaintPage = location.pathname === '/complaint';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.85); /* Triggers after ~85% of hero passed */
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
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
        <div className="nav-brand" onClick={() => handleHomeClick()} style={{ cursor: 'pointer' }}>
          <img src="/police_logo_v4.png" alt="Police Logo" width="40" />
          <span>{t('nav.logo')}</span>
        </div>

        {!isComplaintPage && (
          <div className="nav-links">
            <a href="/" onClick={handleHomeClick}>{t('nav.home')}</a>
            <a href="#about">{t('nav.about')}</a>
            <a href="#contact" onClick={handleContactClick}>{t('nav.contact')}</a>
          </div>
        )}

        {isComplaintPage && (
          <div className="nav-actions">
            <button onClick={onRestart} className="restart-button-nav">
              {t('nav.restart')}
            </button>
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
