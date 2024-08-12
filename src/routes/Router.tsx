import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { CalendarPage } from '../pages/CalendarPage';

export const MyRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Add routes here */}
      <Route path="/" element={<HomePage />} />
      <Route path="/calendar" element={<CalendarPage />} />
    </Routes>
  </BrowserRouter>
);
