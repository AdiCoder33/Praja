import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CREDENTIALS = {
  badgeId: 'POLICE123',
  password: 'secure123',
  name: 'Officer Meera Singh',
};

export default function Login() {
  const navigate = useNavigate();
  const [badgeId, setBadgeId] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('firAuth');
    if (session) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (badgeId === CREDENTIALS.badgeId && password === CREDENTIALS.password) {
      localStorage.setItem('firAuth', JSON.stringify({
        badgeId,
        name: CREDENTIALS.name,
      }));
      navigate('/dashboard');
    } else {
      alert('Invalid Badge ID or Password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">🚔</span>
          <div>
            <div className="login-title">Police FIR Portal</div>
            <div className="login-subtitle">Secure officer access</div>
          </div>
        </div>
        <form className="login-form" onSubmit={handleLogin}>
          <label className="login-label" htmlFor="badge">Badge ID</label>
          <input
            id="badge"
            className="login-input"
            value={badgeId}
            onChange={(e) => setBadgeId(e.target.value)}
            placeholder="POLICE123"
            required
          />

          <label className="login-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}
