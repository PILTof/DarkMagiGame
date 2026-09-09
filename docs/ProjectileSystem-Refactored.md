# Projectile System - Refactored Architecture

## Структура классов

### Иерархия наследования

```
SpriteEntity (базовый абстрактный класс)
    ↓
Projectile (абстрактный класс снарядов)
    ↓
FireballProjectile (конкретная реализация)
```

---

## SpriteEntity

**Файл:** `src/entities/SpriteEntity.ts`

Базовый абстрактный класс для всех сущностей на основе спрайтов.

### Основные возможности:
- Управление THREE.Sprite
- Позиционирование
- Масштабирование
- Прозрачность
- Видимость
- Очистка ресурсов

### API:
```typescript
abstract update(dt: number, scene: THREE.Scene): boolean
setPosition(position: THREE.Vector3): void
getPosition(): THREE.Vector3
setScale(scale: number | THREE.Vector3): void
setOpacity(opacity: number): void
setVisible(visible: boolean): void
dispose(scene: THREE.Scene): void
addToScene(scene: THREE.Scene): void
removeFromScene(scene: THREE.Scene): void
```

---

## Projectile

**Файл:** `src/entities/Projectiles/Projectile.ts`

Абстрактный базовый класс для всех типов снарядов.

### Поля:
- `from: Vector3` - стартовая позиция
- `target: Unit` - целевой юнит
- `speed: number` - скорость движения
- `damage: number` - урон
- `progress: number` - прогресс полета (0-1)
- `distance: number` - расстояние до цели

### Методы:
```typescript
abstract update(dt: number, scene: THREE.Scene): boolean
protected updateProgress(dt: number): boolean
protected updateBasePosition(): void
protected static createFallbackSprite(): THREE.Sprite
```

---

## FireballProjectile

**Файл:** `src/entities/Projectiles/FireballProjectile.ts`

Конкретная реализация огненного шара с визуальным следом.

### Особенности:
- ✨ Огненный спрайт с AdditiveBlending
- 🔥 След из 10 уменьшенных частиц
- 📉 Fade-out эффект для следа
- 🌈 Траектория с аркой (sin-кривая)

### Параметры:
```typescript
{
    trailLength: 10,        // Количество частиц следа
    trailInterval: 0.02,    // Интервал создания частиц (сек)
    speed: 8,               // Скорость (units/sec)
}
```

### Визуал:
- Размер: 0.3x0.3 units
- Цвета: Желтый → Оранжевый → Красный
- Арка: высота 0.5 units
- След: lifetime 0.5 сек

---

## ProjectileSystem

**Файл:** `src/systems/ProjectileSystem.ts`

Система управления всеми снарядами в игре.

### Поддерживаемые типы:
- `"fireball"` - FireballProjectile
- `"arrow"` - (можно добавить)
- `"magic"` - (можно добавить)

### API:
```typescript
fire(config: FireProjectileConfig): void
update(dt: number): void
getActiveProjectilesCount(): number
clear(): void
```

### Использование:
```typescript
projectileSystem.fire({
    from: player.position.clone(),
    target: enemy,
    damage: 30,
    speed: 8,
    spriteType: "fireball"
});
```

---

## Добавление нового типа снаряда

### Шаг 1: Создать класс
```typescript
// src/entities/Projectiles/ArrowProjectile.ts
export class ArrowProjectile extends Projectile {
    update(dt: number, scene: THREE.Scene): boolean {
        // Своя логика движения
        // Например, прямая траектория без арки
    }
}
```

### Шаг 2: Добавить в ProjectileSystem
```typescript
// В методе fire()
switch (config.spriteType) {
    case "fireball":
        projectile = new FireballProjectile(...);
        break;
    case "arrow":
        projectile = new ArrowProjectile(...);
        break;
}
```

### Шаг 3: Добавить тип
```typescript
export type ProjectileType = "fireball" | "arrow" | "magic";
```

---

## События

### combat:projectile-hit
Emit когда снаряд достигает цели.

```typescript
{
    target: Unit,
    position: Vector3,
    damage: number
}
```

---

## Примеры траекторий

### Прямая линия (Arrow)
```typescript
protected updateBasePosition(): void {
    this.mesh.position.lerpVectors(
        this.from,
        this.target.position,
        this.progress
    );
}
```

### С аркой (Fireball)
```typescript
protected updateBasePosition(): void {
    this.mesh.position.lerpVectors(
        this.from,
        this.target.position,
        this.progress
    );
    
    const arcHeight = Math.sin(this.progress * Math.PI) * 0.5;
    this.mesh.position.y += arcHeight;
}
```

### Homing (следящий за целью)
```typescript
update(dt: number, scene: THREE.Scene): boolean {
    const hasHit = this.updateProgress(dt);
    
    // Пересчитываем направление к текущей позиции цели
    const direction = new THREE.Vector3()
        .subVectors(this.target.position, this.mesh.position)
        .normalize();
    
    this.mesh.position.add(direction.multiplyScalar(this.speed * dt));
    
    return hasHit;
}
```

---

## Файлы для удаления
- ❌ `src/entities/Projectile.ts` (старый)

## Созданные файлы
- ✅ `src/entities/SpriteEntity.ts`
- ✅ `src/entities/Projectiles/Projectile.ts`
- ✅ `src/entities/Projectiles/FireballProjectile.ts`
- ✅ `src/entities/Projectiles/index.ts`
