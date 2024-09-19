import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { LoadingWithMessage } from '@/components/common/LoadingWithMessage';
import { CalendarPage } from '@/pages/CalendarPage';

export const MyRouter: React.FC = () => {
  const { status } = React.useContext(AuthContext);

  if (status === 'unverified') {
    return <LoadingWithMessage message="ユーザ認証を実施しています..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
