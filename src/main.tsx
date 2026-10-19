import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error hook for Google Maps Platform quota handling
(window as unknown as { gm_authFailure: () => void }).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};
const origError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args.map((a) => String(a)).join(' ');
  if (
    msg.includes('OverQuotaMapError') ||
    msg.includes('QuotaExceededError') ||
    msg.includes('exceeded your daily request quota') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('Directions Service')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    // Suppress redundant console error spam for handled quota limit
    return;
  }
  origError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

