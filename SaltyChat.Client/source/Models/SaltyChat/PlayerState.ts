import { Vector3 } from "alt-client";
import { MuffleEffect } from "./MuffleEffect";

export class PlayerState {
    public name: string;
    public position: Vector3;
    public voiceRange: number;
    public isAlive: boolean;
    public volumeOverride: number = null;
    public distanceCulled: boolean;
    public muffle: MuffleEffect;

    constructor(name: string, position?: Vector3, voiceRange?: number, isAlive?: boolean, distanceCulled: boolean = false, muffleIntensity: number = null, volumeOverride: number = null) {
        this.name = name;
        if (position) this.position = position;
        if (voiceRange) this.voiceRange = voiceRange;
        if (isAlive != null) this.isAlive = isAlive;
        this.distanceCulled = distanceCulled;
        if (muffleIntensity != null) this.muffle = new MuffleEffect(muffleIntensity);
        if (volumeOverride != null) {
            if (volumeOverride > 1.6) this.volumeOverride = 1.6;
            else if (volumeOverride < 0) this.volumeOverride = 0;
            else this.volumeOverride = volumeOverride;
        }
    }
}