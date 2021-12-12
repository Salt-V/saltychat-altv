export class MegaphoneCommunication {
    name;
    range;
    volume = null;
    constructor(name, range, volume = null) {
        this.name = name;
        this.range = range;
        if (volume != null)
            this.volume = volume;
    }
}
