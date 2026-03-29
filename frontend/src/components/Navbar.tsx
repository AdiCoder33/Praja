import LanguageSelector from './LanguageSelector';

interface Props {
  officerName?: string;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  onLogout?: () => void;
  onRestart?: () => void;
  brandTitle?: string;
  brandIcon?: string;
}

export default function Navbar({ officerName, language, onLanguageChange, onLogout, onRestart, brandTitle, brandIcon }: Props) {
  return (
    <header className="app-navbar">
      <div className="navbar-left">
        {brandIcon ? (
          <img src={brandIcon} alt="logo" className="navbar-logo" />
        ) : (
          <span className="navbar-icon">🚔</span>
        )}
        <div className="navbar-brand">
          <div className="navbar-title">{brandTitle || 'FIR Management'}</div>
          {officerName && <div className="navbar-sub">Officer: {officerName}</div>}
        </div>
      </div>

      <div className="navbar-right">
        {language && onLanguageChange && (
          <LanguageSelector value={language} onChange={onLanguageChange} />
        )}
        {onRestart && (
          <button className="navbar-logout" onClick={onRestart}>
            Restart
          </button>
        )}
        {onLogout && (
          <button className="navbar-logout" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
