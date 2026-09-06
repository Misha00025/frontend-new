# @tdn/game-systems

Приложение «Игровые системы» — системы, контент-каталоги, версии, правила (новый код).

> Скелет создан в подзадаче 3.4: подключён `@tdn/shared`, есть auth (Login), тема, layout и пустые маршруты. Наполнение — в 3.6+.

## Запуск

```bash
# из корня монорепо (после npm install)
npm run dev --workspace @tdn/game-systems   # dev-сервер на :3001
npm run build --workspace @tdn/game-systems # сборка в build/
```

## Структура

- `src/main.tsx` — bootstrap (loadConfig) + рендер.
- `src/App.tsx` — провайдеры (Auth → Theme → Sidebar → Router) и маршруты.
- `src/layout/AppLayout.tsx` — общий layout (GlobalSidebar + PageLayout).
- `src/pages/` — Login, WorkInProgress (заглушки разделов).
- `src/navigation.ts` — пункты навигации приложения.
- `public/config.json` — API_BASE (генерится docker-entrypoint.sh из `API_BASE`).
