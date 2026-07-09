import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import keycloak from './config/keycloak';
import { useAuthStore } from './store/authStore';
import './index.css';

const container = document.getElementById('root');

function renderApp() {
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

function renderError(message) {
  container.innerHTML = `<div style="color: #E15B5B; padding: 2rem; font-family: sans-serif;">${message}</div>`;
}

// onLoad: 'check-sso' (instead of 'login-required') lets the SPA render
// immediately for visitors who aren't signed in yet — that's what makes a
// public landing page possible. Anyone with an existing Keycloak session is
// picked up silently via the iframe below, no visible redirect. Routes that
// actually need a session are still gated — see routes/RequireAuth.jsx.
keycloak
  .init({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
  })
  .then((authenticated) => {
    if (authenticated) {
      useAuthStore.getState().setAuth(keycloak.tokenParsed);
    }
    useAuthStore.getState().setInitialized(true);

    // Keep the store's role/user info fresh across silent token refreshes,
    // and clear it if the session ends (e.g. token expiry with no refresh).
    keycloak.onAuthRefreshSuccess = () => {
      useAuthStore.getState().setAuth(keycloak.tokenParsed);
    };
    keycloak.onAuthLogout = () => {
      useAuthStore.getState().clearAuth();
    };

    renderApp();
  })
  .catch(() => {
    renderError('Could not reach the identity provider. Is Keycloak running?');
  });
