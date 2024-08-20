import { ApiTest } from '@/components/domains/apitest/ApiTest';
import { AuthContextProvider } from '@/contexts/AuthContext';
import { CalendarContextProvider } from '@/contexts/CalendarContext';
import React from 'react';

export const APIPage: React.FC = () => (
  <AuthContextProvider>
    <CalendarContextProvider>
      <ApiTest />
    </CalendarContextProvider>
  </AuthContextProvider>
);
