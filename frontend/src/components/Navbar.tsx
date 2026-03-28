import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar({ onRestart }: { onRestart?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const isComplaintPage = location.pathname === '/complaint';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <img src="/police_logo_v4.png" alt="Police Logo" width="40" />
          <span>{t('nav.logo')}</span>
        </div>

        {!isComplaintPage && (
          <div className="nav-links">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>{t('nav.home')}</a>
            <a href="#about">{t('nav.about')}</a>
            <a href="#contact">{t('nav.contact')}</a>
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
