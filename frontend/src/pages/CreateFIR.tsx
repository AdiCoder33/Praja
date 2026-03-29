import Sidebar from '../components/Sidebar';

export default function CreateFIR() {
  return (
    <div className="officer-layout">
      <Sidebar />
      <main className="officer-main">
        <header className="hero-header">
          <div>
            <div className="hero-title">Create FIR</div>
            <div className="hero-sub">Capture new FIR details</div>
          </div>
        </header>

        <div className="glass-card create-card">
          <h3>Create FIR</h3>
          <form className="form-grid">
            <label>
              <span>Name</span>
              <input placeholder="Enter name" />
            </label>
            <label>
              <span>Relation</span>
              <select>
                <option>Father</option>
                <option>Husband</option>
                <option>Mother</option>
              </select>
            </label>
            <label>
              <span>Relation Name</span>
              <input placeholder="Enter relation name" />
            </label>
            <label>
              <span>Mobile</span>
              <input placeholder="10 digit mobile" />
            </label>
            <label className="full-row">
              <span>Description</span>
              <textarea rows={3} placeholder="Enter complaint details" />
            </label>
            <div className="form-actions">
              <button type="button" className="ghost-btn">🎤 Voice Input</button>
              <button type="button" className="primary-btn">Save FIR</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
