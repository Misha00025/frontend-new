// Типы контракта remote-модулей, которые монтирует хаб.
// Каждый remote экспонирует React-компонент (default export) и опционально
// функцию-пропс `session` (см. session.ts). Хаб знает только этот контракт,
// не детали доменов.

import type { ComponentType } from 'react';
import type { HubSession } from '../session';

export interface RemoteModule {
  default: ComponentType<Record<string, unknown>>;
}

export type RemoteName = 'campaign' | 'game-systems' | 'profile' | 'login';

export interface RemoteDescriptor {
  /** Имя remote (совпадает с ключом в remotes vite.config). */
  name: RemoteName;
  /** Имя экспонируемого модуля внутри remote (без префикса remote). */
  module: string;
  /** Сессия, прокидываемая хабом в remote (см. session.ts). */
  session?: HubSession;
}
