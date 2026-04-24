import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';
import { TrendingUp, User, Mail, Lock, ArrowRight, Loader2, BarChart2, DollarSign, ShieldCheck } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'influencer' });
  const [adminExists, setAdminExists] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/admin-exists').then(({ data }) => setAdminExists(data.exists));
  }, []);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'influencer') nav('/influencer');
      else if (user.role === 'finance') nav('/finance');
      else nav('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
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
            Join the platform<br />built for modern<br />brand growth.
          </h1>
          <p className="auth-left-sub">
            Connect with influencers, track every sale, and pay commissions automatically — no spreadsheets needed.
          </p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><TrendingUp size={15} /></span>
              <span>Real-time sales dashboards</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><DollarSign size={15} /></span>
              <span>Automated commission tracking</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><BarChart2 size={15} /></span>
              <span>AI-powered performance insights</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><ShieldCheck size={15} /></span>
              <span>Fraud detection &amp; alerts</span>
            </div>
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
          <h2>Create account</h2>
          <p className="sub">Join the platform and start tracking</p>
          <form onSubmit={submit}>
            <div>
              <label className="field-label">Full Name</label>
              <div className="input-icon-wrap">
                <User size={14} className="input-icon" />
                <input placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
            </div>
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
            <div>
              <label className="field-label">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="influencer">Influencer</option>
                {!adminExists && <option value="admin">Admin (Brand)</option>}
                <option value="finance">Finance Team</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: 4, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
              {loading ? <Loader2 size={14} className="spin-icon" /> : <ArrowRight size={14} />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="footer-link">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
