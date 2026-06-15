import { useEffect, useState } from 'react';
import { _subscribe } from '../../utils/toast';

export default function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return _subscribe((message, type = 'info') => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3000);
    });
  }, []);

  return (
    <>
      {children}
      <div className="toast-container" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} role="status">
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
