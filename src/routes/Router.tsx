import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { CalendarPage } from '../pages/CalendarPage';
import { APIPage } from '@/pages/APIPage';

export const MyRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/api" element={<APIPage />} />
    </Routes>
  </BrowserRouter>
);
