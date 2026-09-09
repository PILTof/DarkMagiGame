# ProjectileSystem - Документация

## Обзор

ProjectileSystem управляет летящими снарядами в игре. Снаряды летят от атакующего к цели с визуальным эффектом следа, и наносят урон при попадании.

## Архитектура

```
Player атакует Enemy
    ↓
BoundsSystem → emit "player:hit_target"
    ↓
CombatSystem.onHitTarget()
    ↓
ProjectileSystem.fire() - создает снаряд
    ↓
ProjectileSystem.update() - двигает снаряд каждый кадр
    ↓
Снаряд достигает цели
    ↓
target.takeDamage() - наносит урон
    ↓
emit "combat:projectile-hit" - для эффектов
```

## Компоненты

### 1. Projectile (Entity)

Снаряд с визуальным представлением и логикой движения.

**Свойства:**
- `mesh` - THREE.Sprite для визуализации
- `from` - начальная позиция
- `target` - цель (Unit)
- `speed` - скорость (units/sec)
- `damage` - урон
- `trail` - массив частиц следа

**Особенности:**
- Арка траектории (небольшой подъем)
- След из уменьшенных копий с fade-out
- Автоматическое удаление при попадании

### 2. ProjectileSystem

Управляет всеми активными снарядами.

**Методы:**
```typescript
fire(config: FireProjectileConfig): void
update(dt: number): void
getActiveProjectilesCount(): number
clear(): void
```

## Использование

### Базовое использование

```typescript
projectileSystem.fire({
    from: attacker.position.clone(),
    target: enemy,
    damage: 25,
    speed: 8,
    spriteType: "fireball"
});
```

### Конфигурация

```typescript
interface FireProjectileConfig {
    from: THREE.Vector3;       // Стартовая позиция
    target: Unit;              // Цель
    damage: number;            // Урон
    speed?: number;            // Скорость (по умолчанию 8)
    spriteType?: "fireball" | "arrow" | "magic";
}
```

## Визуальные эффекты

### 1. Спрайт снаряда
- Использует `/assets/sprites/fireball.png`
- Fallback: процедурный градиент (желтый → оранжевый → красный)
- AdditiveBlending для эффекта свечения
- Размер: 0.3x0.3 units

### 2. След (Trail)
- Создается каждые 0.02 секунды
- Максимум 10 частиц
- Каждая частица на 30% меньше основного спрайта
- Fade-out за 0.5 секунды
- Автоматическое удаление старых частиц

### 3. Траектория
- Прямая интерполяция от start к target
- Арка высотой 0.5 units (sin траектория)
- Адаптивная скорость (одинаковое время полета для разных дистанций)

## Интеграция с CombatSystem

```typescript
// В CombatSystem.onHitTarget()
const damage = calculateDamage(target);

this.projectileSystem.fire({
    from: sniper.position.clone(),
    target: unit,
    damage: damage,
    speed: 8,
    spriteType: "fireball",
});

// Урон наносится автоматически при попадании
```

## События

### Emit события

**combat:projectile-hit**
```typescript
{
    target: Unit,
    position: Vector3,
    damage: number
}
```

Срабатывает когда снаряд достигает цели. Можно использовать для:
- Визуальных эффектов взрыва
- Звуковых эффектов
- Тряски камеры
- Числового урона (floating text)

## Производительность

- **Trail pooling**: Старые частицы удаляются и переиспользуются
- **Automatic cleanup**: Снаряды удаляются при попадании
- **Canvas fallback**: Процедурные спрайты, если текстуры не загружены
- **Efficient updates**: O(n) где n = количество активных снарядов

## Параметры настройки

### Скорость снаряда
```typescript
speed: 8  // units per second
// Для сравнения: player.speed = 4
```

### След
```typescript
trailLength: 10        // Максимум частиц
trailInterval: 0.02    // Секунды между созданием частиц
trailLifetime: 0.5     // Время до исчезновения
```

### Арка
```typescript
arcHeight = sin(progress * PI) * 0.5  // Высота дуги
```

## Пример: Кастомный снаряд

```typescript
// Медленная магическая ракета с длинным следом
projectileSystem.fire({
    from: mage.position.clone(),
    target: enemy,
    damage: 50,
    speed: 4,        // Медленнее обычного
    spriteType: "magic",
});
```

## Отладка

```typescript
// Проверить количество активных снарядов
console.log("Active projectiles:", projectileSystem.getActiveProjectilesCount());

// Очистить все снаряды
projectileSystem.clear();
```

## TODO

- [ ] Разные траектории (homing, curved)
- [ ] Партиклы взрыва при попадании
- [ ] Звуковые эффекты
- [ ] AOE урон (splash damage)
- [ ] Критические попадания (визуальный эффект)
- [ ] Множественные снаряды (salvo)
