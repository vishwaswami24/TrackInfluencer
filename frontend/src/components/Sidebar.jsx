import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, Wallet,
  Bot, ShieldAlert, LogOut, BarChart2, MousePointerClick, TrendingUp
} from 'lucide-react';

const ICON_MAP = {
  dashboard:   <LayoutDashboard size={15} />,
  influencers: <Users size={15} />,
  sales:       <CreditCard size={15} />,
  payments:    <Wallet size={15} />,
  'ai-insights': <Bot size={15} />,
  fraud:       <ShieldAlert size={15} />,
  overview:    <LayoutDashboard size={15} />,
};

const AVATAR_BG = ['#2563eb','#374151','#6366f1','#0369a1','#16a34a','#b45309'];
const avatarBg = name => AVATAR_BG[(name?.charCodeAt(0) || 0) % AVATAR_BG.length];

export default function Sidebar({ items, active, onSelect }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <TrendingUp size={14} color="#fff" />
        </div>
        <div className="sidebar-logo-text">Track<span>Influencer</span></div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-label">Menu</div>
          {items.map(item => (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <span className="nav-icon">{ICON_MAP[item.id] ?? <BarChart2 size={15} />}</span>
              <span>{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar" style={{ background: avatarBg(user?.name) }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
