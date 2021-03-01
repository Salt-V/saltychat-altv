import { EchoEffect } from "./EchoEffect";
export class SelfState {
    constructor(position, rotation, echo = false) {
        this.Position = position;
        this.Rotation = rotation;
        this.IsAlive = true;
        if (echo)
            this.Echo = new EchoEffect();
    }
}
