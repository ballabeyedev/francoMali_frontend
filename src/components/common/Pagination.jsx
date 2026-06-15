import { memo, useMemo } from 'react';
function getPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 4) pages.push('…');
  const s = Math.max(2, current - 1), e = Math.min(total - 1, current + 1);
  for (let i = s; i <= e; i++) pages.push(i);
  if (current < total - 3) pages.push('…');
  pages.push(total);
  return pages;
}
export default memo(function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = useMemo(() => getPages(currentPage, totalPages), [currentPage, totalPages]);
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="pagination-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>‹</button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} className="pagination-ellipsis">…</span>
          : <button key={p} className={`pagination-btn${currentPage === p ? ' active' : ''}`} onClick={() => onPageChange(p)} aria-current={currentPage === p ? 'page' : undefined}>{p}</button>
      )}
      <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>›</button>
    </nav>
  );
});
