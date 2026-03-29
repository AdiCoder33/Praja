import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { sampleFIRs, FIRItem, Status, Priority } from '../data/sampleFirs';

export default function FIRRecords() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'All' | Status>('All');
  const [priority, setPriority] = useState<'All' | Priority>('All');
  const [category, setCategory] = useState<'All' | string>('All');
  const [selected, setSelected] = useState<FIRItem | null>(null);

  const categories = useMemo(() => Array.from(new Set(sampleFIRs.map((f) => f.category))), []);

  const filtered = useMemo(() => {
    return sampleFIRs.filter((f) => {
      const s = search.toLowerCase();
      const matchesSearch = f.title.toLowerCase().includes(s) || f.summary.toLowerCase().includes(s);
      const matchesStatus = status === 'All' ? true : f.status === status;
      const matchesPriority = priority === 'All' ? true : f.priority === priority;
      const matchesCategory = category === 'All' ? true : f.category === category;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [search, status, priority, category]);

  return (
    <div className="officer-layout">
      <Sidebar />
      <main className="officer-main">
        <header className="hero-header">
          <div>
            <div className="hero-title">FIR Records</div>
            <div className="hero-sub">Quick glance at all logged FIRs</div>
          </div>
        </header>

        <div className="glass-card" style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
          <div className="list-filters" style={{ flexWrap: 'wrap' }}>
            <input
              placeholder="Search title or summary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value as 'All' | Status)}>
              <option value="All">All status</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value as 'All' | Priority)}>
              <option value="All">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value as 'All' | string)}>
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="fir-list">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="fir-card"
                onClick={() => setSelected(f)}
                style={{ cursor: 'pointer' }}
              >
                <div className="fir-card-main">
                  <div>
                    <div className="fir-title">#{f.id} · {f.title}</div>
                    <div className="fir-meta">ID: {f.id} · {f.category} · {f.date}</div>
                    <div className="fir-meta">Place: {f.place}</div>
                    <div className="fir-meta">Complainant: {f.complainant}</div>
                    <div className="fir-summary">{f.summary}</div>
                  </div>
                  <div className="fir-tags">
                    <span className={`pill ${f.status === 'Pending' ? 'pill-amber' : 'pill-green'}`}>{f.status}</span>
                    <span className={`pill ${f.priority === 'High' ? 'pill-rose' : f.priority === 'Medium' ? 'pill-amber' : 'pill-sky'}`}>{f.priority}</span>
                  </div>
                </div>
                <div className="fir-actions">
                  <div className="toggle-wrap">
                    <span>Resolve</span>
                    <button className={`toggle ${f.status === 'Resolved' ? 'active' : ''}`}>
                      <span className="toggle-dot" />
                    </button>
                  </div>
                  <div className="icon-actions">
                    <button title="Call">📞</button>
                    <button title="Message">💬</button>
                    <button title="Play">▶️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="glass-card" style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
              <div className="fir-title" style={{ fontSize: '18px' }}>{selected.title}</div>
              <div className="fir-meta">{selected.category} · {selected.date}</div>
              <div className="fir-meta">Place: {selected.place}</div>
              <div className="fir-meta">Complainant: {selected.complainant}</div>
              <div className="fir-summary">{selected.summary}</div>
              <div className="fir-tags">
                <span className={`pill ${selected.status === 'Pending' ? 'pill-amber' : 'pill-green'}`}>{selected.status}</span>
                <span className={`pill ${selected.priority === 'High' ? 'pill-rose' : selected.priority === 'Medium' ? 'pill-amber' : 'pill-sky'}`}>{selected.priority}</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
