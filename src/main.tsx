import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import { MyRouter } from './routes/Router.tsx';
import { CalendarConfigFormDialogContextProvider } from '@/contexts/CalendarConfigFormDialogContext.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CalendarConfigFormDialogContextProvider>
      <MyRouter />
    </CalendarConfigFormDialogContextProvider>
  </React.StrictMode>
);
