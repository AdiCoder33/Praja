import { LANGUAGES } from '../utils/translate';

interface Props {
  value: string;
  onChange: (lang: string) => void;
}

export default function LanguageSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/90">
      <span className="font-semibold">🌏 Language</span>
      <select
        className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-slate-900">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
