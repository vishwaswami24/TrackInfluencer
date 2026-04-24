import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import toast from 'react-hot-toast';
import { Link2, Copy } from 'lucide-react';

const fmt = n => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const NAV_ITEMS = [
  { id: 'overview',  icon: '📊', label: 'Overview' },
  { id: 'sales',     icon: '💳', label: 'My Sales' },
  { id: 'payments',  icon: '💰', label: 'Payments' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#ffffff', border:'1px solid #e2e2e2', borderRadius:4, padding:'9px 13px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
      <p style={{ color:'#888888', fontSize:11, marginBottom:4 }}>{label}</p>
      <p style={{ color:'#111111', fontSize:13, fontWeight:600 }}>{fmt(payload[0].value)}</p>
    </div>
  );
};

export default function InfluencerDashboard() {
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [sales, setSales] = useState([]);
  const [salesTime, setSalesTime] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/influencers/me'),
      api.get('/sales'),
      api.get('/sales/over-time?days=30'),
      api.get('/payments'),
    ]).then(([p, s, st, pay]) => {
      setProfile(p.data);
      setSales(s.data);
      setSalesTime(st.data);
      setPayments(pay.data);
    }).catch(() => toast.error('Failed to load data'));
  }, []);

  const trackingUrl = profile ? `http://localhost:5000/api/influencers/track/${profile.referral_code}` : '';

  if (!profile) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard…</p>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar items={NAV_ITEMS} active={tab} onSelect={setTab} />
      <main className="main-content">

        {tab === 'overview' && (
          <>
            <div className="page-header">
              <h1>My Dashboard</h1>
              <p>Track your performance, clicks, and earnings in real time.</p>
            </div>
            <div className="page-body">
              <div className="stats-grid">
                <StatCard label="Total Revenue" value={fmt(profile.total_revenue)} icon="💰" color="purple" />
                <StatCard label="Total Sales" value={profile.total_sales} icon="🛒" color="cyan" />
                <StatCard label="My Commission" value={fmt(profile.total_commission)} icon="💸" color="amber" />
                <StatCard label="Total Clicks" value={profile.total_clicks?.toLocaleString()} icon="👆" color="green" />
              </div>

              <div className="affiliate-box">
                <div className="affiliate-box-header">
                  <span className="icon"><Link2 size={15} /></span>
                  <h3>Your Affiliate Link</h3>
                </div>
                <div className="link-display">
                  <code>{trackingUrl}</code>
                  <button className="btn-sm" style={{display:'flex',alignItems:'center',gap:5}} onClick={() => { navigator.clipboard.writeText(trackingUrl); toast.success('Copied to clipboard!'); }}>
                    <Copy size={11}/> Copy
                  </button>
                </div>
                <div className="commission-pill">
                  ✦ Commission Rate: {profile.commission_rate}% per sale
                </div>
              </div>

              <div className="chart-card col-12">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Revenue Over Time</div>
                    <div className="chart-subtitle">Last 30 days</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={salesTime}>
                    <defs>
                      <linearGradient id="myRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tickFormatter={d => d?.slice(5)} tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#myRevGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {tab === 'sales' && (
          <>
            <div className="page-header">
              <h1>My Sales</h1>
              <p>All sales attributed to your referral code.</p>
            </div>
            <div className="page-body">
              <div className="table-card">
                <div className="table-header">
                  <span className="table-title">Sales History ({sales.length})</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>Product</th><th>Amount</th><th>Commission</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {sales.map((s, i) => (
                      <tr key={s._id || i}>
                        <td style={{ fontWeight: 500 }}>{s.product_name || '—'}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(s.amount)}</td>
                        <td style={{ color: 'var(--green)' }}>{fmt(s.commission_amount)}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'payments' && (
          <>
            <div className="page-header">
              <h1>Payments</h1>
              <p>Your payout history and current payment status.</p>
            </div>
            <div className="page-body">
              <div className="stats-grid" style={{ marginBottom: 20 }}>
                <StatCard label="Total Earned" value={fmt(payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0))} icon="✅" color="green" />
                <StatCard label="Pending Payout" value={fmt(payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0))} icon="⏳" color="amber" />
                <StatCard label="Approved" value={fmt(payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0))} icon="👍" color="cyan" />
              </div>
              <div className="table-card">
                <div className="table-header">
                  <span className="table-title">Payment History</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>Amount</th><th>Period</th><th>Status</th><th>Paid At</th></tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{fmt(p.amount)}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {p.period_start?.slice(0,10)} → {p.period_end?.slice(0,10)}
                        </td>
                        <td><span className={`badge ${p.status === 'paid' ? 'green' : p.status === 'approved' ? 'blue' : 'yellow'}`}>{p.status}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
