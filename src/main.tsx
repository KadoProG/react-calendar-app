import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import { MyRouter } from './routes/Router.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MyRouter />
  </React.StrictMode>
);
