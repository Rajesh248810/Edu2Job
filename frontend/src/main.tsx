import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext'
import { ThemeContextProvider } from './theme/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';

import ErrorBoundary from './Components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <GoogleOAuthProvider clientId="463529438142-dpm6nrfs3ep90vnaigvev5cglnfpevtu.apps.googleusercontent.com">
          <AuthProvider>
            <ThemeContextProvider>
              <App />
            </ThemeContextProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
