import { create } from 'zustand';
import keycloak from '../config/keycloak';

// Holds decoded identity/role info for the current session. The actual
// access token lives inside the keycloak-js instance (in memory), never
// here and never in localStorage — this store is just for UI decisions
// (greeting the user, showing/hiding role-gated nav items, routing, etc).
export const useAuthStore = create((set) => ({
  user: null,        // { id, name, email }
  roles: [],          // e.g. ['ADMIN', 'PROJECT_MANAGER']
  authenticated: false,
  initialized: false, // true once the initial check-sso pass has resolved

  setAuth: (tokenParsed) =>
    set({
      user: {
        id: tokenParsed?.sub,
        name: tokenParsed?.name || tokenParsed?.preferred_username,
        email: tokenParsed?.email,
      },
      roles: tokenParsed?.realm_access?.roles || [],
      authenticated: true,
    }),

  clearAuth: () => set({ user: null, roles: [], authenticated: false }),

  setInitialized: (initialized) => set({ initialized }),

  hasRole: (role) => {
    const { roles } = useAuthStore.getState();
    return roles.includes(role);
  },

  // Both hand off to Keycloak's hosted, PKCE-secured pages — the same
  // identity provider the rest of the app already trusts. `register()`
  // opens the same screen with the registration tab active.
  login: (redirectPath = '/dashboard') =>
    keycloak.login({ redirectUri: `${window.location.origin}${redirectPath}` }),

  register: (redirectPath = '/dashboard') =>
    keycloak.register({ redirectUri: `${window.location.origin}${redirectPath}` }),

  logout: () => keycloak.logout({ redirectUri: window.location.origin }),
}));
