import LanguageSelector from './LanguageSelector';

interface Props {
  officerName: string;
  language: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Topbar({ officerName, language, onLanguageChange, onLogout }: Props) {
  const today = new Date().toLocaleDateString();
  return (
    <div className="w-full bg-white/80 backdrop-blur border border-slate-200 rounded-xl shadow-sm px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-slate-900 font-semibold text-lg">{greeting()}, Officer {officerName} 👮</div>
        <div className="text-sm text-slate-500">Justice delayed is justice denied. · {today}</div>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSelector value={language} onChange={onLanguageChange} />
        <button
          onClick={onLogout}
          className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
