export class MegaphoneCommunication {
    constructor(name, range, volume = null) {
        this.volume = null;
        this.name = name;
        this.range = range;
        if (volume != null)
            this.volume = volume;
    }
}
