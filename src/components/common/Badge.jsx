import { memo } from 'react';

const VARIANT_ICONS = {
  success: '●',
  danger:  '●',
  warning: '●',
  info:    '●',
  default: '●',
};

const Badge = memo(({ variant = 'default', children }) => (
  <span className={`badge badge-${variant}`} role="status">
    <span aria-hidden="true">{VARIANT_ICONS[variant] ?? '●'} </span>
    {children}
  </span>
));
Badge.displayName = 'Badge';
export default Badge;
