# The Dungeon Notebook — Frontend (монорепо)

SPA-фронтенд для The Dungeon Notebook (управление настольными ролевыми играми: группы, персонажи, предметы, навыки, заметки, квесты).

## Структура монорепо

```
tdn-frontend/
├── package.json                 # npm workspaces: ["apps/*", "packages/*"]
├── tsconfig.base.json           # общие compilerOptions
├── packages/
│   └── shared/                  # @tdn/shared — общий код (auth, theme, ui, utils, config)
├── apps/
│   ├── campaign/                # @tdn/campaign — группы, персонажи, игра
│   └── game-systems/            # @tdn/game-systems — системы, контент, версии, правила
└── README.md
```

- **npm workspaces** — единый `node_modules` в корне, общие зависимости.
- **`@tdn/shared`** подключается через алиас `@tdn/shared` в `vite.config.ts` на исходники `packages/shared/src` (без отдельной сборки пакета; HMR работает).
- **`tsconfig.base.json`** — общие настройки; каждый app/package расширяет его через `extends`.

## Стек

- **React 19** + **TypeScript** (strict)
- **Vite 5** (`@vitejs/plugin-react`) — сборка и dev-сервер
- **react-router-dom 7** (BrowserRouter, вложенные маршруты)
- **react-markdown 10** + **@uiw/react-md-editor 4** — рендер/редактирование markdown
- **CSS Modules** (`.module.css`) + глобальные стили
- Тесты: **Vitest + React Testing Library**

## Доступные скрипты (корень)

```bash
npm install        # установка зависимостей (все workspaces)
npm start          # dev-сервер (Vite), http://localhost:3000, hot reload
npm run build      # tsc + продакшен-сборка в build/
npm run preview    # предпросмотр продакшен-сборки
npm test           # Vitest (watch)
npm run test:run   # Vitest (single run)
```

Скрипты конкретного приложения запускаются из его каталога (`cd apps/campaign && npm run dev`) или через `npm run <script> --workspace @tdn/campaign`.

## Конфигурация API

- Базовый URL API читается из `/config.json` (файл `src/config/index.ts` → `getApiBase()`).
- `loadConfig()` вызывается до рендера; при ошибке фолбэк `http://localhost:5000`.
- В dev-режиме `config.json` отсутствует → используется фолбэк. В Docker `docker-entrypoint.sh` генерирует `config.json` из env `API_BASE`.

## Docker

- **Dockerfile**: multi-stage — builder (node:20, `npm ci`, `npm run build`) → runtime (node:lts-alpine, `serve -s build -l 3000`). ENTRYPOINT `docker-entrypoint.sh`, CMD `serve`.
- **docker-entrypoint.sh**: если нет `/app/build/config.json`, генерирует его из env `API_BASE` (по умолчанию `http://localhost:5000`).
- **docker-compose.yaml**: сервис `frontend`, порт `3000:3000`, `container_name: frontend-v2`, `env_file: .env`.
- **template.env**: `API_BASE=http://localhost:5000/`.

> Примечание: доменный код (группы, персонажи, игра) перенесён в `apps/campaign` (подзадача 3.3). Корневой монолит `src/` удалён; корневые `Dockerfile`/`docker-compose.yaml`/`index.html`/`vite.config.ts` переехали в `apps/campaign`. Сборка/тесты запускаются из `apps/campaign` (или через корневые npm-скрипты, делегирующие в `@tdn/campaign`).
