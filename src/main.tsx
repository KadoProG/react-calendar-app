import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.scss';
import { MyRouter } from '@/routes/Router.tsx';
import { KeyDownContextProvider } from '@/contexts/KeyDownContext.tsx';
import { AuthContextProvider } from '@/contexts/AuthContext.tsx';
import { SnackbarProvider } from '@/components/common/feedback/SnackbarContext.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SnackbarProvider>
      <AuthContextProvider>
        <KeyDownContextProvider>
          <MyRouter />
        </KeyDownContextProvider>
      </AuthContextProvider>
    </SnackbarProvider>
  </React.StrictMode>
);
