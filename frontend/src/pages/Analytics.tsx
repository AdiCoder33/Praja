import Sidebar from '../components/Sidebar';
import { sampleFIRs } from '../data/sampleFirs';

export default function Analytics() {
  const total = sampleFIRs.length;
  const resolved = sampleFIRs.filter((f) => f.status === 'Resolved').length;
  const pending = sampleFIRs.filter((f) => f.status === 'Pending').length;
  const highPriority = sampleFIRs.filter((f) => f.priority === 'High').length;

  const categoryCounts = sampleFIRs.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="officer-layout">
      <Sidebar />
      <main className="officer-main">
        <header className="hero-header">
          <div>
            <div className="hero-title">Analytics</div>
            <div className="hero-sub">Snapshot of FIR data</div>
          </div>
        </header>

        <section className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-label">Total FIRs</div>
            <div className="stat-value">{total}</div>
            <div className="stat-foot">Current view</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{resolved}</div>
            <div className="stat-foot">Resolved so far</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{pending}</div>
            <div className="stat-foot">Needs attention</div>
          </div>
          <div className="stat-card violet">
            <div className="stat-label">High Priority</div>
            <div className="stat-value">{highPriority}</div>
            <div className="stat-foot">Across all FIRs</div>
          </div>
        </section>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ margin: 0 }}>Top Categories</h3>
          <div className="fir-list">
            {topCategories.map(([cat, count]) => (
              <div key={cat} className="fir-card" style={{ gridTemplateColumns: '1fr auto' }}>
                <div className="fir-title">{cat}</div>
                <div className="pill pill-sky">{count} FIRs</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
