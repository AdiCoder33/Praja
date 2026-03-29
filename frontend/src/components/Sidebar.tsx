import { NavLink } from 'react-router-dom';

const menu = [
  { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
  { label: 'Create FIR', icon: '📝', path: '/create-fir' },
  { label: 'FIR Records', icon: '📂', path: '/fir-records' },
  { label: 'AI Summary', icon: '🤖', path: '/ai-summary' },
  { label: 'Analytics', icon: '📈', path: '/analytics' },
];

export default function Sidebar() {
  return (
    <aside className="officer-sidebar">
      <div className="sidebar-profile">
        <div className="profile-avatar">👮‍♂️</div>
        <div>
          <div className="profile-title">FIR Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="link-icon">🔧</span>
          <span>Settings</span>
        </NavLink>
        <NavLink to="/" className={({ isActive }) => `sidebar-link sidebar-logout ${isActive ? 'active' : ''}`}>
          <span className="link-icon">🚪</span>
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}
