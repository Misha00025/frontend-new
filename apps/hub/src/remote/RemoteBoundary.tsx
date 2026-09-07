// RemoteBoundary — каркас монтирования remote-модуля.
//
// Загружает remote-модуль (см. loadRemote.ts), показывает состояние
// загрузки/ошибки и рендерит компонент, прокидывая в него сессию хаба.
// Хаб не знает деталей домена remote — только контракт RemoteModule.

import React, { useEffect, useState } from 'react';
import { loadRemoteModule } from './loadRemote';
import type { RemoteModule, RemoteDescriptor } from './types';

interface RemoteBoundaryProps {
  /** Имя remote (совпадает с ключом в remotes vite.config). */
  name: RemoteDescriptor['name'];
  /** Имя экспонируемого модуля внутри remote. */
  module: string;
  /** Сессия, прокидываемая хабом в remote. */
  session?: RemoteDescriptor['session'];
  /** Дополнительные пропсы, передаваемые в remote-компонент. */
  [key: string]: unknown;
}

const RemoteBoundary: React.FC<RemoteBoundaryProps> = ({
  name,
  module,
  session,
  ...rest
}) => {
  const [mod, setMod] = useState<RemoteModule | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setMod(null);
    setError(null);

    loadRemoteModule(name, module)
      .then((loaded) => {
        if (!cancelled) setMod(loaded);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [name, module]);

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'var(--danger-color, #d93025)' }}>
        Не удалось загрузить модуль «{name}/{module}»: {error}
      </div>
    );
  }

  if (!mod) {
    return <div style={{ padding: '2rem' }}>Загрузка модуля…</div>;
  }

  const RemoteComponent = mod.default;
  return <RemoteComponent session={session} apiBase={session?.apiBase} {...rest} />;
};

export default RemoteBoundary;
