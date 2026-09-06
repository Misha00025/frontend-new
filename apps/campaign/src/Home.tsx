// src/Home.tsx
// Модуль «Главная» — подгружается хабом на общей вкладке «Главная».
// Хаб не тянет домен кампании: он монтирует только этот готовый модуль
// (campaign/Home), а не всё приложение.
//
// Модуль самодостаточен: предоставляет нужные доменные провайдеры
// (VisitedProvider для Dashboard). Роутер и сессия — от хаба.

import React from 'react';
import Dashboard from './pages/Dashboard';
import { VisitedProvider } from './contexts/VisitedContext';

const Home: React.FC = () => {
  return (
    <VisitedProvider>
      <Dashboard />
    </VisitedProvider>
  );
};

export default Home;
