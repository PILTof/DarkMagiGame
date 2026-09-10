import * as THREE from "three";
import { SpriteEntity } from "../SpriteEntity";
import type { Unit } from "../Unit";

export class FireballProjectile extends SpriteEntity {
    private readonly startPos: THREE.Vector3;
    private readonly targetUnit: Unit;
    private animationProgress: number = 0;
    private readonly speed: number = 8; // units per second
    private readonly distance: number;
    private finished: boolean = false;

    constructor(sniper: Unit, target: Unit) {

        super(
            SpriteEntity.createId(),
            sniper.gridPos,
            FireballProjectile.createMesh(),
        );

        // Сохраняем стартовую позицию и цель
        this.startPos = sniper.position.clone();
        this.targetUnit = target;
        
        // Вычисляем расстояние для расчета прогресса
        this.distance = this.startPos.distanceTo(target.position);
        
        // Устанавливаем начальную позицию меша
        this.mesh.position.copy(this.startPos);
        this.position.copy(this.startPos);
    }

    private static createMesh(): THREE.Group {
        const group = new THREE.Group();
        
        // Загружаем текстуру fireball
        const textureLoader = new THREE.TextureLoader();
        const fireballTexture = textureLoader.load('/assets/sprites/fireball.png');
        
        // Настройки текстуры
        fireballTexture.minFilter = THREE.LinearFilter;
        fireballTexture.magFilter = THREE.LinearFilter;
        
        // Параметры для trail
        const mainSize = 0.5; // Размер основного fireball
        const trailCount = 5; // Количество элементов trail
        const trailSpacing = 0.15; // Расстояние между элементами trail
        const sizeDecay = 0.75; // Коэффициент уменьшения размера каждого следующего элемента
        const opacityDecay = 0.7; // Коэффициент уменьшения прозрачности
        
        // Создаем основной fireball sprite
        const mainMaterial = new THREE.SpriteMaterial({
            map: fireballTexture,
            transparent: true,
            opacity: 1.0,
            depthWrite: false,
            blending: THREE.AdditiveBlending, // Эффект свечения
        });
        const mainSprite = new THREE.Sprite(mainMaterial);
        mainSprite.scale.set(mainSize, mainSize, 1);
        mainSprite.position.set(0, 0, 0);
        group.add(mainSprite);
        
        // Создаем trail (хвост) из уменьшающихся спрайтов
        let currentSize = mainSize;
        let currentOpacity = 1.0;
        
        for (let i = 1; i <= trailCount; i++) {
            currentSize *= sizeDecay;
            currentOpacity *= opacityDecay;
            
            const trailMaterial = new THREE.SpriteMaterial({
                map: fireballTexture,
                transparent: true,
                opacity: currentOpacity,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });
            
            const trailSprite = new THREE.Sprite(trailMaterial);
            trailSprite.scale.set(currentSize, currentSize, 1);
            // Располагаем элементы trail позади основного fireball
            trailSprite.position.set(-i * trailSpacing, 0, 0);
            group.add(trailSprite);
        }
        
        return group;
    }

    public animate(dt: number): void {
        // Если уже достигли цели, ничего не делаем
        if (this.finished) {
            this.finish();
            return;
        }

        // Обновляем прогресс движения на основе скорости и времени
        // progress увеличивается от 0 до 1
        const progressDelta = (this.speed * dt) / this.distance;
        this.animationProgress = Math.min(1, this.animationProgress + progressDelta);

        // Получаем текущую позицию цели (на случай, если цель движется)
        const currentTargetPos = this.targetUnit.position;

        // Вычисляем базовую позицию с помощью линейной интерполяции
        this.mesh.position.lerpVectors(
            this.startPos,
            currentTargetPos,
            this.animationProgress
        );

        // Добавляем эффект арки (параболическая траектория)
        // Sin-кривая создает красивую дугу в полете
        const arcHeight = Math.sin(this.animationProgress * Math.PI) * 0.5;
        this.mesh.position.y += arcHeight;

        // Обновляем позицию сущности
        this.position.copy(this.mesh.position);

        // Опционально: поворачиваем группу по направлению движения
        // Это создаст эффект, что fireball "смотрит" в направлении полета
        if (this.animationProgress < 1) {
            const direction = new THREE.Vector3()
                .subVectors(currentTargetPos, this.mesh.position)
                .normalize();
            
            // Поворачиваем всю группу (включая trail) по направлению движения
            this.mesh.rotation.z = Math.atan2(direction.y, direction.x);
        }

        // Проверяем достижение цели
        if (this.animationProgress >= 1) {
            this.finished = true;
            // Устанавливаем точную финальную позицию
            this.mesh.position.copy(currentTargetPos);
            this.position.copy(currentTargetPos);
        }
    }
}
