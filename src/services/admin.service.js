import api from "./api";

/* ========================= LOG HELPERS ========================= */

/* Logs neutralisés : aucune donnée sensible (réponses, tokens) n'est exposée en console. */
const logRequest = () => {};
const logResponse = () => {};
const logError = () => {};

/* ========================= UTILISATEURS ========================= */

export const getUtilisateurs = async () => {
  const name = "Liste utilisateurs";
  try {
    logRequest(name);

    const res = await api.get("/admin/liste-utilisateurs");

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const activerUtilisateur = async (id) => {
  const name = "Activer utilisateur";
  try {
    logRequest(name, { id });

    const res = await api.patch(`/admin/activer-utilisateurs/${id}`);

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const desactiverUtilisateur = async (id) => {
  const name = "Désactiver utilisateur";
  try {
    logRequest(name, { id });

    const res = await api.patch(`/admin/desactiver-utilisateurs/${id}`);

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getNombreUtilisateurs = async () => {
  const name = "Nombre utilisateurs";
  try {
    logRequest(name);

    const res = await api.get("/admin/nombre-utilisateurs");

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

/* ========================= COLIS ========================= */

export const getListeColis = async () => {
  const name = "Liste de tous les colis";
  try {
    logRequest(name);
    const res = await api.get("/admin/liste-colis");
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getNombreColis = async () => {
  const name = "Nombre total colis";
  try {
    logRequest(name);
    const res = await api.get("/admin/nombre-colis");
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getColisEnAttente = async () => {
  const name = "Colis en attente";
  try {
    logRequest(name);
    const res = await api.get("/admin/colis-en-attente");
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getNombreColisEnAttente = async () => {
  const name = "Nombre colis en attente";
  try {
    logRequest(name);
    const res = await api.get("/admin/nombre-colis-en-attente");
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getColisLivres = async () => {
  const name = "Colis livrés";
  try {
    logRequest(name);
    const res = await api.get("/admin/colis-livres");
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getNombreColisLivres = async () => {
  const name = "Nombre colis livrés";
  try {
    logRequest(name);
    const res = await api.get("/admin/nombre-colis-livres");
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getColisRecuperes = async () => {
  const name = "Colis récupérés";
  try {
    logRequest(name);
    const res = await api.get("/admin/colis-recuperes");
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getNombreColisRecuperes = async () => {
  const name = "Nombre colis récupérés";
  try {
    logRequest(name);
    const res = await api.get("/admin/nombre-colis-recuperes");
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const rechercherColis = async (reference) => {
  const name = "Rechercher colis";
  try {
    logRequest(name, { reference });
    const res = await api.get(`/admin/colis-recherche/${reference}`);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const changerStatutEnAttente = async (id) => {
  const name = "Changer statut en attente";
  try {
    logRequest(name, { id });
    const res = await api.put(`/admin/changer-statut-en-attente/${id}`);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const changerStatutLivre = async (id) => {
  const name = "Changer statut livré";
  try {
    logRequest(name, { id });
    const res = await api.put(`/admin/changer-statut-livre/${id}`);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const changerStatutRecupere = async (id) => {
  const name = "Changer statut récupéré";
  try {
    logRequest(name, { id });
    const res = await api.put(`/admin/changer-statut-recupere/${id}`);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

/* ========================= MODIFIER PROFIL ADMIN ========================= */

export const modifierPassword = async (id, ancienPassword, nouveauPassword) => {
  const name = "Modifier mot de passe admin";

  try {
    logRequest(name, { id, ancienPassword: "***", nouveauPassword: "***" });

    const res = await api.put(`/auth/modifier-password/${id}`, {
      ancienPassword,
      nouveauPassword
    });

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const modifierInfo = async (id, data) => {
  const name = "Modifier informations admin";

  try {
    logRequest(name, { id, data });

    const res = await api.put(`/auth/modifier-profil/${id}`, data);

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const oublierPassword = async (email) => {
  const name = "Oublier mot de passe";

  try {
    logRequest(name, { email });

    const res = await api.post("/auth/oublier-password", { email });

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const resetPassword = async (token, password) => {
  const name = "Reset mot de passe";

  try {
    logRequest(name, { token, password: "***" });

    const res = await api.post(`/auth/reset-password/${token}`, {
      password
    });

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

/* ========================= GESTION DES ADMINS ========================= */

export const getAdmins = async () => {
  const name = "Liste des administrateurs";
  try {
    logRequest(name);
    const res = await api.get("/admin/liste-admins");
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const ajouterAdmin = async (data) => {
  const name = "Ajouter un administrateur";
  try {
    logRequest(name, { ...data, mot_de_passe: "***" });
    const res = await api.post("/admin/ajouter-admin", data);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const activerAdmin = async (id) => {
  const name = "Activer un administrateur";
  try {
    logRequest(name, { id });
    const res = await api.put(`/admin/activer-admin/${id}`);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const desactiverAdmin = async (id) => {
  const name = "Désactiver un administrateur";
  try {
    logRequest(name, { id });
    const res = await api.put(`/admin/desactiver-admin/${id}`);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getNombreAdmins = async () => {
  const name = "Nombre d'admins";
  try {
    logRequest(name);
    const res = await api.get("/admin/nombre-admins");
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const rechercherAdmin = async (params) => {
  const name = "Rechercher admin";
  try {
    logRequest(name, params);
    const res = await api.get("/admin/rechercher-admin", { params });
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const rechercherUtilisateur = async (params) => {
  const name = "Rechercher utilisateur";
  try {
    logRequest(name, params);
    const res = await api.get("/admin/rechercher-utilisateur", { params });
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};
