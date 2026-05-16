import api from "./api";

/* ========================= LOG HELPERS ========================= */

const logRequest = (name, data) => {
  console.log(`🚀 [REQUEST] ${name}`, data || "");
};

const logResponse = (name, res) => {
  console.log(`✅ [RESPONSE] ${name}`, res.data);
};

const logError = (name, error) => {
  console.error(`❌ [ERROR] ${name}`, {
    message: error.message,
    data: error.response?.data,
    status: error.response?.status,
  });
};

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

export const getColisEnvoyes = async () => {
  const name = "Colis envoyés";
  try {
    logRequest(name);

    const res = await api.get("/admin/colis-envoyes");

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getColisAttente = async () => {
  const name = "Colis en attente";
  try {
    logRequest(name);

    const res = await api.get("/admin/colis-attente");

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getNombreColis = async () => {
  const name = "Nombre colis";
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

export const getStatistiquesColis = async () => {
  const name = "Statistiques colis";
  try {
    logRequest(name);

    const res = await api.get("/admin/statistiques-colis");

    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};