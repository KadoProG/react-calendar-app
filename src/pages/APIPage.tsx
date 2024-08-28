import { ApiTest } from '@/components/domains/apitest/ApiTest';
import { CalendarContextProvider } from '@/contexts/CalendarContext';
import { CalenadarFeatLocalStorageProvider } from '@/contexts/CalendarFeatLocalStorageContext';
import React from 'react';

export const APIPage: React.FC = () => (
  <CalenadarFeatLocalStorageProvider>
    <CalendarContextProvider>
      <ApiTest />
    </CalendarContextProvider>
  </CalenadarFeatLocalStorageProvider>
);
