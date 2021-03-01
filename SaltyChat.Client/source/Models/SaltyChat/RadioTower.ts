import { Vector3 } from "alt-client";

export class RadioTower {
    public towers: Vector3[];

    constructor(towers: Vector3[]) {
        this.towers = towers;
    }
}