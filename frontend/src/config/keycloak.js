import Keycloak from 'keycloak-js';

// A single shared Keycloak instance for the whole app. keycloak-js handles
// PKCE, silent token refresh, and logout redirects internally — we should
// never need to touch localStorage/sessionStorage for the token ourselves.
const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

export default keycloak;
