import { memo } from 'react';
export default memo(function ErrorState({ message = 'Une erreur est survenue', onRetry }) {
  return (
    <div className="error-state">
      <p>{message}</p>
      {onRetry && <button className="btn btn-secondary btn-sm" onClick={onRetry}>Réessayer</button>}
    </div>
  );
});
