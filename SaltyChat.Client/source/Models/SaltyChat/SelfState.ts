import { Vector3 } from "alt-client";
import { EchoEffect } from "./EchoEffect";

export class SelfState {
    public Position: Vector3;
    public Rotation: number;
    public VoiceRange: number;
    public IsAlive: boolean;
    public Echo: EchoEffect;

    constructor(position: Vector3, rotation: number, voiceRange: number, echo: boolean = false) {
        this.Position = position;
        this.Rotation = rotation;
        this.VoiceRange = voiceRange;
        this.IsAlive = true;
        if (echo) this.Echo = new EchoEffect();
    }
}