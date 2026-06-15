import { useEffect, useState, useCallback } from 'react';
import { _subscribe } from '../../utils/toast';

const DURATION = 5000;

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11.5 14.5 15.5 9.5" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const CLOSE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function ToastItem({ item, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(item.id), 340);
  }, [item.id, onRemove]);

  useEffect(() => {
    const showRaf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    const timer = setTimeout(dismiss, DURATION);
    return () => { cancelAnimationFrame(showRaf); clearTimeout(timer); };
  }, [dismiss]);

  const { title, description } = item;

  return (
    <div
      className={`nt-toast nt-toast--${item.type}${visible && !leaving ? ' nt-toast--in' : ''}${leaving ? ' nt-toast--out' : ''}`}
      role={item.type === 'error' ? 'alert' : 'status'}
      aria-live={item.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className={`nt-icon nt-icon--${item.type}`} aria-hidden="true">
        {ICONS[item.type] || ICONS.info}
      </div>

      <div className="nt-body">
        {title  && <div className="nt-title">{title}</div>}
        {description && <div className="nt-desc">{description}</div>}
      </div>

      <button className="nt-close" onClick={dismiss} aria-label="Fermer la notification">
        {CLOSE_ICON}
      </button>

      <div className="nt-progress">
        <div className={`nt-progress-bar nt-progress-bar--${item.type}`} style={{ animationDuration: `${DURATION}ms` }} />
      </div>
    </div>
  );
}

export default function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    return _subscribe((payload, type = 'info') => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev.slice(-4), { id, type, ...payload }]);
    });
  }, []);

  return (
    <>
      {children}
      <div className="nt-container" aria-label="Notifications">
        {items.map((item) => (
          <ToastItem key={item.id} item={item} onRemove={remove} />
        ))}
      </div>
    </>
  );
}
