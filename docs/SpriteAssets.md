# SpriteAssets - Документация

## Обзор

`SpriteAssets` - система для загрузки и управления спрайтами/текстурами в игре.

## Типы спрайтов

```typescript
type SpriteType = 
    | "damage_number" | "heal_number" | "critical_hit" | "miss"
    | "hit_effect" | "skill_icon" | "buff_icon" | "debuff_icon";
```

## Использование

### Создание спрайта

```typescript
const sprite = spriteAssets.createSprite("hit_effect");
if (sprite) {
    sprite.position.set(x, y, z);
    scene.add(sprite);
}
```

### С настройками

```typescript
const sprite = spriteAssets.createSprite("damage_number", {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
    transparent: true,
});
```

### Получение текстуры

```typescript
const texture = spriteAssets.getTexture("critical_hit");
```

### Создание материала

```typescript
const material = spriteAssets.createMaterial("buff_icon", {
    materialType: "basic", // "basic" | "standard" | "sprite"
    transparent: true,
});
```

### Проверка доступности

```typescript
if (spriteAssets.has("hit_effect")) {
    console.log("Sprite loaded!");
}

const loaded = spriteAssets.getLoadedSprites();
```

## Добавление новых спрайтов

1. Добавить в `SpriteType`
2. Добавить путь в `SPRITE_PATHS`
3. Положить файл в `public/assets/sprites/`

## Пример: Эффект урона

```typescript
showDamage(position: THREE.Vector3, isCritical: boolean) {
    const hitEffect = this.spriteAssets.createSprite("hit_effect");
    if (hitEffect) {
        hitEffect.position.copy(position);
        hitEffect.scale.set(0.5, 0.5, 1);
        this.scene.add(hitEffect);
        
        setTimeout(() => this.scene.remove(hitEffect), 500);
    }
    
    if (isCritical) {
        const crit = this.spriteAssets.createSprite("critical_hit");
        if (crit) {
            crit.position.set(position.x, position.y + 0.5, position.z);
            this.scene.add(crit);
            setTimeout(() => this.scene.remove(crit), 1000);
        }
    }
}
```

## Интеграция

Автоматически загружается в `Game.ts`:

```typescript
const spriteAssets = await SpriteAssets.preload(assetLoader);
console.log("Loaded sprites:", spriteAssets.getLoadedSprites());
```

## Структура файлов

```
public/assets/sprites/
  - damage.png
  - heal.png
  - critical.png
  - miss.png
  - hit_effect.png
  - skill.png
  - buff.png
  - debuff.png
```
