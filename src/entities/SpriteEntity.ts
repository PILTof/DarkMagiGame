import * as THREE from "three";

/**
 * Базовый класс для всех сущностей на основе спрайтов
 * (снаряды, эффекты, UI элементы и т.д.)
 */
export abstract class SpriteEntity {
    readonly id: string;
    readonly mesh: THREE.Sprite;
    protected position: THREE.Vector3;

    constructor(sprite: THREE.Sprite, position?: THREE.Vector3) {
        this.id = `sprite_entity_${Date.now()}_${Math.random()}`;
        this.mesh = sprite;
        this.position = position ? position.clone() : new THREE.Vector3();
        this.mesh.position.copy(this.position);
    }

    /**
     * Обновляет сущность. Возвращает true если нужно удалить
     */
    abstract update(dt: number, scene: THREE.Scene): boolean;

    /**
     * Устанавливает позицию
     */
    setPosition(position: THREE.Vector3): void {
        this.position.copy(position);
        this.mesh.position.copy(this.position);
    }

    /**
     * Получает текущую позицию
     */
    getPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    /**
     * Устанавливает масштаб
     */
    setScale(scale: number | THREE.Vector3): void {
        if (typeof scale === "number") {
            this.mesh.scale.set(scale, scale, 1);
        } else {
            this.mesh.scale.copy(scale);
        }
    }

    /**
     * Устанавливает прозрачность
     */
    setOpacity(opacity: number): void {
        this.mesh.material.opacity = Math.max(0, Math.min(1, opacity));
    }

    /**
     * Устанавливает видимость
     */
    setVisible(visible: boolean): void {
        this.mesh.visible = visible;
    }

    /**
     * Очищает ресурсы
     */
    dispose(scene: THREE.Scene): void {
        scene.remove(this.mesh);
        
        if (this.mesh.material.map) {
            this.mesh.material.map.dispose();
        }
        this.mesh.material.dispose();
    }

    /**
     * Добавляет в сцену
     */
    addToScene(scene: THREE.Scene): void {
        scene.add(this.mesh);
    }

    /**
     * Удаляет из сцены
     */
    removeFromScene(scene: THREE.Scene): void {
        scene.remove(this.mesh);
    }
}
