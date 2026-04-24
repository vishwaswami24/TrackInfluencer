import { DollarSign, ShoppingCart, TrendingUp, MousePointerClick, Clock, ThumbsUp, CheckCircle, Bell } from 'lucide-react';

const ICON_MAP = {
  '💰': <DollarSign size={15} />,
  '🛒': <ShoppingCart size={15} />,
  '💸': <DollarSign size={15} />,
  '📈': <TrendingUp size={15} />,
  '👆': <MousePointerClick size={15} />,
  '⏳': <Clock size={15} />,
  '👍': <ThumbsUp size={15} />,
  '✅': <CheckCircle size={15} />,
  '🔔': <Bell size={15} />,
};

export default function StatCard({ label, value, icon, color = 'purple' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>
        {ICON_MAP[icon] ?? <TrendingUp size={15} />}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
