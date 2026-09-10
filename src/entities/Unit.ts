import * as THREE from "three";
import type { GridPos } from "../world/GridCoords.ts";
import { HealthBar } from "./components/HealthBar.ts";
import { Entity } from "./Entity.ts";

export class Unit extends Entity {
    worldPath: THREE.Vector3[] = [];
    selected = false;
    speed = 4;
    canAttack = true;

    private lockedCombat: Record<string, boolean> = {};

    public healthPoints: number = 1;
    public maxHealthPoints: number = 1;

    private healthBar: HealthBar | null = null;

    constructor(id: string, gridPos: GridPos, mesh: THREE.Group) {
        super(id, gridPos, mesh);

        // Создаем и добавляем HP бар
        this.createHealthBar();
    }

    public combatIsLocked(id: string): boolean {
        return this.lockedCombat[id] === true;
    }

    public lockCombat (id: string): void
    {
        this.lockedCombat[id] = true;
    }

    public unlockCombat(id: string): void
    {
        this.lockedCombat[id] = false;
    }

    /**
     * Создает HP бар для юнита
     */
    private createHealthBar(): void {
        this.healthBar = new HealthBar({
            width: 1.0,
            height: 0.12,
            offsetY: 1.2, // Высота над юнитом
        });

        // Добавляем HP бар к mesh юнита
        this.mesh.add(this.healthBar.getSprite());

        // Обновляем начальное состояние
        this.updateHealthBar();
    }

    /**
     * Обновляет отображение HP бара
     */
    public updateHealthBar(): void {
        if (this.healthBar) {
            this.healthBar.updateHealth(
                this.healthPoints,
                this.maxHealthPoints,
            );
        }
    }

    /**
     * Устанавливает здоровье и обновляет бар
     */
    public setHealth(current: number, max?: number): void {
        if (max !== undefined) {
            this.maxHealthPoints = max;
        }
        this.healthPoints = Math.max(
            0,
            Math.min(current, this.maxHealthPoints),
        );
        this.updateHealthBar();
    }

    /**
     * Наносит урон юниту
     */
    public takeDamage(amount: number): void {
        this.healthPoints = Math.max(0, this.healthPoints - amount);
        this.updateHealthBar();
    }

    /**
     * Лечит юнита
     */
    public heal(amount: number): void {
        this.healthPoints = Math.min(
            this.maxHealthPoints,
            this.healthPoints + amount,
        );
        this.updateHealthBar();
    }

    /**
     * Проверяет, жив ли юнит
     */
    public isAlive(): boolean {
        return this.healthPoints > 0;
    }

    /**
     * Показать/скрыть HP бар
     */
    public setHealthBarVisible(visible: boolean): void {
        if (this.healthBar) {
            this.healthBar.setVisible(visible);
        }
    }

    setWorldPath(path: THREE.Vector3[]): void {
        this.worldPath = path;
    }

    clearPath(): void {
        this.worldPath = [];
        this.worldPath.length = 0; // Очищаем массив, сохраняя ссылку
    }

    hasPath(): boolean {
        return this.worldPath.length > 0;
    }

    /**
     * Освобождает ресурсы
     */
    dispose(): void {
        if (this.healthBar) {
            this.healthBar.dispose();
        }
    }
}
