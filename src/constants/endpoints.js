export const ENDPOINTS = {
  AUTH: {
    LOGIN:                 '/auth/connexion',
    LOGOUT:                '/auth/deconnexion',
    ME:                    '/auth/me',
    CHANGER_MOT_DE_PASSE:  '/auth/changer-mot-de-passe',
  },
  RBAC: {
    ADMINS:            '/admin/rbac/admins',
    ADMIN_BY_ID:       (id) => `/admin/rbac/admins/${id}`,
    ADMIN_PERMISSIONS: (id) => `/admin/rbac/admins/${id}/permissions`,
    MENUS:             '/admin/rbac/menus',
    MENU_BY_ID:        (id) => `/admin/rbac/menus/${id}`,
  },
  UTILISATEURS: {
    LISTE:     '/admin/liste-utilisateurs',
    NOMBRE:    '/admin/nombre-utilisateurs',
    RECHERCHE: '/admin/rechercher-utilisateur',
    ACTIVER:   (id) => `/admin/activer-utilisateurs/${id}`,
    DESACTIVER:(id) => `/admin/desactiver-utilisateurs/${id}`,
  },
  ADMINS: {
    LISTE:     '/admin/liste-admins',
    NOMBRE:    '/admin/nombre-admins',
    RECHERCHE: '/admin/rechercher-admin',
    AJOUTER:   '/admin/ajouter-admin',
    ACTIVER:   (id) => `/admin/activer-admin/${id}`,
    DESACTIVER:(id) => `/admin/desactiver-admin/${id}`,
  },
  COLIS: {
    LISTE:              '/admin/liste-colis',
    NOMBRE:             '/admin/nombre-colis',
    EN_ATTENTE:         '/admin/colis-en-attente',
    NOMBRE_EN_ATTENTE:  '/admin/nombre-colis-en-attente',
    LIVRES:             '/admin/colis-livres',
    NOMBRE_LIVRES:      '/admin/nombre-colis-livres',
    RECUPERES:          '/admin/colis-recuperes',
    NOMBRE_RECUPERES:   '/admin/nombre-colis-recuperes',
    RECHERCHE:          (ref) => `/admin/colis-recherche/${ref}`,
    EN_ATTENTE_STATUT:  (id) => `/admin/changer-statut-en-attente/${id}`,
    LIVRE_STATUT:       (id) => `/admin/changer-statut-livre/${id}`,
    RECUPERE_STATUT:    (id) => `/admin/changer-statut-recupere/${id}`,
  },
  COUNTRIES: {
    LISTE:     '/admin/countries',
    BY_ID:     (id) => `/admin/countries/${id}`,
  },
  SHIPPING_PRICES: {
    LISTE:     '/admin/shipping-prices',
    BY_ID:     (id) => `/admin/shipping-prices/${id}`,
  },
  SERVICE_PRICES: {
    LISTE:     '/admin/service-prices',
    BY_ID:     (id) => `/admin/service-prices/${id}`,
  },
  PRICING: {
    CALCULATE: '/pricing/calculate',
  },
};
