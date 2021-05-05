export class RadioTower {
    public x: number;
    public y: number;
    public z: number;
    public range: number;

    constructor(x: number, y: number, z: number, range: number = 8000) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.range = range;
    }
}

export class RadioTowers {
    public towers: RadioTower[];

    constructor(towers: RadioTower[]) {
        this.towers = towers;
    }
}