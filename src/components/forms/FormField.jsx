import { memo } from 'react';
export default memo(function FormField({ label, name, type = 'text', value, onChange, error, required, placeholder, disabled, step, maxLength }) {
  return (
    <div className="form-field">
      {label && <label className="form-label" htmlFor={name}>{label}{required && <span style={{ color: 'var(--color-danger)' }}> *</span>}</label>}
      <input
        id={name} name={name} type={type}
        className={`form-input${error ? ' input-error' : ''}`}
        value={value} onChange={onChange}
        placeholder={placeholder} required={required} disabled={disabled}
        step={step} maxLength={maxLength}
        autoComplete="off"
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
});
