# HP Bar для юнитов - Документация

## Обзор

Добавлена система отображения HP баров над юнитами (Player и Enemy). HP бар автоматически создается для каждого юнита и отображается над ним.

## Что было добавлено

### 1. `HealthBar` компонент (`src/entities/components/HealthBar.ts`)

Визуальный компонент, который:
- Отображает текущее/максимальное здоровье
- Использует Canvas Texture для рендеринга
- Автоматически меняет цвет в зависимости от % здоровья:
  - **Зеленый** > 60%
  - **Желтый** 30-60%
  - **Красный** < 30%
- Рендерится как THREE.Sprite (всегда смотрит на камеру)

### 2. Обновленный `Unit` класс

Добавлены методы:
- `setHealth(current, max?)` - устанавливает здоровье
- `takeDamage(amount)` - наносит урон
- `heal(amount)` - лечит
- `isAlive()` - проверяет, жив ли юнит
- `updateHealthBar()` - обновляет визуальное отображение
- `setHealthBarVisible(visible)` - показать/скрыть HP бар
- `dispose()` - освобождает ресурсы

### 3. Обновлены Player и Enemy

Оба класса теперь устанавливают начальное здоровье в конструкторе:
- **Player**: 100 HP
- **Enemy**: 150 HP

## Использование

### Базовое использование (автоматически)

HP бар создается автоматически при создании юнита:

```typescript
const player = new Player(spawn, assets);
// HP бар уже создан и отображается с 100/100 HP

const enemy = new Enemy("enemy1", spawn, assets);
// HP бар уже создан и отображается с 150/150 HP
```

### Изменение здоровья

```typescript
// Нанести урон
unit.takeDamage(25);

// Вылечить
unit.heal(10);

// Установить конкретное значение
unit.setHealth(50, 100); // 50 из 100 HP

// Проверить, жив ли юнит
if (unit.isAlive()) {
    console.log("Unit is alive!");
}
```

### Настройка внешнего вида

Можно настроить HP бар при создании (для кастомизации нужно изменить `Unit.createHealthBar()`):

```typescript
const healthBar = new HealthBar({
    width: 1.5,              // Ширина бара
    height: 0.15,            // Высота бара
    offsetY: 1.5,            // Высота над юнитом
    backgroundColor: 0x333333,
    borderColor: 0xffffff,
    borderWidth: 3,
});
```

### Показать/скрыть HP бар

```typescript
// Скрыть HP бар
unit.setHealthBarVisible(false);

// Показать HP бар
unit.setHealthBarVisible(true);
```

## Интеграция с CombatSystem

Когда вы создадите CombatSystem, используйте методы Unit для управления здоровьем:

```typescript
export class CombatSystem implements System {
    handleAttack(attackerId: string, targetId: string, damage: number) {
        const target = this.entityManager.get(targetId);
        
        if (target instanceof Unit) {
            target.takeDamage(damage);
            
            if (!target.isAlive()) {
                this.eventBus.emit("unit:death", { entityId: targetId });
            }
        }
    }
}
```

## Технические детали

- **Rendering**: Используется THREE.Sprite с CanvasTexture
- **Performance**: Canvas обновляется только при изменении здоровья
- **Billboard**: HP бар всегда смотрит на камеру (sprite поведение)
- **Render Order**: 1000 (всегда рендерится поверх других объектов)
- **Memory**: При удалении юнита нужно вызвать `unit.dispose()` для освобождения ресурсов

## Пример теста

```typescript
// Создать врага
const enemy = new Enemy("test_enemy", {q: 0, r: 0}, assets);
console.log(`Enemy HP: ${enemy.healthPoints}/${enemy.maxHealthPoints}`); // 150/150

// Нанести урон
enemy.takeDamage(50);
console.log(`Enemy HP: ${enemy.healthPoints}/${enemy.maxHealthPoints}`); // 100/150
// HP бар изменит цвет с зеленого на желтый

// Нанести критический урон
enemy.takeDamage(80);
console.log(`Enemy HP: ${enemy.healthPoints}/${enemy.maxHealthPoints}`); // 20/150
// HP бар станет красным

// Проверить статус
console.log(`Is alive: ${enemy.isAlive()}`); // true

// Добить
enemy.takeDamage(20);
console.log(`Is alive: ${enemy.isAlive()}`); // false
```

## TODO

- [ ] Добавить анимацию плавного изменения HP
- [ ] Добавить отображение числового значения HP на баре
- [ ] Добавить эффекты при получении урона (мигание, тряска)
- [ ] Оптимизировать для большого количества юнитов (object pooling)
