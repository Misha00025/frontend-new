// src/session/SessionProvider.tsx
// Сессия кампании.
//
// В режиме хаба сессию оркеструет хаб и прокидывает её в remote-модули
// через пропс `session` (см. session.ts). Здесь — провайдер, который отдаёт
// эту сессию вниз по дереву.
//
// При автономном запуске (без хаба, session не передан) — fallback: грузим
// сессию из хранилища (tokenManager.ensureToken + localStorage userId).

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import tokenManager from '@tdn/shared/auth/tokenManager';
import type { CampaignSession } from '../session';

const SessionContext = createContext<CampaignSession | null>(null);

export const SessionProvider: React.FC<{
  session?: CampaignSession;
  children: ReactNode;
}> = ({ session, children }) => {
  const [fallback, setFallback] = useState<CampaignSession | null>(null);

  useEffect(() => {
    if (session) return;

    let cancelled = false;
    (async () => {
      const token = await tokenManager.ensureToken();
      if (cancelled) return;
      const userIdRaw = localStorage.getItem('userId');
      setFallback({
        accessToken: token,
        userId: userIdRaw ? parseInt(userIdRaw, 10) : null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const value = session ?? fallback;

  if (!value) {
    // Ждём fallback (автономный запуск) — сессия ещё не загружена.
    return null;
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useCampaignSession = (): CampaignSession => {
  const context = useContext(SessionContext);
  if (context === null) {
    throw new Error('useCampaignSession must be used within a SessionProvider');
  }
  return context;
};
