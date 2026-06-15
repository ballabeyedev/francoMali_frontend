import { memo } from 'react';
const VARIANTS = {
  success: { bg: '#e8f5e9', color: '#2e7d32' },
  warning: { bg: '#fff8e1', color: '#f57f17' },
  danger:  { bg: '#ffebee', color: '#c62828' },
  info:    { bg: '#e3f2fd', color: '#1565c0' },
  default: { bg: '#f5f5f5', color: '#616161' },
};
export default memo(function Badge({ children, variant = 'default' }) {
  const v = VARIANTS[variant] || VARIANTS.default;
  return (
    <span style={{ background: v.bg, color: v.color, padding: '2px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, display: 'inline-block' }}>
      {children}
    </span>
  );
});
