import { memo } from 'react';

const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: 'Très faible', color: '#ef4444' },
    { label: 'Faible',      color: '#f97316' },
    { label: 'Moyen',       color: '#eab308' },
    { label: 'Fort',        color: '#22c55e' },
    { label: 'Très fort',   color: '#16a34a' },
  ];
  return { score, ...map[score] };
};

const pwdCheck = (pwd, re) => re.test(pwd ?? '');

const PasswordStrength = memo(({ password }) => {
  if (!password) return null;
  const { score, label, color } = getStrength(password);
  return (
    <div className="pwd-strength" aria-label={`Force du mot de passe : ${label}`}>
      <div className="pwd-strength-bar">
        {[0,1,2,3].map((i) => (
          <div key={i} className="pwd-strength-segment" style={{ background: i < score ? color : 'var(--color-border, #e2e8f0)' }} />
        ))}
      </div>
      <span className="pwd-strength-label" style={{ color }}>{label}</span>
      <ul className="pwd-rules">
        <li className={pwdCheck(password, /.{8,}/) ? 'ok' : ''}>8 caractères minimum</li>
        <li className={pwdCheck(password, /[A-Z]/) ? 'ok' : ''}>1 majuscule</li>
        <li className={pwdCheck(password, /[0-9]/) ? 'ok' : ''}>1 chiffre</li>
        <li className={pwdCheck(password, /[^A-Za-z0-9]/) ? 'ok' : ''}>1 caractère spécial</li>
      </ul>
    </div>
  );
});
PasswordStrength.displayName = 'PasswordStrength';
export default PasswordStrength;
