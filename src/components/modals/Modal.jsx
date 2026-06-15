import { useEffect, useRef, memo, useState } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const Modal = memo(({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const overlayRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return () => {};
    }
    document.body.style.overflow = 'hidden';
    // rAF hors du corps de l'effet pour éviter setState synchrone
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
      setVisible(false);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const el = overlayRef.current;
    if (!el) return;
    const focusables = [...el.querySelectorAll(FOCUSABLE)];
    if (focusables[0]) focusables[0].focus();
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus(); } }
    };
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    el.addEventListener('keydown', handleTab);
    el.addEventListener('keydown', handleEsc);
    return () => { el.removeEventListener('keydown', handleTab); el.removeEventListener('keydown', handleEsc); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay ${visible ? 'modal-visible' : ''}`}
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`modal modal-content modal-${size}`}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
});
Modal.displayName = 'Modal';
export default Modal;
