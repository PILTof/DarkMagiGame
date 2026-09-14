# CastSystem — AoE-скиллы по тайлам

## Цель

Игрок наводит курсор на гекс карты и видит его выделение. После выбора AoE-скилла он указывает целевой гекс. Если гекс разрешён для навыка, игра запускает визуальный эффект и наносит урон всем подходящим юнитам в области действия. Урон каждого юнита зависит от модификатора баунда, попавшего в область.

Документ описывает целевую архитектуру. Реализация доступности тайлов при создании карты намеренно вынесена в отдельный будущий этап.

---

## Что уже есть

- `src/systems/InputSystem.ts` умеет raycast-ом определить попадание в объект тайла (`userData.type === "tile"`), но сейчас обрабатывает только `pointerdown` правой кнопки и публикует `player:move-to`.
- `src/world/tiles/Tile.ts` записывает в корень визуального объекта тайла `userData.q`, `userData.r`, `userData.type` и `userData.tileType`.
- `src/world/TileMap.ts` предоставляет `getTile(q, r)`, `worldToGrid(...)` и `gridToWorldPosition(...)`.
- `src/systems/BoundsSystem.ts` создаёт баунды юнита, кладёт в `userData.modifiers` модификатор `armor`; он уменьшает урон точечной атаки и AoE.
- `src/entities/Unit.ts` имеет `takeDamage(amount)` и обновляет HP-бар.
- `src/systems/AnimationSystem.ts` на каждом кадре вызывает `animate(dt)` у всех `SpriteEntity`.
- В `PlayerCombat` уже зарезервировано событие `player:cast_spell`, однако обработчик в `CombatSystem` пока пустой.

### Проблемы, которые нужно устранить

1. Одно действие сейчас может повторно raycast-иться разными системами: `InputSystem` ищет тайл, а `BoundsSystem` повторно ищет баунд по исходному DOM-событию.
2. `SelectionSystem` подписан на строковое событие `tile:click`, но оно нигде не публикуется.
3. Визуального состояния hover/target для тайла нет.
4. Применимость навыка к тайлу нельзя отождествлять с `Tile.walkable`: первое — правило скилла, второе — навигация.

---

## Границы ответственности

```text
Pointer events
    ↓
InputSystem ── TilePointerPayload ──→ TileInteractionSystem
                                        ├─ TileVisualSystem (hover / targeting)
                                        └─ player:cast_spell ──→ CastSystem
                                                                         ├─ AoE target query
                                                                         ├─ BoundsSystem / bound-query API
                                                                         ├─ Unit.takeDamage(...)
                                                                         └─ Effects / AnimationSystem
```

| Компонент | Ответственность | Не должен делать |
| --- | --- | --- |
| `InputSystem` | Преобразовать DOM-ввод в нормализованный указатель на тайл и жесты. | Рассчитывать урон, менять HP, знать правила конкретного скилла. |
| `TileInteractionSystem` | Хранить hover и режим прицеливания, проверять допустимость цели, выпускать намерение каста. | Искать юнитов и наносить урон. |
| `TileVisualSystem` | Отрисовывать hover, доступность, AoE-preview и feedback. | Принимать игровые решения. |
| `CastSystem` | Валидировать запрос, определять цели AoE, рассчитывать и применять последствия каста. | Считывать DOM-события и красить тайлы. |
| `BoundsSystem` | Создавать и предоставлять баунды/модификаторы юнитов. | Управлять вводом или самостоятельно запускать атаку. |
| `AnimationSystem` | Обновлять временные визуальные сущности. | Определять попадания и урон. |

> Рекомендуется отдельный `CastSystem`, чтобы прямые атаки (`click_target`) и AoE-касты не смешивались.

---

## Данные и события

### Нормализованная цель тайла

Добавить единый тип, например в `src/systems/contracts/TileInteraction.ts`:

```ts
export type TilePointerPayload = {
  grid: { q: number; r: number };
  worldPosition: THREE.Vector3;
  tile: Tile;
  pointerEvent: PointerEvent;
};

export type PointerGesture = "move" | "press" | "release" | "click" | "drag-start" | "drag" | "drag-end";
```

`InputSystem` должен находить корень тайла один раз, извлекать `q/r` из `userData`, получать `tileMap.getTile(q, r)` и публиковать события указателя. Не передавать дальше только `{ x, z }` или необходимость выполнить raycast повторно.


### События

Добавить константы в `src/systems/contracts/EventNamesInterface.ts` и типы payload рядом с ними:

```ts
export const TileInteraction = {
  pointer_move: "tile:pointer-move",
  pointer_click: "tile:pointer-click",
  hover_changed: "tile:hover-changed",
  target_preview_changed: "tile:target-preview-changed",
};

export const PlayerCombat = {
  // существующие события сохранить
  cast_spell: "player:cast_spell",
  cast_rejected: "player:cast-rejected",
  cast_resolved: "player:cast-resolved",
};

export const Effects = {
  // существующее projectile_hit сохранить
  tile_click: "effects:tile-click",
  aoe_impact: "effects:aoe-impact",
};
```

Рекомендуемые payload:

```ts
export type CastRequest = {
  casterId: string;
  skillId: string;
  target: TilePointerPayload;
};

export type CastResolvedPayload = {
  casterId: string;
  skillId: string;
  targetGrid: { q: number; r: number };
  affectedCells: Array<{ q: number; r: number }>;
  hits: Array<{ unitId: string; boundId?: string; damage: number }>;
};
```

Событие `player:cast_spell` — это **намерение**, а не подтверждение попадания. `cast_resolved` публикуется только после успешной валидации, вычисления целей и применения урона. `cast_rejected` содержит причину (`no-active-skill`, `invalid-tile`, `out-of-range`, `cooldown`, `not-enough-resource`).

---

## Ввод и жесты

### Этап 1: базовый указатель

Доработать `InputSystem`:

1. Подписаться на `pointermove`, `pointerdown`, `pointerup`, `pointerleave`; оставить `contextmenu.preventDefault()`.
2. Вынести текущую логику raycast-а в метод, возвращающий `TilePointerPayload | null`.
3. На `pointermove` публиковать `tile:pointer-move` только когда целевой гекс изменился. При уходе с карты публиковать `hover_changed` с `null`.
4. На click выбранной кнопки публиковать `tile:pointer-click`. Использование скилла можно привязать к левой кнопке в режиме прицеливания; текущее перемещение правой кнопкой должно остаться отдельным действием.
5. Не отправлять сырое DOM-событие в `BoundsSystem` для повторного поиска цели.

### Этап 2: drag и направленные навыки

Состояние жеста должно хранить `pointerId`, начальный экранный пиксель и начальный тайл. Порог drag — константа в пикселях (например, `6–8 px`), а не любое микродвижение.

- `drag-start`: при превышении порога.
- `drag`: передаёт начальную и текущую точки/тайлы для preview направленной области.
- `drag-end`: создаёт `CastRequest` с направлением от стартовой к конечной точке.
- обычный click: создаёт `CastRequest` по одному целевому тайлу.

Это позволит добавить круг, конус, линию и выбор области без изменения базового контракта указателя.

---

## Выбор и доступность тайла

`TileInteractionSystem` хранит `activeSkill`, `hoveredTile` и `targetPreview`. На движении указателя он обновляет hover, вычисляет клетки preview, проверяет допустимость и публикует данные для визуализации.

```ts
interface SkillTargetingRule {
  canTargetTile(context: TargetingContext, target: GridPos): boolean;
  getAffectedCells(context: TargetingContext, target: GridPos): GridPos[];
}
```

Проверка должна учитывать существование тайла, границы карты, расстояние от кастера, форму/радиус навыка и (позже) флаг доступности.

### Отложено: доступность при генерации карты

При построении `TileMap` добавить отдельные данные клетки, например `castable`/`targetable`, либо общий набор тегов. Источник — `MapData`/генератор карты. До этого этапа допустимость можно временно определить правилом навыка (`tileMap.getTile(...) !== null` и проверка range).

Не использовать `walkable` как замену `castable`: непроходимый тайл может быть законной целью заклинания, а проходимый — запрещённой.

---

## Визуальная обратная связь

### Hover и preview

`TileVisualSystem` получает `hover_changed` и `target_preview_changed` и отображает:

- один контур/декаль под курсором;
- зелёное состояние для разрешённой цели;
- красное состояние для запрещённой;
- полупрозрачные маркеры всех клеток AoE-preview;
- очистку предыдущего состояния без создания новых объектов на каждый `pointermove`.

Не следует изменять материал импортированного GLTF-тайла напрямую: он может быть разделён между объектами. Безопаснее использовать отдельный overlay (плоский hex/контур) над тайлом или выделенный материал на временном дочернем объекте.

### Эффект клика и попадания

Последовательность визуальных событий:

1. `tile:pointer-click` — короткий feedback клика по выбранному тайлу (`effects:tile-click`);
2. `player:cast_spell` принят — при необходимости анимация кастера/снаряд;
3. `CastSystem` разрешил попадание — `effects:aoe-impact` в центре области;
4. при необходимости отдельные попадания/числа урона у затронутых юнитов.

Для временных эффектов создать наследников `SpriteEntity` (например, `TileClickEffect`, `AoeImpactEffect`). Каждый обязан создать `THREE.Group`/sprite, расположиться через `tileMap.gridToWorldPosition(...)`, реализовать `animate(dt)` с ограниченным lifetime и после завершения удалить себя из `EntityManager`/сцены с освобождением ресурсов. В effect-entity не должна находиться боевая логика.

`AnimationSystem` уже обновляет все `SpriteEntity`, поэтому его не нужно превращать в систему расчёта эффектов — достаточно зарегистрировать новые effect-entities в существующем менеджере.

---

## CastSystem и AoE-попадания

### Порядок обработки каста

1. Получить `CastRequest` из `player:cast_spell`.
2. Найти кастера по `casterId`, активное определение скилла по `skillId`.
3. Повторно валидировать цель на уровне игры: existence, range, ресурс, cooldown, доступность тайла.
4. Получить клетки `affectedCells` из targeting rule.
5. Для каждого юнита найти все его баунды, чьи grid-координаты входят в `affectedCells`.
6. Для каждого задетого баунда прочитать `armor` и рассчитать вклад в урон.
7. Суммировать дробные вклады, применить `unit.takeDamage(totalDamage)` ровно один раз на юнита и сохранить в hit итог и детали баундов.
8. Опубликовать `cast_resolved` и `effects:aoe-impact`.
9. Существующий `CombatSystem.checkHp(...)` удалит убитых юнитов на следующем обновлении; в будущем смерть лучше сделать отдельным событием.

### Запрос баунда вместо повторного raycast

Для AoE необходим API, который возвращает баунд юнита для клетки/точки. Его стоит добавить в `BoundsSystem` либо в отдельный сервис:

```ts
getBoundAtGrid(unit: Unit, grid: GridPos): BoundTarget | null;
```

Метод должен работать с метаданными баунда (`entityId`, клетка, `modifiers`), а не запускать raycast от камеры. Для AoE нужен вариант, возвращающий все баунды юнита в наборе клеток; каждый баунд даёт отдельный вклад в итоговый урон.

### Расчёт урона MVP

Точечная атака и AoE используют одинаковую формулу для каждого баунда:

```ts
const armor = Math.max(bound?.modifiers.armor ?? 0, 0);
const boundDamage = baseDamage * (100 / (100 + armor));
```

AoE суммирует `boundDamage` всех задетых баундов одного юнита и вызывает `unit.takeDamage(totalDamage)` один раз. Урон и здоровье хранятся как `number` без округления: вклад может быть меньше единицы. Формула использует константу масштаба брони `100`: при `armor = 0` урон равен базовому, при `armor = 100` — составляет половину базового, а при росте брони плавно уменьшается и не становится отрицательным. Отсутствующий или отрицательный `armor` считается равным `0`. Значение `6` находится в определении навыка (`baseDamage`), а не в `CastSystem`.

---

## Рекомендуемый порядок реализации

1. **Контракты:** добавить типы payload и именованные события; заменить строковый `"tile:click"` в `SelectionSystem` на константу.
2. **Единый tile picking:** доработать `InputSystem` для `pointermove`/click и возврата `TilePointerPayload`; сохранить правый клик как движение.
3. **Hover:** создать `TileInteractionSystem` и `TileVisualSystem`, реализовать один overlay и очистку состояния.
4. **Режим прицеливания:** добавить `activeSkill`, правило range и AoE-preview; пока считать все существующие тайлы потенциально доступными.
5. **CastSystem:** обработать `player:cast_spell`, провалидировать запрос, получить клетки AoE и юнитов.
6. **Bound-query и урон:** получать все баунды в клетках AoE, суммировать вклады `baseDamage * (100 / (100 + armor))`, вызвать `Unit.takeDamage` ровно один раз на юнита.
7. **Эффекты:** реализовать `TileClickEffect` и `AoeImpactEffect` через `SpriteEntity`; связать их с `Effects` событиями.
8. **Drag/направление:** добавить порог, lifecycle жеста и формы конуса/линии.
9. **Генерация карты:** добавить данные `castable`/теги цели в `MapData` и использовать их в `canTargetTile`.
10. **Тесты и отладка:** покрыть правила клеток, расчёт урона, дедупликацию юнитов и очистку эффектов.

---

## Критерии готовности MVP

- При наведении на тайл появляется ровно одно выделение; при уходе с карты оно исчезает.
- В режиме активного скилла разрешённая и запрещённая цели визуально различаются, а preview показывает весь AoE.
- Клик по разрешённому тайлу создаёт один `CastRequest`; по запрещённому — не наносит урон и публикует `cast_rejected`.
- Каждый юнит в AoE получает один итоговый удар, равный сумме дробных вкладов всех его задетых баундов; юниты вне AoE не меняют HP.
- Эффект клика и AoE-эффект завершаются и удаляются без утечек объектов/материалов.
- Правый клик по-прежнему запускает существующее перемещение и не инициирует каст.

