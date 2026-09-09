# Рефакторинг: Система снарядов

## Выполненные изменения

### ✅ Созданные файлы:

1. **`src/entities/SpriteEntity.ts`**
   - Базовый абстрактный класс для всех сущностей на основе спрайтов
   - Управление позицией, масштабом, прозрачностью
   - Абстрактный метод `update(dt, scene): boolean`
   - Методы для работы со сценой

2. **`src/entities/Projectiles/Projectile.ts`**
   - Абстрактный базовый класс для снарядов
   - Наследуется от `SpriteEntity`
   - Общая логика: from, target, speed, damage, progress
   - Методы: `updateProgress()`, `updateBasePosition()`

3. **`src/entities/Projectiles/FireballProjectile.ts`**
   - Конкретная реализация огненного шара
   - Наследуется от `Projectile`
   - След из 10 частиц с fade-out
   - Траектория с аркой (sin-кривая)
   - Скорость: 8 units/sec

4. **`src/entities/Projectiles/index.ts`**
   - Экспорт всех типов снарядов

5. **`docs/ProjectileSystem-Refactored.md`**
   - Полная документация новой архитектуры
   - Примеры использования
   - Как добавить новые типы снарядов

### ✏️ Обновленные файлы:

1. **`src/systems/ProjectileSystem.ts`**
   - Импорты изменены на новую структуру
   - В методе `fire()` добавлен switch для выбора типа снаряда
   - Готово для расширения (arrow, magic, и т.д.)

### ❌ Файлы для удаления:

**`src/entities/Projectile.ts`** - старая версия, больше не используется

---

## Иерархия классов

```
SpriteEntity (abstract)
    ├── Projectile (abstract)
    │   └── FireballProjectile
    ├── [Будущие классы: эффекты, UI элементы]
```

---

## Преимущества новой архитектуры:

### 1. **Расширяемость**
- Легко добавлять новые типы снарядов (стрелы, молнии, etc.)
- Базовый класс `SpriteEntity` для любых спрайт-сущностей

### 2. **Повторное использование кода**
- Общая логика в `Projectile`
- Специфичное поведение в подклассах

### 3. **Четкая структура**
- Отдельная папка `Projectiles/`
- Каждый тип в своем файле
- Index для удобного импорта

### 4. **Гибкость**
- SpriteEntity можно использовать для:
  - Визуальных эффектов (взрывы, искры)
  - Плавающих чисел урона
  - UI элементов
  - Частиц

---

## Как добавить новый снаряд:

### Пример: ArrowProjectile

```typescript
// src/entities/Projectiles/ArrowProjectile.ts
import { Projectile, type ProjectileConfig } from "./Projectile.ts";

export class ArrowProjectile extends Projectile {
    constructor(config: ProjectileConfig, onHit) {
        super(config, onHit);
    }

    update(dt: number, scene: THREE.Scene): boolean {
        const hasHit = this.updateProgress(dt);
        
        if (!hasHit) {
            // Прямая траектория без арки
            this.updateBasePosition();
            
            // Поворот стрелы по направлению движения
            const direction = new THREE.Vector3()
                .subVectors(this.target.position, this.from)
                .normalize();
            this.mesh.rotation.z = Math.atan2(direction.y, direction.x);
        }
        
        return hasHit;
    }
}
```

Затем в `ProjectileSystem.ts`:
```typescript
case "arrow":
    projectile = new ArrowProjectile(...);
    break;
```

---

## Следующие шаги:

1. Удалить старый файл `src/entities/Projectile.ts`
2. Добавить текстуру `/public/assets/sprites/fireball.png`
3. Опционально: добавить другие типы снарядов
4. Опционально: создать эффекты взрыва при попадании

---

## Тестирование:

Проверьте, что:
- ✅ Снаряды создаются и летят к цели
- ✅ След правильно отображается и исчезает
- ✅ Урон наносится при попадании
- ✅ Снаряды удаляются после попадания
- ✅ События `combat:projectile-hit` работают
