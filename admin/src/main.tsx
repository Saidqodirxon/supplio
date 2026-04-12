import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import App from './App.tsx';
import './index.css';
import { initTheme } from './store/themeStore';

initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" expand={true} richColors closeButton />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
