import { present } from '../utils/aiProcessor';

export interface FIRItem {
  id: string;
  name: string;
  relationType: 'Father' | 'Husband';
  relationName: string;
  mobile: string;
  description: string;
  summary: string;
  status: 'Pending' | 'Resolved';
  category: string;
  priority: string;
  date: string;
}

interface Props {
  fir: FIRItem;
  language: string;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FIRCard({ fir, language, onToggleStatus, onDelete }: Props) {
  const statusColor = fir.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
  const priorityColor =
    fir.priority === 'High'
      ? 'bg-rose-100 text-rose-700'
      : fir.priority === 'Medium'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-sky-100 text-sky-700';

  const speak = () => {
    const utter = new SpeechSynthesisUtterance(present(fir.summary, language));
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="bg-white rounded-xl p-4 flex flex-col gap-3 hover:shadow-lg transition border border-slate-200">
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{fir.date}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{fir.category}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColor}`}>{fir.priority}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{fir.status}</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">{present(fir.summary, language)}</p>
          <p className="text-sm text-slate-500">Complainant: {fir.name} ({fir.relationType}: {fir.relationName}) · {fir.mobile}</p>
        </div>
        <div className="flex flex-col gap-2 items-end shrink-0">
          <button onClick={speak} className="text-lg" title="Text to Speech">🔊</button>
          <button
            onClick={() => onToggleStatus(fir.id)}
            className="text-sm px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {fir.status === 'Pending' ? 'Mark Resolved' : 'Mark Pending'}
          </button>
          <button
            onClick={() => onDelete(fir.id)}
            className="text-sm px-3 py-1 rounded-md bg-rose-500 text-white hover:bg-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
