import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import toast from 'react-hot-toast';
import { Download, CheckCircle, Clock, AlertTriangle, Info, Bot, TrendingUp } from 'lucide-react';

const COLORS = ['#2563eb','#374151','#6366f1','#0369a1','#16a34a','#b45309','#7c3aed','#0f766e'];
const AVATAR_COLORS = ['#2563eb','#374151','#6366f1','#0369a1','#16a34a','#b45309'];
const avatarColor = name => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const fmt = n => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const NAV_ITEMS = [
  { id: 'dashboard',   icon: '📊', label: 'Dashboard' },
  { id: 'influencers', icon: '👥', label: 'Influencers' },
  { id: 'payments',    icon: '💰', label: 'Payments' },
  { id: 'ai-insights', icon: '🤖', label: 'AI Insights' },
];

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e2e2', borderRadius: 4, padding: '9px 13px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <p style={{ color: '#888888', fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: '#111111', fontSize: 13, fontWeight: 600 }}>
          {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function FinanceDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [overview, setOverview] = useState(null);
  const [salesTime, setSalesTime] = useState([]);
  const [payments, setPayments] = useState([]);
  const [prediction, setPrediction] = useState([]);
  const [insights, setInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [ov, st, pay] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/sales/over-time?days=30'),
        api.get('/payments'),
      ]);
      setOverview(ov.data);
      setSalesTime(st.data);
      setPayments(pay.data);
    } catch { toast.error('Failed to load data'); }
  };

  const loadAI = async () => {
    setAiLoading(true);
    try {
      const [pred, ins] = await Promise.all([
        api.get('/analytics/predict?days=7'),
        api.get('/analytics/ai-insights'),
      ]);
      setPrediction(pred.data.forecast || []);
      setInsights(ins.data);
    } catch { toast.error('AI service unavailable'); }
    finally { setAiLoading(false); }
  };

  const handleTabSelect = id => {
    setTab(id);
    if (id === 'ai-insights' && !prediction.length && !insights) loadAI();
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/payments/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      loadAll();
    } catch { toast.error('Update failed'); }
  };

  const handleRazorpayPayment = async (id) => {
    try {
      const { data } = await api.post(`/payments/${id}/razorpay`);
      const { order, key, payment } = data;

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'TrackInfluencer',
        description: `Payout to ${payment.influencer_id?.user_id?.name || 'Influencer'}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post(`/payments/${id}/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful');
            loadAll();
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on('payment.failed', () => toast.error('Payment failed'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
    }
  };

  const exportCSV = () => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/export/csv`, '_blank');

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const navItems = NAV_ITEMS.map(i => i.id === 'payments' && pendingCount > 0 ? { ...i, badge: pendingCount } : i);

  const insightIcon = type => type === 'warning'
    ? <AlertTriangle size={14} />
    : type === 'positive' ? <CheckCircle size={14} /> : <Info size={14} />;

  return (
    <div className="app-layout">
      <Sidebar items={navItems} active={tab} onSelect={handleTabSelect} />
      <main className="main-content">

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && overview && (
          <>
            <div className="page-header">
              <h1>Finance Dashboard</h1>
              <p>Financial overview of all influencer campaigns.</p>
            </div>
            <div className="page-body">
              <div className="stats-grid">
                <StatCard label="Total Revenue" value={fmt(overview.summary.total_revenue)} icon="💰" color="purple" />
                <StatCard label="Total Sales" value={overview.summary.total_sales} icon="🛒" color="cyan" />
                <StatCard label="Total Commission" value={fmt(overview.summary.total_commission)} icon="💸" color="amber" />
                <StatCard
                  label="Conversion Rate"
                  value={`${overview.conversion.total_clicks > 0 ? ((overview.conversion.total_conversions / overview.conversion.total_clicks) * 100).toFixed(1) : 0}%`}
                  icon="📈" color="green"
                />
              </div>

              {/* Payment status summary */}
              <div className="stats-grid" style={{ marginBottom: 24 }}>
                <StatCard label="Pending Payouts" value={fmt(payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0))} icon="⏳" color="amber" />
                <StatCard label="Approved Payouts" value={fmt(payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0))} icon="👍" color="cyan" />
                <StatCard label="Paid Out" value={fmt(payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0))} icon="✅" color="green" />
                <StatCard label="Pending Count" value={pendingCount} icon="🔔" color="purple" />
              </div>

              <div className="charts-grid">
                <div className="chart-card col-8">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Revenue Over Time</div>
                      <div className="chart-subtitle">Last 30 days</div>
                    </div>
                    <span className="chart-badge green"><TrendingUp size={10} style={{marginRight:3,verticalAlign:'middle'}}/>Live</span>
                  </div>
                  <ResponsiveContainer width="100%" height={230}>
                    <AreaChart data={salesTime}>
                      <defs>
                        <linearGradient id="finRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tickFormatter={d => d?.slice(5)} tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip formatter={fmt} />} />
                      <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#finRevGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card col-4">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Revenue Split</div>
                      <div className="chart-subtitle">By influencer</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie data={overview.revenueByInfluencer} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                        {overview.revenueByInfluencer.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#ffffff', border: '1px solid #e2e2e2', borderRadius: 4, fontSize: 12 }} />
                      <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#888888' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card col-12">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Top Influencers by Revenue</div>
                      <div className="chart-subtitle">Commission breakdown</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={overview.topInfluencers.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#555555', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip content={<CustomTooltip formatter={fmt} />} />
                      <Bar dataKey="revenue" name="Revenue" radius={[0, 2, 2, 0]}>
                        {overview.topInfluencers.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── INFLUENCERS (read-only) ── */}
        {tab === 'influencers' && overview && (
          <>
            <div className="page-header">
              <h1>Influencers</h1>
              <p>Performance and commission overview for all influencers.</p>
            </div>
            <div className="page-body">
              <div className="table-card">
                <div className="table-header">
                  <span className="table-title">All Influencers ({overview.topInfluencers.length})</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Influencer</th><th>Code</th><th>Clicks</th>
                      <th>Sales</th><th>Revenue</th><th>Commission Owed</th><th>Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.topInfluencers.map((inf, i) => (
                      <tr key={inf.referral_code}>
                        <td>
                          <div className="influencer-cell">
                            <div className="avatar" style={{ background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i+2) % COLORS.length]})` }}>
                              {inf.name?.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 500 }}>{inf.name}</span>
                          </div>
                        </td>
                        <td><code>{inf.referral_code}</code></td>
                        <td>{inf.total_clicks?.toLocaleString()}</td>
                        <td>{inf.sales_count}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(inf.revenue)}</td>
                        <td style={{ color: 'var(--green)' }}>{fmt(inf.revenue * 0.1)}</td>
                        <td>
                          <div>
                            <span className={`badge ${inf.conversion_rate > 5 ? 'green' : 'yellow'}`}>{inf.conversion_rate}%</span>
                            <div className="progress-bar" style={{ marginTop: 6, width: 80 }}>
                              <div className="progress-fill" style={{ width: `${Math.min(inf.conversion_rate * 5, 100)}%`, background: inf.conversion_rate > 5 ? 'var(--green)' : 'var(--amber)' }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── PAYMENTS ── */}
        {tab === 'payments' && (
          <>
            <div className="page-header">
              <h1>Payments</h1>
              <p>Review and process influencer payouts.</p>
            </div>
            <div className="page-body">
              <div className="stats-grid" style={{ marginBottom: 20 }}>
                <StatCard label="Pending" value={fmt(payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0))} icon="⏳" color="amber" />
                <StatCard label="Approved" value={fmt(payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0))} icon="👍" color="cyan" />
                <StatCard label="Paid Out" value={fmt(payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0))} icon="✅" color="green" />
              </div>

              <div className="table-card">
                <div className="table-header">
                  <span className="table-title">Payment History ({payments.length})</span>
                  <div className="table-actions">
                    <button onClick={exportCSV} className="btn-secondary" style={{ fontSize: 12, padding: '7px 14px', display:'flex', alignItems:'center', gap:5 }}><Download size={12}/>Export CSV</button>
                  </div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>Influencer</th><th>Amount</th><th>Period</th><th>Status</th><th>Paid At</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id}>
                        <td>
                          <div className="influencer-cell">
                            <div className="avatar" style={{ background: `linear-gradient(135deg, ${avatarColor(p.influencer_name)}, #b47aff)`, width: 28, height: 28, fontSize: 11 }}>
                              {p.influencer_name?.charAt(0)}
                            </div>
                            {p.influencer_name}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{fmt(p.amount)}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {p.period_start?.slice(0,10)} → {p.period_end?.slice(0,10)}
                        </td>
                        <td><span className={`badge ${p.status === 'paid' ? 'green' : p.status === 'approved' ? 'blue' : 'yellow'}`}>{p.status}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</td>
                        <td>
                          {p.status === 'pending' && <button className="btn-sm" onClick={() => updateStatus(p._id, 'approved')}>Approve</button>}
                          {p.status === 'approved' && <button className="btn-sm success" onClick={() => handleRazorpayPayment(p._id)}>Pay via Razorpay</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── AI INSIGHTS ── */}
        {tab === 'ai-insights' && (
          <>
            <div className="page-header">
              <h1>AI Insights</h1>
              <p>Sales forecasts and influencer performance analysis.</p>
            </div>
            <div className="page-body">
              {aiLoading && (
                <div className="loading-screen" style={{ minHeight: 300 }}>
                  <div className="spinner" />
                  <p style={{ color: 'var(--text-muted)' }}>Running AI analysis…</p>
                </div>
              )}
              {!aiLoading && !prediction.length && !insights && (
                <div className="empty-state">
                  <div className="empty-icon"><Bot size={32} strokeWidth={1.2} /></div>
                  <p>AI analysis not loaded yet</p>
                  <button className="btn-primary" onClick={loadAI} style={{ marginTop: 8 }}>Run AI Analysis</button>
                </div>
              )}
              {prediction.length > 0 && (
                <div className="chart-card col-12" style={{ marginBottom: 16 }}>
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Sales Forecast — Next 7 Days</div>
                      <div className="chart-subtitle">Polynomial regression with weekly seasonality</div>
                    </div>
                    <span className="chart-badge amber">AI Powered</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={prediction}>
                      <defs>
                        <linearGradient id="finForecastGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#b45309" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip formatter={fmt} />} />
                      <Area type="monotone" dataKey="predicted_revenue" stroke="#b45309" strokeWidth={2} strokeDasharray="6 3" fill="url(#finForecastGrad)" dot={{ fill: '#b45309', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              {insights?.insights && (
                <div className="form-card">
                  <h3>Influencer Performance Insights</h3>
                  <div className="insights-grid">
                    {insights.insights.map((ins, i) => (
                      <div key={i} className={`insight-item ${ins.type}`}>
                        <div className="insight-icon-wrap">{insightIcon(ins.type)}</div>
                        <div className="insight-text">{ins.message}</div>
                      </div>
                    ))}
                  </div>
                  {insights.source && (
                    <p style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
                      Source: {insights.source === 'openai' ? 'OpenAI GPT-3.5' : 'Rule-based engine'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
