export class MegaphoneCommunication {
    public name: string;
    public range: number;
    public volume: number = null;

    constructor(name: string, range: number, volume: number = null) {
        this.name = name;
        this.range = range;
        if (volume != null) this.volume = volume;
    }
}