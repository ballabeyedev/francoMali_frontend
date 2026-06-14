import api, { setStoredUser, getStoredUser, clearStoredUser, setCsrfToken, clearCsrfToken } from './api';

/* ========================= LOGIN ========================= */
/**
 * Connexion. Le backend dépose les tokens en cookies httpOnly et renvoie
 * uniquement l'utilisateur + un token CSRF. Aucun token n'est stocké en JS.
 * @param {{ email: string, mot_de_passe: string }} credentials
 * @returns {Promise<object>} utilisateur
 */
export const login = async ({ email, mot_de_passe }) => {
  try {
    const response = await api.post('/auth/login', {
      identifiant: email,
      mot_de_passe,
    });
    const { utilisateur, csrfToken } = response.data;
    if (csrfToken) setCsrfToken(csrfToken);
    setStoredUser(utilisateur);
    return utilisateur;
  } catch (error) {
    const message = handleApiError(error);
    throw new Error(message);
  }
};

/* ========================= LOGOUT ========================= */

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // nettoyage côté client quoi qu'il arrive
  }
  clearStoredUser();
  clearCsrfToken();
};

/* ========================= GET USER ========================= */

export const getUser = () => getStoredUser();

/* ========================= ERROR HANDLER ========================= */

export const handleApiError = (error) => {
  if (error.response) {
    const msg = error.response.data?.message;
    switch (error.response.status) {
      case 400: return msg || 'Requête invalide';
      case 401: return msg || 'Email ou mot de passe incorrect';
      case 403: return msg || 'Accès refusé';
      case 404: return 'Service introuvable';
      case 429: return msg || 'Trop de tentatives. Réessayez plus tard.';
      case 500: return 'Erreur interne du serveur';
      default: return msg || 'Erreur serveur';
    }
  }
  if (error.request) {
    return 'Serveur injoignable. Vérifiez votre connexion ou réessayez dans quelques secondes.';
  }
  return 'Erreur inconnue';
};

/* ========================= FORM VALIDATION ========================= */

export const validateEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

export const validateLoginForm = (email, password) => {
  const errors = {};
  if (!email.trim()) {
    errors.email = "L'email est requis";
  } else if (!validateEmail(email)) {
    errors.email = 'Email invalide';
  }
  if (!password) {
    errors.password = 'Le mot de passe est requis';
  } else if (password.length < 6) {
    errors.password = 'Minimum 6 caractères';
  }
  return errors;
};

/* ========================= PASSWORD RESET ========================= */

export const passwordOublie = async (email) => {
  try {
    const res = await api.post('/auth/oublier-password', { email });
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const res = await api.post(`/auth/reset-password/${token}`, {
      mot_de_passe: newPassword,
    });
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
