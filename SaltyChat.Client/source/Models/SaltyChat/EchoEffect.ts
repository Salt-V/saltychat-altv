export class EchoEffect {
    public duration: number;
    public rolloff: number;
    public delay: number;

    constructor(duration: number = 100, rolloff: number = 0.3, delay: number = 250) {
        this.duration = duration;
        this.rolloff = rolloff;
        this.delay = delay;
    }
}