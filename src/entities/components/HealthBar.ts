import * as THREE from "three";

export interface HealthBarConfig {
    width?: number;
    height?: number;
    offsetY?: number;
    backgroundColor?: number;
    foregroundColor?: number;
    borderColor?: number;
    borderWidth?: number;
}

/**
 * Компонент HP бара для отображения над юнитом
 * Использует Canvas Texture для рендера бара
 */
export class HealthBar {
    private readonly sprite: THREE.Sprite;
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly config: Required<HealthBarConfig>;
    
    private currentHealth: number = 100;
    private maxHealth: number = 100;

    constructor(config: HealthBarConfig = {}) {
        this.config = {
            width: config.width ?? 1.0,
            height: config.height ?? 0.1,
            offsetY: config.offsetY ?? 0.8,
            backgroundColor: config.backgroundColor ?? 0x222222,
            foregroundColor: config.foregroundColor ?? 0x00ff00,
            borderColor: config.borderColor ?? 0x000000,
            borderWidth: config.borderWidth ?? 2,
        };

        // Создаем canvas для рисования HP бара
        this.canvas = document.createElement("canvas");
        this.canvas.width = 256;
        this.canvas.height = 32;
        
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get 2D context for HealthBar canvas");
        }
        this.context = ctx;

        // Создаем текстуру из canvas
        const texture = new THREE.CanvasTexture(this.canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        // Создаем материал для sprite
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        // Создаем sprite
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(this.config.width, this.config.height, 1);
        this.sprite.position.y = this.config.offsetY;
        
        // Делаем так, чтобы HP бар всегда был поверх других объектов
        this.sprite.renderOrder = 1000;

        // Рисуем начальное состояние
        this.draw();
    }

    /**
     * Обновляет значение здоровья и перерисовывает бар
     */
    updateHealth(current: number, max: number): void {
        this.currentHealth = Math.max(0, Math.min(current, max));
        this.maxHealth = Math.max(1, max);
        this.draw();
    }

    /**
     * Рисует HP бар на canvas
     */
    private draw(): void {
        const ctx = this.context;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const borderWidth = this.config.borderWidth;

        // Очищаем canvas
        ctx.clearRect(0, 0, width, height);

        // Рисуем фон (серый)
        ctx.fillStyle = this.colorToHex(this.config.backgroundColor);
        ctx.fillRect(borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2);

        // Вычисляем процент здоровья
        const healthPercent = this.currentHealth / this.maxHealth;
        const barWidth = (width - borderWidth * 2) * healthPercent;

        // Выбираем цвет в зависимости от процента здоровья
        let foregroundColor: string;
        if (healthPercent > 0.6) {
            foregroundColor = "#00ff00"; // Зеленый
        } else if (healthPercent > 0.3) {
            foregroundColor = "#ffff00"; // Желтый
        } else {
            foregroundColor = "#ff0000"; // Красный
        }

        // Рисуем передний план (текущее здоровье)
        ctx.fillStyle = foregroundColor;
        ctx.fillRect(borderWidth, borderWidth, barWidth, height - borderWidth * 2);

        // Рисуем границу
        ctx.strokeStyle = this.colorToHex(this.config.borderColor);
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);

        // Обновляем текстуру
        if (this.sprite.material.map) {
            this.sprite.material.map.needsUpdate = true;
        }
    }

    /**
     * Конвертирует THREE.js цвет (число) в hex строку для canvas
     */
    private colorToHex(color: number): string {
        return "#" + color.toString(16).padStart(6, "0");
    }

    /**
     * Возвращает sprite для добавления в сцену
     */
    getSprite(): THREE.Sprite {
        return this.sprite;
    }

    /**
     * Устанавливает видимость HP бара
     */
    setVisible(visible: boolean): void {
        this.sprite.visible = visible;
    }

    /**
     * Освобождает ресурсы
     */
    dispose(): void {
        if (this.sprite.material.map) {
            this.sprite.material.map.dispose();
        }
        this.sprite.material.dispose();
    }
}
