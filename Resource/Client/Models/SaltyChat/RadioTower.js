export class RadioTower {
    x;
    y;
    z;
    range;
    constructor(x, y, z, range = 8000) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.range = range;
    }
}
export class RadioTowers {
    towers;
    constructor(towers) {
        this.towers = towers;
    }
}
