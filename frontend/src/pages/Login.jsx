import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BarChart2, TrendingUp, DollarSign, ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const features = [
  { icon: <TrendingUp size={15} />, text: 'Real-time sales dashboards' },
  { icon: <DollarSign size={15} />, text: 'Automated commission tracking' },
  { icon: <BarChart2 size={15} />, text: 'AI-powered performance insights' },
  { icon: <ShieldCheck size={15} />, text: 'Fraud detection & alerts' },
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'influencer') nav('/influencer');
      else if (user.role === 'finance') nav('/finance');
      else nav('/admin');
    } catch {
      toast.error('Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-icon"><TrendingUp size={16} color="#fff" /></div>
            <span className="auth-brand-name">TrackInfluencer</span>
          </div>
          <h1 className="auth-left-heading">
            Manage your<br />influencer campaigns<br />with precision.
          </h1>
          <p className="auth-left-sub">
            Track affiliate sales, automate commission payouts, and get AI-powered insights — all in one place.
          </p>
          <div className="auth-features">
            {features.map((f, i) => (
              <div key={i} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-grid-bg" aria-hidden="true">
          {Array.from({ length: 80 }).map((_, i) => <div key={i} className="auth-grid-cell" />)}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon"><TrendingUp size={14} color="#fff" /></div>
            <div className="auth-logo-text">Track<span>Influencer</span></div>
          </div>
          <h2>Welcome back</h2>
          <p className="sub">Sign in to your account to continue</p>
          <form onSubmit={submit}>
            <div>
              <label className="field-label">Email address</label>
              <div className="input-icon-wrap">
                <Mail size={14} className="input-icon" />
                <input placeholder="you@example.com" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="field-label">Password</label>
              <div className="input-icon-wrap">
                <Lock size={14} className="input-icon" />
                <input placeholder="••••••••" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: 4, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
              {loading ? <Loader2 size={14} className="spin-icon" /> : <ArrowRight size={14} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="footer-link">Don't have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
