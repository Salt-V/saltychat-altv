import { Vector3 } from "alt-client";
import { EchoEffect } from "./EchoEffect";

export class SelfState {
    public Position: Vector3;
    public Rotation: number;
    public IsAlive: boolean;
    public Echo: EchoEffect;

    constructor(position: Vector3, rotation: number, echo: boolean = false) {
        this.Position = position;
        this.Rotation = rotation;
        this.IsAlive = true;
        if (echo) this.Echo = new EchoEffect();
    }
}