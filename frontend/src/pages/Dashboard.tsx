import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { sampleFIRs, FIRItem, Status, Priority } from '../data/sampleFirs';

interface FormState {
  name: string;
  relation: string;
  relationName: string;
  mobile: string;
  description: string;
}

const initialForm: FormState = {
  name: '',
  relation: 'Father',
  relationName: '',
  mobile: '',
  description: '',
};


export default function Dashboard() {
  const [language, setLanguage] = useState('English');
  const [firs, setFirs] = useState<FIRItem[]>(sampleFIRs);
  const [form, setForm] = useState<FormState>(initialForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.relationName || !form.mobile || !form.description) {
      alert('Please fill all required fields');
      return;
    }

    const newFir: FIRItem = {
      id: crypto.randomUUID(),
      title: `${form.description.slice(0, 32)}${form.description.length > 32 ? '…' : ''}` || 'New FIR',
      category: 'General',
      date: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
      place: 'Not provided',
      complainant: form.name || 'Not provided',
      status: 'Pending',
      priority: 'Medium',
      summary: form.description,
    };

    setFirs((prev) => [newFir, ...prev]);
    setForm(initialForm);
  };

  const toggleStatus = (id: string) => {
    setFirs((prev) =>
      prev.map((fir) => (fir.id === id ? { ...fir, status: fir.status === 'Pending' ? 'Resolved' : 'Pending' } : fir)),
    );
  };

  const filtered = useMemo(() => {
    return firs.filter((fir) => {
      const matchesSearch = fir.title.toLowerCase().includes(search.toLowerCase()) || fir.summary.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? true : fir.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' ? true : fir.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [firs, search, statusFilter, priorityFilter]);

  const total = firs.length;
  const resolved = firs.filter((f) => f.status === 'Resolved').length;
  const pendingCount = firs.filter((f) => f.status === 'Pending').length;

  const mostCommonCategory = useMemo(() => {
    const counts = firs.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : 'N/A';
  }, [firs]);

  const highPriorityCount = firs.filter((f) => f.priority === 'High').length;
  const latestSummary = firs[0]?.summary || 'No FIRs yet';

  const today = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="officer-layout">
      <Sidebar />

      <main className="officer-main">
        <header className="hero-header">
          <div>
            <div className="hero-title">{greeting}, Officer Meera Singh 👮‍♀️</div>
            <div className="hero-sub">{today} · Justice delayed is justice denied.</div>
          </div>
          <div className="hero-actions">
            <div className="language-pill">
              <span>Language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>हिन्दी</option>
                <option>తెలుగు</option>
              </select>
            </div>
            <button className="icon-button" title="Notifications">🔔</button>
            <div className="avatar">MS</div>
          </div>
        </header>

        <section className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-label">Total FIRs</div>
            <div className="stat-value">{total}</div>
            <div className="stat-foot">↑ +8 this week</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Resolved FIRs</div>
            <div className="stat-value">{resolved}</div>
            <div className="stat-foot">↑ +3</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-foot">↔ this week</div>
          </div>
          <div className="stat-card violet insights-card">
            <div className="stat-label">AI Insights</div>
            <ul>
              <li>Most common category: {mostCommonCategory}</li>
              <li>{highPriorityCount} high priority FIRs</li>
              <li>Latest FIR summary: {latestSummary}</li>
            </ul>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="glass-card create-card">
            <h3>Create FIR</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                <span>Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter name"
                  required
                />
              </label>
              <label>
                <span>Relation</span>
                <select
                  value={form.relation}
                  onChange={(e) => setForm((p) => ({ ...p, relation: e.target.value }))}
                >
                  <option>Father</option>
                  <option>Husband</option>
                  <option>Mother</option>
                </select>
              </label>
              <label>
                <span>Relation Name</span>
                <input
                  value={form.relationName}
                  onChange={(e) => setForm((p) => ({ ...p, relationName: e.target.value }))}
                  placeholder="Enter relation name"
                  required
                />
              </label>
              <label>
                <span>Mobile</span>
                <input
                  value={form.mobile}
                  onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                  placeholder="10 digit mobile"
                  required
                />
              </label>
              <label className="full-row">
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Enter complaint details"
                  rows={3}
                  required
                />
              </label>
              <div className="form-actions">
                <button type="button" className="ghost-btn">🎤 Voice Input</button>
                <button type="submit" className="primary-btn">Save FIR</button>
              </div>
            </form>
          </div>

          <div className="glass-card fir-list-card">
            <div className="list-header">
              <h3>FIRs</h3>
              <div className="list-filters">
                <input
                  placeholder="Search summary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | Status)}>
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as 'All' | Priority)}>
                  <option value="All">All priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="fir-list">
              {filtered.map((fir) => (
                <div key={fir.id} className="fir-card">
                  <div className="fir-card-main">
                    <div>
                      <div className="fir-title">{fir.title}</div>
                      <div className="fir-meta">{fir.category} · {fir.date}</div>
                      <div className="fir-meta">Place: {fir.place}</div>
                      <div className="fir-meta">Complainant: {fir.complainant}</div>
                      <div className="fir-summary">{fir.summary}</div>
                    </div>
                    <div className="fir-tags">
                      <span className={`pill ${fir.status === 'Pending' ? 'pill-amber' : 'pill-green'}`}>{fir.status}</span>
                      <span className={`pill ${fir.priority === 'High' ? 'pill-rose' : fir.priority === 'Medium' ? 'pill-amber' : 'pill-sky'}`}>
                        {fir.priority}
                      </span>
                    </div>
                  </div>
                  <div className="fir-actions">
                    <div className="toggle-wrap">
                      <span>Resolve</span>
                      <button className={`toggle ${fir.status === 'Resolved' ? 'active' : ''}`} onClick={() => toggleStatus(fir.id)}>
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
          </div>
        </section>
      </main>
    </div>
  );
}
