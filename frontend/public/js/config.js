/**
 * Frontend Configuration
 */

export const config = {
  // API base URL - empty string means same origin
  API_BASE_URL: '',

  // Sections configuration
  sections: {
    users: 'Utilisateurs',
    nodes: 'Noeuds',
    apikeys: 'API Keys',
    preauth: 'Preauth Keys',
    routes: 'Routes',
    policy: 'Policy',
    info: 'Infos',
    settings: 'Paramètres',
  },

  // Default section
  defaultSection: 'users',

  // LocalStorage keys
  storage: {
    columnOrder: 'hs_column_order_',
    currentSection: 'hs_current_section',
  },
};
