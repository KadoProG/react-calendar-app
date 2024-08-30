import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { APIPage } from '@/pages/APIPage';
import { AuthContext } from '@/contexts/AuthContext';
import { LoadingWithMessage } from '@/components/common/LoadingWithMessage';
import { HomePage } from '@/pages/HomePage';
import { CalendarPage } from '@/pages/CalendarPage';

export const MyRouter: React.FC = () => {
  const { status } = React.useContext(AuthContext);

  if (status === 'unverified') {
    return <LoadingWithMessage message="ユーザ認証を実施しています..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/api" element={<APIPage />} />
      </Routes>
    </BrowserRouter>
  );
};
