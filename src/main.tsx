import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import { MyRouter } from './routes/Router.tsx';
import { CalendarConfigFormDialogContextProvider } from '@/contexts/CalendarConfigFormDialogContext.tsx';
import { KeyDownContextProvider } from '@/contexts/KeyDownContext.tsx';
import { CalendarEventProvider } from '@/contexts/CalendarEventContext.tsx';
import { CalendarConfigProvider } from '@/contexts/CalendarConfigContext.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CalendarConfigProvider>
      <KeyDownContextProvider>
        <CalendarConfigFormDialogContextProvider>
          <CalendarEventProvider>
            <MyRouter />
          </CalendarEventProvider>
        </CalendarConfigFormDialogContextProvider>
      </KeyDownContextProvider>
    </CalendarConfigProvider>
  </React.StrictMode>
);
