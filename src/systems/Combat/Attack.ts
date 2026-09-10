import type { Vector3 } from "three";
import type { Unit } from "../../entities/Unit";

export abstract class Attack {
    protected readonly promise: Promise<{
        target: Unit;
        position: Vector3;
        damage: number;
        id: string;
    }>;
    protected resolve: Function;

    protected combatId: string;

    constructor(combatId: string) {
        this.combatId = combatId;
        this.resolve = () => {};
        this.promise = new Promise((resolve) => {
            this.resolve = resolve;
        });
    }

    public abstract run(config: {}): Promise<any> | null;
}
