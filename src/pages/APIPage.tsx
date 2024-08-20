import { ApiTest } from '@/components/domains/apitest/ApiTest';
import { CalendarContextProvider } from '@/contexts/CalendarContext';
import React from 'react';

export const APIPage: React.FC = () => (
  <CalendarContextProvider>
    <ApiTest />
  </CalendarContextProvider>
);
