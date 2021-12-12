import { EchoEffect } from './EchoEffect';
export class SelfState {
    Position;
    Rotation;
    VoiceRange;
    IsAlive;
    Echo;
    constructor(position, rotation, voiceRange, echo = false) {
        this.Position = position;
        this.Rotation = rotation;
        this.VoiceRange = voiceRange;
        this.IsAlive = true;
        if (echo)
            this.Echo = new EchoEffect();
    }
}
