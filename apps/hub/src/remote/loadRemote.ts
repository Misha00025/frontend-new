// Механизм подгрузки remote-модулей (Module Federation).
//
// Хаб — host. Remote-модули подгружаются динамическим импортом
// `import('remoteName/Module')`, который vite-plugin-federation транслирует
// в __federation_method_getRemote. Здесь — тонкая обёртка: кэширование
// загруженных модулей и типизированный доступ к контракту RemoteModule.

import type { RemoteModule, RemoteDescriptor } from './types';

// Кэш загруженных remote-модулей (по ключу `${name}/${module}`).
const moduleCache = new Map<string, RemoteModule>();

/**
 * Загружает remote-модуль по имени remote и имени модуля.
 * Кэширует результат, чтобы не грузить один модуль дважды.
 */
export async function loadRemoteModule(
  name: RemoteDescriptor['name'],
  module: string
): Promise<RemoteModule> {
  const key = `${name}/${module}`;
  const cached = moduleCache.get(key);
  if (cached) return cached;

  // Динамический импорт remote-модуля. Тип объявлен в remote-modules.d.ts.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mod = (await import(/* @vite-ignore */ `${name}/${module}`)) as RemoteModule;
  moduleCache.set(key, mod);
  return mod;
}
