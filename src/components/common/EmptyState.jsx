import { memo } from 'react';
export default memo(function EmptyState({ message = 'Aucun résultat trouvé' }) {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={40} height={40} style={{ opacity: 0.3 }}>
        <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0H4"/>
      </svg>
      <p>{message}</p>
    </div>
  );
});
