import { create } from 'zustand';
import keycloak from '../config/keycloak';

// Holds decoded identity/role info for the current session. The actual
// access token lives inside the keycloak-js instance (in memory), never
// here and never in localStorage — this store is just for UI decisions
// (greeting the user, showing/hiding role-gated nav items, etc).
export const useAuthStore = create((set) => ({
  user: null,       // { id, name, email }
  roles: [],        // e.g. ['ADMIN', 'PROJECT_MANAGER']
  initialized: false,

  setAuth: (tokenParsed) =>
    set({
      user: {
        id: tokenParsed?.sub,
        name: tokenParsed?.name || tokenParsed?.preferred_username,
        email: tokenParsed?.email,
      },
      roles: tokenParsed?.realm_access?.roles || [],
      initialized: true,
    }),

  hasRole: (role) => {
    const { roles } = useAuthStore.getState();
    return roles.includes(role);
  },

  logout: () => keycloak.logout({ redirectUri: window.location.origin }),
}));
