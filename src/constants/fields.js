// Champs API normalisés (évite les magic strings)
export const COLIS_FIELDS = {
  id: ['id', '_id'],
  reference: ['reference', 'ref'],
  expediteur: ['nomExpediteur', 'expediteur', 'sender'],
  destinataire: ['nomDestinataire', 'destinataire', 'receiver'],
  pays: ['paysDestination', 'pays', 'country'],
  statut: ['statut', 'status'],
  type: ['type', 'typeEnvoi'],
  date: ['createdAt', 'dateCreation', 'date'],
};

export const pick = (obj, keys) => {
  if (!obj) return undefined;
  for (const k of keys) { if (obj[k] !== undefined) return obj[k]; }
  return undefined;
};
