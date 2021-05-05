export class RadioTower {
    constructor(x, y, z, range = 8000) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.range = range;
    }
}
export class RadioTowers {
    constructor(towers) {
        this.towers = towers;
    }
}
