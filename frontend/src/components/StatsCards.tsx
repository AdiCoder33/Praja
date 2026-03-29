interface Props {
  total: number;
  resolved: number;
  pending: number;
}

const cards = [
  { key: 'total', label: 'Total FIRs', color: 'from-blue-500 to-blue-600', icon: '📑' },
  { key: 'resolved', label: 'Resolved', color: 'from-emerald-500 to-emerald-600', icon: '✅' },
  { key: 'pending', label: 'Pending', color: 'from-amber-500 to-orange-500', icon: '⏳' },
] as const;

export default function StatsCards({ total, resolved, pending }: Props) {
  const values: Record<string, number> = { total, resolved, pending };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl bg-white shadow-md border border-slate-200 p-4 flex items-center gap-4"
        >
          <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${card.color} text-white flex items-center justify-center text-xl`}>
            {card.icon}
          </div>
          <div>
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className="text-2xl font-bold text-slate-900">{values[card.key]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
