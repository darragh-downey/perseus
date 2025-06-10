import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize Tauri logging if available
if (window.__TAURI__) {
  import('@tauri-apps/plugin-log').then(({ info }) => {
    info('Ulysses Writing Assistant started in Tauri environment');
  }).catch(() => {
    // Log plugin not available
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
