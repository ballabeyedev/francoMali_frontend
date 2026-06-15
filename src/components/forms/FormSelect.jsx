import { memo } from 'react';
export default memo(function FormSelect({ label, name, value, onChange, options = [], error, required, placeholder }) {
  return (
    <div className="form-field">
      {label && <label className="form-label" htmlFor={name}>{label}{required && <span style={{ color: 'var(--color-danger)' }}> *</span>}</label>}
      <select id={name} name={name} className={`form-input${error ? ' input-error' : ''}`} value={value} onChange={onChange} required={required}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
});
