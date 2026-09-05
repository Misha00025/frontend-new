# The Dungeon Notebook — Frontend

SPA-фронтенд для The Dungeon Notebook (управление настольными ролевыми играми: группы, персонажи, предметы, навыки, заметки, квесты).

## Стек

- **React 19** + **TypeScript 4.9** (strict)
- **Vite 5** (`@vitejs/plugin-react`) — сборка и dev-сервер
- **react-router-dom 7** (BrowserRouter, вложенные маршруты)
- **react-markdown 10** + **@uiw/react-md-editor 4** — рендер/редактирование markdown
- **CSS Modules** (`.module.css`) + глобальные стили в `src/styles/`
- Тесты: **Vitest + React Testing Library**, файлы `<name>.test.ts(x)` рядом с модулем

## Доступные скрипты

```bash
npm install        # установка зависимостей
npm start          # dev-сервер (Vite), http://localhost:3000, hot reload
npm run build      # tsc + продакшен-сборка в build/
npm run preview    # предпросмотр продакшен-сборки
npm test           # Vitest (watch)
npm run test:run   # Vitest (single run)
```

## Конфигурация API

- Базовый URL API читается из `/config.json` (файл `src/config/index.ts` → `getApiBase()`).
- `loadConfig()` вызывается в `src/index.tsx` до рендера; при ошибке фолбэк `http://localhost:5000`.
- В dev-режиме `config.json` отсутствует → используется фолбэк. В Docker `docker-entrypoint.sh` генерирует `config.json` из env `API_BASE`.

## Docker

- **Dockerfile**: multi-stage — builder (node:20, `npm ci`, `npm run build`) → runtime (node:lts-alpine, `serve -s build -l 3000`). ENTRYPOINT `docker-entrypoint.sh`, CMD `serve`.
- **docker-entrypoint.sh**: если нет `/app/build/config.json`, генерирует его из env `API_BASE` (по умолчанию `http://localhost:5000`).
- **docker-compose.yaml**: сервис `frontend`, порт `3000:3000`, `container_name: frontend-v2`, `env_file: .env`.
- **template.env**: `API_BASE=http://localhost:5000/`.
