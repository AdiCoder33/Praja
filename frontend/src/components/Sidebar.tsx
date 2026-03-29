const menu = [
  { label: 'Dashboard', icon: '📊' },
  { label: 'Create FIR', icon: '📝' },
  { label: 'FIR Records', icon: '📂' },
  { label: 'Analytics', icon: '📈' },
  { label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 flex-col bg-slate-900 text-slate-100 h-screen sticky top-0 shadow-xl">
      <div className="px-5 py-6 flex items-center gap-3 text-lg font-semibold border-b border-slate-800">
        <span className="text-2xl">🚔</span>
        <div>
          <div>FIR System</div>
          <div className="text-xs text-slate-400">Inspector Dashboard</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item, idx) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition hover:bg-slate-800 ${
              idx === 0 ? 'bg-slate-800 text-white' : 'text-slate-200'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-4 pb-5 text-xs text-slate-400">Phase 1 · Frontend only</div>
    </aside>
  );
}
