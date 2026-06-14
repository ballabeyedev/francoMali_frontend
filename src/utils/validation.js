import DOMPurify from 'dompurify';
import validator from 'validator';

/**
 * Utilitaires de validation et de nettoyage des entrées côté client.
 *
 * sanitizeInput() neutralise tout HTML/JS injecté (protection XSS) en
 * s'appuyant sur DOMPurify. Les autres helpers valident des formats métier.
 */

/**
 * Nettoie une chaîne : supprime toute balise/script et trim.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (input === null || input === undefined) return '';
  const str = String(input);
  // ALLOWED_TAGS: [] => on supprime tout balisage HTML
  const clean = DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return clean.trim();
}

/**
 * Valide une adresse email.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email) return false;
  return validator.isEmail(String(email).trim());
}

/**
 * Valide un nom de pays : lettres (accents), espaces, tirets et apostrophes,
 * 2 à 60 caractères. Rejette les caractères spéciaux et le HTML.
 * @param {string} name
 * @returns {boolean}
 */
export function validateCountryName(name) {
  if (!name) return false;
  const clean = sanitizeInput(name);
  if (clean.length < 2 || clean.length > 60) return false;
  return /^[\p{L}][\p{L}\s'-]*$/u.test(clean);
}

/**
 * Valide un prix : nombre fini, positif, max 2 décimales.
 * @param {string|number} price
 * @returns {boolean}
 */
export function validatePrice(price) {
  if (price === '' || price === null || price === undefined) return false;
  const str = String(price).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(str)) return false;
  const num = Number(str);
  return Number.isFinite(num) && num >= 0;
}

export default { sanitizeInput, validateEmail, validateCountryName, validatePrice };
