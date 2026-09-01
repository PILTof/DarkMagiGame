 Cursor Agent
  v2026.08.31-4057e58
  Tip: Use /plan to iterate on an implementation plan before code changes.

                                                                                                                      
  Я хочу создать изометрическую игру на three js, укажи порядок установки и нужные дополнительные библиотеки          
                                                                                                                      

  Проверю структуру проекта, чтобы дать рекомендации по установке под ваш случай.

    Globbed 2 globs
    Globbed "**/*" in .
    Globbed "package.json" in .

  Проект у вас пока пустой, поэтому ниже — практичный порядок установки и набор библиотек для изометрической игры
  на Three.js.

  Порядок установки

  1. Базовое окружение

  1. Установите Node.js LTS (20+): https://nodejs.org  
  2. Проверьте:

  node -v
  npm -v

  2. Создание проекта (рекомендуется Vite)

  npm create vite@latest darkMagi -- --template vanilla
  cd darkMagi
  npm install

  Для TypeScript (удобнее для игры):

  npm create vite@latest darkMagi -- --template vanilla-ts
  cd darkMagi
  npm install

  3. Установка Three.js

  npm install three

  Если TypeScript:

  npm install -D @types/three

  4. Запуск dev-сервера

  npm run dev

  5. Дополнительные библиотеки (по мере необходимости)

  # Отладка и UI
  npm install lil-gui
  npm install stats.js
  # Физика (если нужны столкновения, падение объектов)
  npm install cannon-es
  # Поиск пути по сетке (для юнитов/врагов)
  npm install three-pathfinding
  # Звук
  npm install howler

  ────────────────────────────────────────

  Что реально нужно для изометрии

  ┌───────────────────┬─────────────────────────────────────────────┬───────────────────┐
  │ Библиотека        │ Зачем                                       │ Обязательно?      │
  ├───────────────────┼─────────────────────────────────────────────┼───────────────────┤
  │ three             │ Рендер, сцена, камера, модели               │ Да                │
  ├───────────────────┼─────────────────────────────────────────────┼───────────────────┤
  │ vite              │ Сборка, hot reload                          │ Да (или аналог)   │
  ├───────────────────┼─────────────────────────────────────────────┼───────────────────┤
  │ lil-gui           │ Быстрая настройка камеры, света, параметров │ Очень желательно  │
  ├───────────────────┼─────────────────────────────────────────────┼───────────────────┤
  │ stats.js          │ FPS, производительность                     │ Желательно        │
  ├───────────────────┼─────────────────────────────────────────────┼───────────────────┤
  │ cannon-es         │ Физика                                      │ Только если нужна │
  ├───────────────────┼─────────────────────────────────────────────┼───────────────────┤
  │ three-pathfinding │ Движение по тайлам                          │ Для RTS/RPG       │
  ├───────────────────┼─────────────────────────────────────────────┼───────────────────┤
  │ howler            │ Звуки и музыка                              │ По желанию        │
  └───────────────────┴─────────────────────────────────────────────┴───────────────────┘

  Для изометрии отдельная библиотека обычно не нужна — достаточно OrthographicCamera и поворота сцены/камеры.

  ────────────────────────────────────────

  Минимальная структура проекта

  darkMagi/
  ├── index.html
  ├── package.json
  ├── vite.config.js
  └── src/
      ├── main.js          # точка входа
      ├── scene/
      │   ├── createScene.js
      │   ├── createCamera.js   # OrthographicCamera
      │   └── createLights.js
      ├── game/
      │   ├── grid.js           # тайловая сетка
      │   ├── player.js
      │   └── input.js          # клики, WASD
      └── utils/
          └── iso.js            # world <-> screen координаты

  ────────────────────────────────────────

  Ключевые настройки изометрии

  import * as THREE from 'three';
  // Ортографическая камера — без перспективного искажения
  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 20;
  const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
  );
  // Классический изометрический угол
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  Для тайловой карты удобно хранить мир в 2D-сетке (x, y) и переводить в 3D:

  function gridToWorld(x, y) {
    return new THREE.Vector3(x, 0, y);
  }

  ────────────────────────────────────────

  Если планируете React

  npm create vite@latest darkMagi -- --template react-ts
  npm install three @react-three/fiber @react-three/drei

  • @react-three/fiber — React-обёртка над Three.js
  • @react-three/drei — готовые хелперы (камера, контролы, загрузка моделей)

  Для простой игры vanilla + Three.js обычно проще и быстрее.

  ────────────────────────────────────────

  Рекомендуемый порядок разработки

  1. Сцена + ортографическая камера + свет
  2. Тайловая сетка (плоскость или BoxGeometry)
  3. Управление камерой (pan/zoom)
  4. Клик по тайлу → выбор/движение
  5. Персонажи и анимации (GLTFLoader)
  6. Физика, pathfinding, звук — по необходимости

  ────────────────────────────────────────

  Полная команда «с нуля»

  npm create vite@latest darkMagi -- --template vanilla-ts
  cd darkMagi
  npm install
  npm install three
  npm install -D @types/three
  npm install lil-gui stats.js
  npm run dev

  Могу сразу развернуть этот каркас в E:\work\darkMagi: сцена, изометрическая камера, сетка тайлов и базовое
  управление. Напишите, если нужно.