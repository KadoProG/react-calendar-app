import { ApiTest } from '@/components/domains/apitest/ApiTest';
import { CalendarContextProvider } from '@/contexts/CalendarContext';
import { CalendarFeatLocalStorageProvider } from '@/contexts/CalendarFeatLocalStorageContext';
import React from 'react';

export const APIPage: React.FC = () => (
  <CalendarFeatLocalStorageProvider>
    <CalendarContextProvider>
      <ApiTest />
    </CalendarContextProvider>
  </CalendarFeatLocalStorageProvider>
);
