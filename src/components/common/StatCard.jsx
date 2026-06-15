import { memo } from 'react';
export default memo(function StatCard({ title, value, icon, color = 'var(--color-primary)', loading }) {
  if (loading) return <div className="stat-card stat-card--skeleton" />;
  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ background: `${color}18`, color }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
          {icon}
        </svg>
      </div>
      <div className="stat-card__body">
        <div className="stat-card__value">{value ?? '—'}</div>
        <div className="stat-card__title">{title}</div>
      </div>
    </div>
  );
});
