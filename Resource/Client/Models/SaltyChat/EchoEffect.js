export class EchoEffect {
    duration;
    rolloff;
    delay;
    constructor(duration = 100, rolloff = 0.3, delay = 250) {
        this.duration = duration;
        this.rolloff = rolloff;
        this.delay = delay;
    }
}
