import { EchoEffect } from "./EchoEffect";
export class SelfState {
    Position;
    Rotation;
    IsAlive;
    Echo;
    constructor(position, rotation, echo = false) {
        this.Position = position;
        this.Rotation = rotation;
        this.IsAlive = true;
        if (echo)
            this.Echo = new EchoEffect();
    }
}
