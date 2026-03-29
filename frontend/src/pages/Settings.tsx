import Sidebar from '../components/Sidebar';

export default function Settings() {
  return (
    <div className="officer-layout">
      <Sidebar />
      <main className="officer-main">
        <header className="hero-header">
          <div>
            <div className="hero-title">Settings</div>
            <div className="hero-sub">Preferences for the officer portal</div>
          </div>
        </header>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0 }}>Preferences</h3>
          <div className="fir-card" style={{ gridTemplateColumns: '1fr auto' }}>
            <div>
              <div className="fir-title">Dark mode</div>
              <div className="fir-meta">Toggle UI theme (visual only)</div>
            </div>
            <button className="toggle">
              <span className="toggle-dot" />
            </button>
          </div>
          <div className="fir-card" style={{ gridTemplateColumns: '1fr auto' }}>
            <div>
              <div className="fir-title">Email alerts</div>
              <div className="fir-meta">Send summaries to registered email</div>
            </div>
            <button className="toggle active">
              <span className="toggle-dot" />
            </button>
          </div>
          <div className="fir-card" style={{ gridTemplateColumns: '1fr auto' }}>
            <div>
              <div className="fir-title">SMS updates</div>
              <div className="fir-meta">Status pings for FIR changes</div>
            </div>
            <button className="toggle">
              <span className="toggle-dot" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
