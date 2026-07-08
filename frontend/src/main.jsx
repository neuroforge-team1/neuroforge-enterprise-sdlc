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

// onLoad: 'login-required' means the SPA never renders an unauthenticated
// state — Keycloak handles the redirect before React mounts at all. There is
// intentionally no in-app Login page.
keycloak
  .init({ onLoad: 'login-required', pkceMethod: 'S256' })
  .then((authenticated) => {
    if (!authenticated) {
      renderError('Authentication failed. Please refresh and try again.');
      return;
    }
    useAuthStore.getState().setAuth(keycloak.tokenParsed);

    // Keep the store's role/user info fresh across silent token refreshes.
    keycloak.onAuthRefreshSuccess = () => {
      useAuthStore.getState().setAuth(keycloak.tokenParsed);
    };

    renderApp();
  })
  .catch(() => {
    renderError('Could not reach the identity provider. Is Keycloak running?');
  });
