import { memo } from 'react';

const SkeletonTable = memo(({ rows = 8, cols = 5 }) => (
  <div className="skeleton-table" aria-label="Chargement en cours" role="status">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="skeleton-row">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="skeleton-cell" />
        ))}
      </div>
    ))}
  </div>
));
SkeletonTable.displayName = 'SkeletonTable';
export default SkeletonTable;
