import { FIRItem } from './FIRCard';

interface Props {
  firs: FIRItem[];
}

export default function InsightsPanel({ firs }: Props) {
  if (!firs.length) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
        <div className="text-lg font-semibold text-slate-900 mb-2">AI Insights</div>
        <div className="text-sm text-slate-500">No FIRs yet to analyze.</div>
      </div>
    );
  }

  const categoryCounts = firs.reduce<Record<string, number>>((acc, fir) => {
    acc[fir.category] = (acc[fir.category] || 0) + 1;
    return acc;
  }, {});
  const mostCommonCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const highPriority = firs.filter((f) => f.priority === 'High').length;
  const latest = firs[0];

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🧠</span>
        <div className="text-lg font-semibold text-slate-900">AI Insights</div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 text-sm text-slate-700">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-xs uppercase text-slate-500">Common Category</div>
          <div className="text-base font-semibold text-slate-900">{mostCommonCategory}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-xs uppercase text-slate-500">High Priority</div>
          <div className="text-base font-semibold text-slate-900">{highPriority}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-xs uppercase text-slate-500">Latest FIR</div>
          <div className="text-base font-semibold text-slate-900 truncate">{latest.summary}</div>
        </div>
      </div>
    </div>
  );
}
