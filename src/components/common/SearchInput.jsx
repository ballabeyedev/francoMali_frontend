import { memo } from 'react';
export default memo(function SearchInput({ value, onChange, placeholder = 'Rechercher…' }) {
  return (
    <input
      type="search"
      className="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
});
