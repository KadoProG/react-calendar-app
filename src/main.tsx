import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.scss';
import { MyRouter } from '@/routes/Router.tsx';
import { CalendarConfigFormDialogContextProvider } from '@/contexts/CalendarConfigFormDialogContext.tsx';
import { KeyDownContextProvider } from '@/contexts/KeyDownContext.tsx';
import { CalendarEventProvider } from '@/contexts/CalendarEventContext.tsx';
import { CalendarConfigProvider } from '@/contexts/CalendarConfigContext.tsx';
import { AuthContextProvider } from '@/contexts/AuthContext.tsx';
import { SnackbarProvider } from '@/components/common/feedback/SnackbarContext.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SnackbarProvider>
      <AuthContextProvider>
        <CalendarConfigProvider>
          <KeyDownContextProvider>
            <CalendarEventProvider>
              <CalendarConfigFormDialogContextProvider>
                <MyRouter />
              </CalendarConfigFormDialogContextProvider>
            </CalendarEventProvider>
          </KeyDownContextProvider>
        </CalendarConfigProvider>
      </AuthContextProvider>
    </SnackbarProvider>
  </React.StrictMode>
);
